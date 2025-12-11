'use client'

import React, { useRef, useEffect, useState } from 'react'

interface GreenScreenVideoProps {
  src: string
  className?: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
  greenThreshold?: number // 0-1, how sensitive to green (default: 0.4)
  greenSaturation?: number // 0-1, minimum saturation to consider green (default: 0.3)
  edgeSoftness?: number // 0-1, softness of the edge (default: 0.1)
}

export default function GreenScreenVideo({
  src,
  className = '',
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,
  greenThreshold = 0.4,
  greenSaturation = 0.3,
  edgeSoftness = 0.1,
}: GreenScreenVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const hasPlayedOnceRef = useRef(false)
  const isPingPongModeRef = useRef(false)
  const pingPongDirectionRef = useRef<'forward' | 'backward'>('forward')
  const pingPongAnimationFrameRef = useRef<number | null>(null)
  const lastDrawTimeRef = useRef(0)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    // Limit buffer to ~3 seconds @ 30fps
    const TARGET_FPS = 30 // Keep 30, but playback is dynamic
    const MS_PER_FRAME = 1000 / TARGET_FPS
    const MAX_BUFFER_FRAMES = TARGET_FPS * 3
    // Store data + timestamp to calculate true playback speed per frame
    const capturedFramesRef = { current: [] as { data: ImageData, timestamp: number }[] }
    const MAX_PROCESSING_WIDTH = 960 // Cap resolution for performance (960x540 is ~44% fewer pixels than 720p)

    // Set canvas size to match video
    // Set canvas size to match video but capped for performance
    const updateCanvasSize = () => {
      if (video.videoWidth && video.videoHeight) {
        // Calculate aspect ratio
        const aspect = video.videoWidth / video.videoHeight
        let w = video.videoWidth
        let h = video.videoHeight

        // Cap width if needed to prevent huge canvas operations on Safari
        if (w > MAX_PROCESSING_WIDTH) {
          w = MAX_PROCESSING_WIDTH
          h = w / aspect
        }

        canvas.width = w
        canvas.height = h
      } else if (video.clientWidth && video.clientHeight) {
        canvas.width = video.clientWidth
        canvas.height = video.clientHeight
      }
    }

    // Chroma key function to remove green
    const chromaKey = (imageData: ImageData) => {
      const data = imageData.data
      // Pre-calculate thresholds in 0-255 range to avoid division in loop
      const threshold = greenThreshold * 255
      const satThreshold = greenSaturation
      const edge = edgeSoftness * 255

      // Optimization: Cache length
      const len = data.length

      for (let i = 0; i < len; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        // Integer-based optimization (no division by 255)
        // Greenness: G - Max(R, B) > Threshold
        // Saturation: (Max - Min) / Max > SatThreshold
        //   => (Max - Min) > SatThreshold * Max

        let rbMax = r
        if (b > r) rbMax = b

        let gl = g
        let min = r
        if (g < min) min = g
        if (b < min) min = b

        let max = rbMax
        if (g > max) max = g

        // Greenness check
        const greenness = g - rbMax

        if (greenness > threshold) {
          // Saturation check
          // Avoid division: (max - min) / max > satThreshold  --> (max - min) > satThreshold * max
          // But 'max' can be 0.
          if (max !== 0 && (max - min) > (satThreshold * max)) {
            // It matches green screen
            // Calculate alpha
            // greenAmount = (greenness - threshold) / edge
            let greenAmount = (greenness - threshold) / edge
            if (greenAmount > 1) greenAmount = 1

            // Apply alpha
            data[i + 3] = (1 - greenAmount) * 255
          }
        }
      }
      return imageData
    }

    // Main render loop
    const drawFrame = () => {
      // If in PingPong mode, we handle drawing differently (from buffer)
      if (isPingPongModeRef.current) {
        // Handled by renderPingPongLoop
        return
      }

      const now = performance.now()
      const elapsed = now - lastDrawTimeRef.current

      // Throttle capture to TARGET_FPS
      if (elapsed < MS_PER_FRAME) {
        if (isPlaying && !isPingPongModeRef.current) {
          requestAnimationFrame(drawFrame)
        }
        return
      }

      // Adjust for drifting
      lastDrawTimeRef.current = now - (elapsed % MS_PER_FRAME)

      if (video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const processedData = chromaKey(imageData)
        ctx.putImageData(processedData, 0, 0)

        // Capture frames for the last 2 seconds
        if (video.duration) {
          const bufferStartTime = Math.max(0, video.duration - 2.2) // Start slightly earlier to be safe
          if (video.currentTime >= bufferStartTime) {
            // If we seeked back, clear future frames? No, just keep appending/overwriting?
            // Simplest: Just append. If we have too many, shift? where to slice?
            // Let's just keep appending unique frames.

            // We just capture everything near the end.
            // If the user watches, we fill the buffer.
            // We'll slice the last N frames when the loop starts.
            if (capturedFramesRef.current.length < MAX_BUFFER_FRAMES) {
              capturedFramesRef.current.push({ data: processedData, timestamp: now })
            } else {
              // Buffer full, rotate (keep latest)
              capturedFramesRef.current.shift()
              capturedFramesRef.current.push({ data: processedData, timestamp: now })
            }
          } else {
            // If we are far from end, clear buffer to save memory
            if (capturedFramesRef.current.length > 0) {
              capturedFramesRef.current = []
            }
          }
        }
      }

      if (isPlaying && !isPingPongModeRef.current) {
        requestAnimationFrame(drawFrame)
      }
    }

    // -------------------------------------------------------------------------
    // Buffered Playback Logic
    // -------------------------------------------------------------------------

    const startPingPongLoop = () => {
      if (pingPongAnimationFrameRef.current) cancelAnimationFrame(pingPongAnimationFrameRef.current)

      video.pause()

      const frames = capturedFramesRef.current
      if (frames.length === 0) {
        console.error("No frames buffered for ping pong loop!")
        return // Fail gracefully (video stays paused at end)
      }

      // We want to loop the "Last 2 Seconds".
      // Assuming 60fps, that's ~120 frames.
      // We have `frames` buffer which contains the last chunk of video played.
      // We'll use the entire buffer we captured, or limit to last 2s worth?
      // Since we clear buffer when far from end, the buffer SHOULD contain exactly the end sequence.

      let currentIndex = frames.length - 1
      let direction = 'backward'
      let lastFrameTime = performance.now()

      // Calculate dynamic playback speed
      // If we have N frames covering T milliseconds, the average frame interval is T / N
      let dynamicMsPerFrame = MS_PER_FRAME
      if (frames.length > 1) {
        const first = frames[0]
        const last = frames[frames.length - 1]
        const duration = last.timestamp - first.timestamp
        if (duration > 0) {
          dynamicMsPerFrame = duration / (frames.length - 1)
        }
      }

      // Sanity check: if dynamic speed is crazy, fallback to default
      if (dynamicMsPerFrame < 10 || dynamicMsPerFrame > 200) {
        dynamicMsPerFrame = MS_PER_FRAME
      }

      console.log('Starting Buffered Ping-Pong', {
        frames: frames.length,
        dynamicMsPerFrame,
        defaultMs: MS_PER_FRAME
      })

      const loop = () => {
        if (!isPingPongModeRef.current) return

        const now = performance.now()
        const elapsed = now - lastFrameTime

        if (elapsed > dynamicMsPerFrame) {
          lastFrameTime = now - (elapsed % dynamicMsPerFrame)

          // Draw current frame
          const frame = frames[currentIndex]
          if (frame) {
            ctx.putImageData(frame.data, 0, 0)
          }

          // Update index
          if (direction === 'backward') {
            currentIndex--
            if (currentIndex <= 0) {
              currentIndex = 0
              direction = 'forward'
            }
          } else {
            currentIndex++
            if (currentIndex >= frames.length - 1) {
              currentIndex = frames.length - 1
              direction = 'backward'
            }
          }
        }

        pingPongAnimationFrameRef.current = requestAnimationFrame(loop)
      }

      pingPongAnimationFrameRef.current = requestAnimationFrame(loop)
    }

    const handleLoadedMetadata = () => updateCanvasSize()

    // Trigger logic
    const handleTimeUpdate = () => {
      if (!isPingPongModeRef.current && !hasPlayedOnceRef.current && video.duration) {
        // Trigger slightly before actual end to transition smoothly
        // Or just at 'ended'.
        // Let's trust 'ended' primarily, but backup check close to end
        if (video.currentTime >= video.duration - 0.1 || video.ended) {
          triggerPingPong()
        }
      }
    }

    const handleEnded = () => {
      if (!isPingPongModeRef.current) {
        triggerPingPong()
      }
    }

    const triggerPingPong = () => {
      if (hasPlayedOnceRef.current) return

      console.log("Triggering Ping Pong Mode")
      hasPlayedOnceRef.current = true
      isPingPongModeRef.current = true
      setIsPlaying(true)
      video.pause()

      startPingPongLoop()
    }

    const handlePlay = () => {
      if (!isPingPongModeRef.current) {
        setIsPlaying(true)
        drawFrame()
      }
    }

    const handlePause = () => {
      if (!isPingPongModeRef.current) {
        setIsPlaying(false)
      }
    }

    const handleSeeking = () => {
      // If user seeks, we reset ping pong mode?
      // Simpler: If user seeks away from end, reset everything
      if (video.duration && video.currentTime < video.duration - 3) {
        isPingPongModeRef.current = false
        hasPlayedOnceRef.current = false
        capturedFramesRef.current = [] // Clear buffer
        if (pingPongAnimationFrameRef.current) {
          cancelAnimationFrame(pingPongAnimationFrameRef.current)
          pingPongAnimationFrameRef.current = null
        }
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('seeking', handleSeeking)

    if (video.readyState >= 2) {
      updateCanvasSize()
      if (!video.paused) {
        setIsPlaying(true)
        drawFrame()
      }
    }

    if (autoPlay && !hasPlayedOnceRef.current) {
      video.play().catch(e => console.log("Autoplay prevented", e))
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('seeking', handleSeeking)
      if (pingPongAnimationFrameRef.current) {
        cancelAnimationFrame(pingPongAnimationFrameRef.current)
      }
    }
  }, [isPlaying, greenThreshold, greenSaturation, edgeSoftness, autoPlay, loop, muted, src])

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Hidden video element */}
      <video
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        loop={false}
        muted={muted}
        playsInline
        preload="auto"
        className="absolute opacity-0 pointer-events-none"
      />

      {/* Canvas with chroma key applied */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        style={{ display: 'block' }}
      />

      {/* Optional: Show controls overlay */}
      {controls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          <button
            onClick={() => {
              if (videoRef.current) {
                if (isPlaying) {
                  videoRef.current.pause()
                } else {
                  videoRef.current.play()
                }
              }
            }}
            className="px-4 py-2 bg-black/70 text-white rounded-lg hover:bg-black/90 transition-colors"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      )}
    </div>
  )
}

