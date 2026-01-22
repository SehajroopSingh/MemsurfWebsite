'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import VideoOverlayContainer from './VideoOverlayContainer'

export default function ChatGptIntegrationSection() {
    // idle -> icon-entry -> icon-spinning -> icon-moving -> header-settled -> overlay-text -> video-pre-entry -> video-playing
    const [stage, setStage] = useState<'idle' | 'icon-entry' | 'icon-spinning' | 'icon-moving' | 'header-settled' | 'overlay-text' | 'video-pre-entry' | 'video-playing'>('idle')
    const containerRef = useRef(null)
    const inView = useInView(containerRef, { once: true, amount: 0.5 })

    useEffect(() => {
        if (inView && stage === 'idle') {
            // Start sequence
            setStage('icon-entry')

            // 1. Entry: Fast fade in and grow (0.8s)
            setTimeout(() => {
                setStage('icon-spinning')
            }, 800)

            // 2. Spinning: Spin for a bit
            setTimeout(() => {
                setStage('icon-moving')
            }, 2000)

            // 3. Moving: Move to header
            setTimeout(() => {
                setStage('header-settled')
            }, 3000)

            // 4. Header Settled -> Show Overlay Text
            setTimeout(() => {
                setStage('overlay-text')
            }, 3800) // Give it a moment after settling

            // 5. Overlay Text -> Text Exit (Video Pre-Entry)
            setTimeout(() => {
                setStage('video-pre-entry')
            }, 7000) // Show text for ~3 seconds

            // 6. Video Pre-Entry -> Play Video
            setTimeout(() => {
                setStage('video-playing')
            }, 9000) // 2 seconds after text starts fading out (0.8s fade out)
        }
    }, [inView, stage])

    const isHeaderState = stage === 'icon-moving' || stage === 'header-settled' || stage === 'overlay-text' || stage === 'video-pre-entry' || stage === 'video-playing'
    const isTextTyping = stage === 'header-settled' || stage === 'overlay-text' || stage === 'video-pre-entry' || stage === 'video-playing'

    // Typewriter effect variants
    const sentence = "ChatGPT Integration"
    const words = sentence.split(" ")

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08, // Slower typing speed
                delayChildren: 0.5 // Wait a bit before starting
            }
        }
    }

    const letterVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <div ref={containerRef} className="relative w-full flex flex-col items-center">

            {/* Header Layout Reservation */}
            <div className="flex items-center gap-4 mb-0 md:mb-8 h-auto min-h-[5rem] md:h-32 w-full justify-center md:justify-start">
                {/* Only render Icon here when in header state */}
                {isHeaderState && (
                    <div className="flex items-center gap-8 ml-4">
                        <motion.img
                            layoutId="openai-icon"
                            src="/logos/OpenAI-black-monoblossom.svg"
                            alt="OpenAI Logo"
                            className="w-20 h-20 md:w-24 md:h-24 origin-center"
                            animate={{ scale: 1.6 }} // Keep it big
                            transition={{ type: "spring", stiffness: 50, damping: 20 }}
                        />
                        <motion.h2
                            variants={containerVariants}
                            initial="hidden"
                            animate={isTextTyping ? "visible" : "hidden"}
                            className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight flex flex-wrap"
                        >
                            {words.map((word, wordIndex) => (
                                <span key={wordIndex} className="inline-block whitespace-nowrap mr-[0.25em]">
                                    {word.split("").map((char, charIndex) => (
                                        <motion.span
                                            key={charIndex}
                                            variants={letterVariants}
                                            className="inline-block"
                                        >
                                            {char}
                                        </motion.span>
                                    ))}
                                </span>
                            ))}
                        </motion.h2>
                    </div>
                )}
            </div>

            {/* Video Container Area */}
            <div className="relative w-full flex items-center justify-center min-h-[400px]">
                {/* The Actual Video Container */}
                <motion.div
                    className="w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: stage === 'video-playing' ? 1 : 0 }}
                    transition={{ duration: 1 }}
                >
                    <VideoOverlayContainer className="w-full" shouldPlay={stage === 'video-playing'} />
                </motion.div>

                {/* Overlay Text Step */}
                <AnimatePresence mode="wait">
                    {stage === 'overlay-text' && (
                        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.8 }}
                                className="text-3xl md:text-5xl font-medium text-gray-600 text-center px-4"
                            >
                                From any chat, send to Memsurf.
                            </motion.p>
                        </div>
                    )}
                </AnimatePresence>

                {/* The Centered Icon (For Entry/Spinning) */}
                {!isHeaderState && stage !== 'idle' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                        <motion.img
                            layoutId="openai-icon"
                            src="/logos/OpenAI-black-monoblossom.svg"
                            alt="OpenAI Logo"
                            className="w-20 h-20 md:w-24 md:h-24"
                            initial={{ scale: 0, opacity: 0, rotate: -180 }}
                            animate={{
                                scale: 1.6, // Bigger scale
                                opacity: 1,
                                rotate: stage === 'icon-spinning' ? 360 : 0
                            }}
                            transition={{
                                scale: { duration: 0.8, ease: "easeOut" }, // Faster appear
                                opacity: { duration: 0.5 },
                                rotate: {
                                    duration: stage === 'icon-spinning' ? 1.5 : 1.5,
                                    repeat: stage === 'icon-spinning' ? Infinity : 0,
                                    ease: "linear"
                                }
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
