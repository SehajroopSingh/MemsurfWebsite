'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { MEMSURF_LOADING_GRADIENT } from '@/lib/homepageLoadProgress'

type HomepageLoadingSplashProps = {
  onLogoReady: () => void
  progress: number
}

export default function HomepageLoadingSplash({
  onLogoReady,
  progress,
}: HomepageLoadingSplashProps) {
  const shouldReduceMotion = useReducedMotion()
  const reduceMotion = Boolean(shouldReduceMotion)
  const [entered, setEntered] = useState(reduceMotion)

  useEffect(() => {
    if (reduceMotion) {
      setEntered(true)
      return
    }
    const frame = window.requestAnimationFrame(() => setEntered(true))
    return () => window.cancelAnimationFrame(frame)
  }, [reduceMotion])

  const clampedProgress = Math.max(0, Math.min(100, progress))

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-auto max-[640px]:left-1/2 max-[640px]:right-auto max-[640px]:w-[620px] max-[640px]:-translate-x-1/2 isolate [contain:strict]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.2 : 0.5, ease: 'easeOut' }}
      aria-label="Loading MemSurf"
      role="status"
    >
      <div
        className={`flex flex-col items-center justify-center gap-8 will-change-transform transition-[transform,opacity] duration-700 ease-out motion-reduce:transition-none ${
          entered ? 'scale-100 opacity-100' : 'scale-[0.92] opacity-0'
        }`}
      >
        <Image
          src="/memsurf-logo.svg"
          alt="MemSurf"
          width={280}
          height={280}
          priority
          className="h-[min(280px,52vw)] w-[min(280px,52vw)] drop-shadow-[0_18px_48px_rgba(0,0,0,0.38)]"
          onLoad={onLogoReady}
          onError={onLogoReady}
        />

        <div
          className="w-[min(280px,72vw)]"
          role="progressbar"
          aria-valuenow={Math.round(clampedProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Loading progress"
        >
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/12">
            <div
              className="h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none"
              style={{
                width: `${clampedProgress}%`,
                backgroundImage: MEMSURF_LOADING_GRADIENT,
                boxShadow: '0 0 14px rgba(132, 170, 225, 0.55)',
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
