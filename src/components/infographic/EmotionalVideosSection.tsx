'use client'

import React, { useRef, useState, useEffect, useMemo } from 'react'
import { motion, useScroll, useTransform, MotionValue, useMotionValueEvent } from 'framer-motion'
import Image from 'next/image'
import EmotionalVideosSectionMobile from './EmotionalVideosSectionMobile'

const IMAGES = [
    '/EmotionImageFolders/image-1.png',
    '/EmotionImageFolders/image-2.png',
    '/EmotionImageFolders/image-3.png',
    '/EmotionImageFolders/image-4.png',
    '/EmotionImageFolders/image-5.png',
    '/EmotionImageFolders/image-6.png',
    '/EmotionImageFolders/image-7.png',
    '/EmotionImageFolders/image-8.png'
]

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

interface CardProps {
    src: string
    index: number
    progress: MotionValue<number>
    range: [number, number]
    maxRadius: string
    x: MotionValue<string> | string
    isMobile: boolean
}

const Card = ({ src, index, progress, range, maxRadius, x, isMobile }: CardProps) => {
    // Reveal via clip-path circle expansion
    // 0% -> 0% radius
    // 100% -> maxRadius
    const radius = useTransform(progress, [range[0], range[1]], ['0%', maxRadius])

    const clipPath = useTransform(radius, (r) => `circle(${r} at 50% 50%)`)

    // Responsive Styles
    const width = isMobile ? '100vw' : '60vw'
    const left = isMobile ? '0' : '42%' // On mobile: 0 (Centered). On desktop: pulled left to align with purple card

    return (
        <motion.div
            style={{
                clipPath,
                x,
                zIndex: index,
                left,
                width,
                top: '50%',
                y: '-50%', // Vertically centered
            }}
            className="absolute flex items-center justify-center pointer-events-none"
        >
            {/* 
                Constrained Height: h-[75vh]
            */}
            <div className="relative w-full h-[75vh] rounded-3xl shadow-2xl overflow-hidden bg-black">
                <Image
                    src={src}
                    alt={`Emotional graphic ${index}`}
                    fill
                    className="object-cover"
                    priority={index === 1}
                    unoptimized
                />
            </div>
        </motion.div>
    )
}

