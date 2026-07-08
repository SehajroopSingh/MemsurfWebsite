'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type HomepageLoadingSplashProps = {
  onLogoReady: () => void
}

const LAUNCH_VIDEO_SRC = '/videos/launch-butterfly.mp4#t=0.6'
const LAUNCH_VIDEO_START_SECONDS = 0.6
const LAUNCH_EDGE_BACKGROUND = '#f6fbfb'
const LAUNCH_VIDEO_WIDTH = 1280
const LAUNCH_VIDEO_HEIGHT = 720
const DEFAULT_DEVICE_PIXEL_RATIO = 2

function getLaunchDevicePixelRatio() {
  if (typeof window === 'undefined') {
    return DEFAULT_DEVICE_PIXEL_RATIO
  }

  return Math.max(window.devicePixelRatio || 1, 1)
}

export default function HomepageLoadingSplash({ onLogoReady }: HomepageLoadingSplashProps) {
  const shouldReduceMotion = useReducedMotion()
  const reduceMotion = Boolean(shouldReduceMotion)
  const hasMarkedReadyRef = useRef(false)
  const hasRevealedVideoRef = useRef(false)
  const [devicePixelRatio, setDevicePixelRatio] = useState(getLaunchDevicePixelRatio)

  useEffect(() => {
    const updateDevicePixelRatio = () => {
      setDevicePixelRatio(getLaunchDevicePixelRatio())
    }

    updateDevicePixelRatio()
    window.addEventListener('resize', updateDevicePixelRatio)

    return () => {
      window.removeEventListener('resize', updateDevicePixelRatio)
    }
  }, [])

  const markReady = useCallback(() => {
    if (hasMarkedReadyRef.current) {
      return
    }

    hasMarkedReadyRef.current = true
    onLogoReady()
  }, [onLogoReady])

  const revealVideo = useCallback((video: HTMLVideoElement) => {
    if (hasRevealedVideoRef.current) {
      return
    }

    hasRevealedVideoRef.current = true
    markReady()

    if (reduceMotion) {
      video.pause()
      return
    }

    const playResult = video.play()
    if (playResult) {
      playResult.catch(() => {
        video.pause()
      })
    }
  }, [markReady, reduceMotion])

  useEffect(() => {
    const fallbackTimer = window.setTimeout(markReady, 1800)
    return () => window.clearTimeout(fallbackTimer)
  }, [markReady])

  const handleLoadedMetadata = useCallback((event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget

    try {
      if (video.duration > LAUNCH_VIDEO_START_SECONDS) {
        video.currentTime = LAUNCH_VIDEO_START_SECONDS
      } else {
        revealVideo(video)
      }
    } catch {
      // Some browsers can reject precise media seeks during startup; playback still works.
      revealVideo(video)
    }
  }, [revealVideo])

  const handleLoadedData = useCallback((event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget
    if (video.currentTime >= LAUNCH_VIDEO_START_SECONDS - 0.05) {
      revealVideo(video)
    }
  }, [revealVideo])

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-auto isolate [contain:strict]"
      style={{ backgroundColor: LAUNCH_EDGE_BACKGROUND }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.2 : 0.45, ease: 'easeOut' }}
      aria-label="Loading MemSurf"
      role="status"
    >
      <video
        aria-hidden="true"
        width={LAUNCH_VIDEO_WIDTH}
        height={LAUNCH_VIDEO_HEIGHT}
        className="h-auto w-auto object-contain"
        style={{
          aspectRatio: '16 / 9',
          width: `min(100vw, ${LAUNCH_VIDEO_WIDTH / devicePixelRatio}px)`,
          maxWidth: `min(100vw, ${LAUNCH_VIDEO_WIDTH / devicePixelRatio}px)`,
          maxHeight: `min(100vh, ${LAUNCH_VIDEO_HEIGHT / devicePixelRatio}px)`,
        }}
        src={LAUNCH_VIDEO_SRC}
        muted
        playsInline
        autoPlay={!reduceMotion}
        preload="auto"
        onLoadedMetadata={handleLoadedMetadata}
        onLoadedData={handleLoadedData}
        onSeeked={(event) => revealVideo(event.currentTarget)}
        onPlaying={(event) => revealVideo(event.currentTarget)}
        onTimeUpdate={(event) => {
          if (event.currentTarget.currentTime >= LAUNCH_VIDEO_START_SECONDS - 0.05) {
            revealVideo(event.currentTarget)
          }
        }}
        onError={markReady}
      />
    </motion.div>
  )
}
