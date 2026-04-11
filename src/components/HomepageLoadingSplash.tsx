'use client'

import React from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

type HomepageLoadingSplashProps = {
  onLogoReady: () => void
}

export default function HomepageLoadingSplash({ onLogoReady }: HomepageLoadingSplashProps) {
  const shouldReduceMotion = useReducedMotion()
  const reduceMotion = Boolean(shouldReduceMotion)

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-auto"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.2 : 0.7, ease: 'easeOut' }}
      aria-label="Loading MemSurf"
      role="status"
    >
      <motion.div
        className="flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.88, filter: 'blur(8px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.9, filter: 'blur(7px)' }}
        transition={{ duration: reduceMotion ? 0.2 : 0.8, ease: 'easeOut' }}
      >
        <Image
          src="/memsurf-logo.svg"
          alt="MemSurf"
          width={220}
          height={220}
          priority
          className="h-[220px] w-[220px] drop-shadow-[0_22px_60px_rgba(0,0,0,0.42)]"
          onLoad={onLogoReady}
          onError={onLogoReady}
        />
      </motion.div>
    </motion.div>
  )
}
