'use client'

import React, { RefObject, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const HEADLINES = [
  "You wake up. Shower running. A health thought crosses your mind. You'll remember it later.",
  'Coffee is hot. You are reading an article. One data surprises you. You take a screenshot.',
  'Driving to work. An insight clicks. Hands on the wheel. You record a quick note.',
  'Lunch break. You decide to learn something new. You read. You focus. You decide to take notes. You never look at them again.',
  "Afternoon. Meeting starts. You're prepared, you know you are. There was a detail, an example, something you learned recently, that would have made you sound sharp. Like the person who's ready for the promotion. When you need it the most it doesn't come back.",
  'Supermarket aisle. Cart half-full. You know there was a nutrition tip you wanted to follow. You forgot where you saved it. Now would be a good time to remember it.',
  "Evening. Podcast on while cooking. A funny joke lands. You tell yourself: this one I'll remember. You smile. Tomorrow's date will laugh at this.",
  'Night. In bed. Your mind reaches for things it knows are there but cannot pull back.'
]

interface EmotionalVideosSectionMobileProps {
  images: string[]
  containerRef?: RefObject<HTMLElement>
}

export default function EmotionalVideosSectionMobile({
  images,
  containerRef
}: EmotionalVideosSectionMobileProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const cappedImages = useMemo(() => images.slice(0, 8), [images])

  const headlines = useMemo(
    () =>
      cappedImages.map((_, idx) => HEADLINES[idx] ?? `Emotional moment ${idx + 1}`),
    [cappedImages]
  )

  useEffect(() => {
    if (cappedImages.length === 0) return
    setActiveIndex((prev) => Math.min(prev, cappedImages.length - 1))
  }, [cappedImages.length])

  useEffect(() => {
    if (cappedImages.length <= 1) return

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cappedImages.length)
    }, 4000) // 4s per image

    return () => clearInterval(interval)
  }, [cappedImages.length])

  const handleDotClick = (idx: number) => {
    setActiveIndex(idx)
  }

  const safeIndex = cappedImages.length ? activeIndex % cappedImages.length : 0
  const headline = headlines[safeIndex] ?? headlines[0] ?? ''

  return (
    <section
      ref={containerRef as RefObject<HTMLDivElement>}
      className="relative bg-white w-full py-14"
      style={{ zIndex: 40 }}
    >
      <div className="max-w-4xl mx-auto px-4 flex flex-col gap-8">
        <div className="flex flex-col items-center text-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 leading-tight h-[240px] max-h-[240px] flex items-center justify-center text-center overflow-hidden">
            {headline}
          </h2>
        </div>

        <div className="relative w-full aspect-square rounded-3xl shadow-2xl overflow-hidden bg-gray-900/5">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={cappedImages[safeIndex]}
              initial={{ opacity: 0.25, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <Image
                src={cappedImages[safeIndex]}
                alt={`Emotional graphic ${safeIndex + 1}`}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-3">
          {cappedImages.map((_, idx) => {
            const isActive = idx === safeIndex

            return (
              <button
                key={`dot-${idx}`}
                type="button"
                onClick={() => handleDotClick(idx)}
                className="group relative h-4 w-4 rounded-full border border-gray-300 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 focus:ring-indigo-300"
                aria-label={`Go to image ${idx + 1}`}
              >
                <div className="absolute inset-0 rounded-full overflow-hidden bg-gray-100">
                  <motion.div
                    key={`${activeIndex}-${idx}`}
                    initial={{ width: isActive ? '0%' : '0%' }}
                    animate={{ width: isActive ? '100%' : '0%' }}
                    transition={{ duration: 4, ease: 'linear' }}
                    className="h-full bg-gray-900/80"
                  />
                </div>
              </button>
            )
          })}
        </div>

      </div>

      {/* Soft fade into the next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent via-white/70 to-white" />
    </section>
  )
}