export default function EmotionalVideosSection() {
    const containerRef = useRef<HTMLDivElement>(null)

    // Use offset that ensures animation completes while sticky element is in view
    // 'start center' to 'end center' makes animation happen in the middle of scroll
    // This ensures the sticky element stays visible during the entire animation
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start center', 'end center']
    })

    // --- Responsive Check ---
    const [isMobile, setIsMobile] = useState(false)
    const [hasCheckedViewport, setHasCheckedViewport] = useState(false)
    const [activeHeadlineIndex, setActiveHeadlineIndex] = useState(0)

    // Keep original order; headline 8 (night) stays last
    const reorderedImages = useMemo(() => IMAGES, [])
    const reorderedHeadlines = useMemo(() => HEADLINES, [])

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024) // 1024px breakpoint (lg)
        }
        checkMobile()
        setHasCheckedViewport(true)
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // --- Transition Constants ---
    const TRANSITION_START = 0.3
    const TRANSITION_END = 0.4

    // --- Global X Shift ---
    // Desktop: Moves from Right Center to Left Center (-50vw).
    // range: [TRANSITION_START, TRANSITION_END] (0.3 -> 0.4)
    // output: ['0vw', '-50vw']
    const globalShiftX = useTransform(
        scrollYProgress,
        [TRANSITION_START, TRANSITION_END],
        ['0vw', '-40vw']
    )

    // --- Text Opacity ---
    const leftTextOpacity = useTransform(scrollYProgress, [TRANSITION_START, TRANSITION_END], [1, 0])
    const rightTextOpacity = useTransform(scrollYProgress, [TRANSITION_START + 0.05, TRANSITION_END + 0.05], [0, 1])

    // Border draw animation (disabled)
    // const borderTopProgress = useTransform(scrollYProgress, [0, 0.1], [0, 1])
    // const borderSideProgress = useTransform(scrollYProgress, [0.1, 0.25], [0, 1])
    // const borderBottomProgress = useTransform(scrollYProgress, [0.25, 0.5], [0, 1])
    // const topWidth = useTransform(borderTopProgress, (p) => `${p * 100}%`)
    // const sideHeight = useTransform(borderSideProgress, (p) => `${p * 100}%`)
    // const bottomHalfWidth = useTransform(borderBottomProgress, (p) => `${p * 55}%`)

    // Track which headline to show based on scroll progress
    useMotionValueEvent(scrollYProgress, 'change', (value) => {
        if (!reorderedImages.length) return
        const idx = Math.min(reorderedImages.length - 1, Math.max(0, Math.floor(value * reorderedImages.length)))
        setActiveHeadlineIndex(idx)
    })
    const headlineForIndex = (idx: number) =>
        reorderedHeadlines[idx] ?? `Emotional moment ${idx + 1}`
    const currentHeadline = reorderedImages.length
        ? headlineForIndex(Math.min(activeHeadlineIndex, reorderedImages.length - 1))
        : ''

    // --- Mobile-Only Layout ---
    if (hasCheckedViewport && isMobile) {
        return <EmotionalVideosSectionMobile images={IMAGES} containerRef={containerRef} />
    }

    return (
        <section ref={containerRef} className={`relative ${isMobile ? 'h-[2000vh]' : 'h-[1000vh]'} bg-white w-full`} style={{ zIndex: 40 }}>
            <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center z-50">

                {/* Soft background card behind text and images (sized to content height) */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center px-4 lg:px-12 pointer-events-none z-0">
                    <div className="w-full max-w-[95vw] xl:max-w-[1400px] mx-auto min-h-[380px] rounded-3xl bg-[#8c648d] backdrop-blur-sm border border-white/40 shadow-[0_20px_60px_rgba(0,0,0,0.12)]" />
                </div>

                {/* Text Grid Layer */}
                <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-center px-2 sm:px-4 lg:px-12 max-w-[95vw] xl:max-w-[1400px] mx-auto pointer-events-none z-[60] text-white">

                    {/* Left Column Text (Below Images on Desktop) */}
                    <motion.div
                        style={{ opacity: leftTextOpacity, zIndex: 10 }}
                        className="flex flex-col justify-center lg:max-w-none lg:pl-2 lg:pr-0 w-full"
                    >
                        <h2 className={`text-2xl md:text-4xl font-bold tracking-tight text-white mb-4 leading-tight ${isMobile ? 'opacity-20' : ''}`}>
                            {currentHeadline}
                        </h2>
                        {!isMobile && reorderedImages.length > 0 && (
                            <p className="text-lg text-gray-200">Moments you wanted to keep.</p>
                        )}
                    </motion.div>

                    {/* Right Column Text (Visible after swap) */}
                    <motion.div
                        style={{ opacity: rightTextOpacity, zIndex: 100 }}
                        className="flex flex-col justify-center items-end w-full lg:text-right lg:pr-0 lg:pl-0"
                    >
                        <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white mb-4 leading-tight text-right">
                            {currentHeadline}
                        </h2>
                    </motion.div>
                </div>

                {/* Images Layer */}
                <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
                    <div className="relative w-full h-full px-2 sm:px-4 lg:px-12 max-w-[95vw] xl:max-w-[1400px] mx-auto">
                    {reorderedImages.map((src, i) => {
                        // On mobile, use wider ranges so animations complete faster
                        const rangeSize = isMobile ? 0.15 : 0.1
                        const start = 0.1 + (i * (isMobile ? 0.12 : 0.1))

                        let maxRadius = '260%'
                        // On Mobile, if we want to fill usage more, maybe larger radius? 
                        // But 42% of 100vw is 84vw width. That's a good "Center" size.

                        // Conditionals for Desktop Motion
                        // If Mobile: x is always 0.
                        // If Desktop: Use globalShiftX logic.

                        let x: MotionValue<string> | string = isMobile ? '0vw' : globalShiftX

                        if (i < 3) {
                            maxRadius = '42%'
                        } else if (i === 3) {
                            // Transition Card
                            maxRadius = '360%'
                        } else {
                            // Images 4+ (Left Side on Desktop)
                            maxRadius = '360%'
                            if (!isMobile) x = '-50vw'
                        }

                        // Optimization for static post-transition state on desktop
                        if (!isMobile && i > 3) x = '-40vw'

                        return (
                            <Card
                                key={i} index={i + 1} src={src} progress={scrollYProgress} range={[start - rangeSize, start]}
                                maxRadius={maxRadius} x={x} isMobile={isMobile}
                            />
                        )
                    })}
                    </div>
                </div>

                {/* Animated border drawing around the section (disabled) */}
                {false && (
                    <div className="absolute inset-0 pointer-events-none z-30 max-w-[95vw] xl:max-w-[1400px] mx-auto rounded-[32px]">
                        <motion.div
                            className="absolute top-0 left-1/2 h-[12px] bg-[#8c648d]"
                            style={{ translateX: '-50%', borderRadius: '9999px' }}
                        />
                        <motion.div
                            className="absolute left-0 top-0 w-[12px] bg-[#8c648d]"
                            style={{ borderRadius: '9999px' }}
                        />
                        <motion.div
                            className="absolute right-0 top-0 w-[12px] bg-[#8c648d]"
                            style={{ borderRadius: '9999px' }}
                        />
                        <motion.div
                            className="absolute bottom-0 left-0 h-[12px] bg-[#8c648d]"
                            style={{ borderRadius: '9999px' }}
                        />
                        <motion.div
                            className="absolute bottom-0 right-0 h-[12px] bg-[#8c648d]"
                            style={{ borderRadius: '9999px' }}
                        />
                    </div>
                )}

            </div>

        </section>
    )
}
