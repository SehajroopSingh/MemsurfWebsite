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

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    // Limit buffer to ~3 seconds @ 60fps to prevent OOM
    const MAX_BUFFER_FRAMES = 180
    const capturedFramesRef = { current: [] as ImageData[] }

    // Set canvas size to match video
    const updateCanvasSize = () => {
      if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      } else if (video.clientWidth && video.clientHeight) {
        canvas.width = video.clientWidth
        canvas.height = video.clientHeight
      }
    }

    // Chroma key function to remove green
    const chromaKey = (imageData: ImageData) => {
      const data = imageData.data
      const threshold = greenThreshold
      const satThreshold = greenSaturation
      const edge = edgeSoftness

      // Standard green screen color (RGB: 0, 177, 64 or similar)
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] / 255
        const g = data[i + 1] / 255
        const b = data[i + 2] / 255

        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        const saturation = max === 0 ? 0 : (max - min) / max
        const greenness = g - Math.max(r, b)

        if (greenness > threshold && saturation > satThreshold && g > r && g > b) {
          const greenAmount = Math.min(1, (greenness - threshold) / edge)
          data[i + 3] = (1 - greenAmount) * 255
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
              capturedFramesRef.current.push(processedData)
            } else {
              // Buffer full, rotate (keep latest)
              capturedFramesRef.current.shift()
              capturedFramesRef.current.push(processedData)
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
      const fps = 30 // Playback fps for the loop (or estimate from capture?)
      // We'll try to match capture rate roughly (one frame per RAF is usually 60fps)
      // If we captured at 60fps, we play at 60fps.
      const msPerFrame = 1000 / 60

      console.log('Starting Buffered Ping-Pong', { frames: frames.length })

      const loop = () => {
        if (!isPingPongModeRef.current) return

        const now = performance.now()
        const elapsed = now - lastFrameTime

        if (elapsed > msPerFrame) {
          lastFrameTime = now - (elapsed % msPerFrame)

          // Draw current frame
          const frame = frames[currentIndex]
          if (frame) {
            ctx.putImageData(frame, 0, 0)
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
        className="hidden"
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

