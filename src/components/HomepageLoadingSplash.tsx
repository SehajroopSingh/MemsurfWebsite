'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

type HomepageLoadingSplashProps = {
  onLogoReady: () => void
}

export default function HomepageLoadingSplash({ onLogoReady }: HomepageLoadingSplashProps) {
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

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-auto isolate [contain:strict]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.2 : 0.45, ease: 'easeOut' }}
      aria-label="Loading MemSurf"
      role="status"
    >
      <div
        className={`will-change-transform transition-[transform,opacity] duration-500 ease-out motion-reduce:transition-none ${
          entered ? 'scale-100 opacity-100' : 'scale-[0.94] opacity-0'
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
      </div>
    </motion.div>
  )
}
