'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence, LayoutGroup } from 'framer-motion'
import VideoOverlayContainer from './VideoOverlayContainer'

export default function ChatGptIntegrationSection() {
    // idle -> icon-entry -> icon-spinning -> icon-moving -> header-settled -> initial-overlay -> text-exiting -> video-fading-in -> video-playing -> showing-bullets -> overlay-loop
    const [stage, setStage] = useState<'idle' | 'icon-entry' | 'icon-spinning' | 'icon-moving' | 'header-settled' | 'initial-overlay' | 'text-exiting' | 'video-fading-in' | 'video-playing' | 'showing-bullets' | 'overlay-loop'>('idle')
    const containerRef = useRef(null)
    const inView = useInView(containerRef, { once: true, amount: 0.5 })
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        // Track viewport size so we can keep the icon from overscaling on mobile
        const updateIsMobile = () => setIsMobile(window.innerWidth < 640)
        updateIsMobile()
        window.addEventListener('resize', updateIsMobile)
        return () => window.removeEventListener('resize', updateIsMobile)
    }, [])

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

            // 4. Header Settled -> Show Initial Overlay
            setTimeout(() => {
                setStage('initial-overlay')
            }, 3800)

            // 5. Initial Overlay -> Text Exiting (Wait for read)
            setTimeout(() => {
                setStage('text-exiting')
            }, 5300) // Show initial text for 1.5s
        }
    }, [inView, stage])

    // Effect to handle transitions from text-exiting -> video-fading-in -> video-playing
    useEffect(() => {
        if (stage === 'text-exiting') {
            // Wait for text exit animation (0.8s) + buffer
            setTimeout(() => {
                setStage('video-fading-in')
            }, 1000)
        } else if (stage === 'video-fading-in') {
            // Wait for video fade in (transition-opacity duration-500) + buffer
            setTimeout(() => {
                setStage('video-playing')
            }, 600)
        }
    }, [stage])

    const handleVideoEnded = () => {
        setStage('showing-bullets')

        // Show bullets for a duration (e.g., 6 seconds to read), then move to final overlay
        setTimeout(() => {
            setStage('overlay-loop')

            // Show final text for 1.5 seconds, then restart sequence (text-exiting -> video-fading-in -> video-playing)
            setTimeout(() => {
                setStage('text-exiting')
            }, 1500)
        }, 8000)
    }

    const isHeaderState = stage !== 'idle' && stage !== 'icon-entry' && stage !== 'icon-spinning'
    const isTextTyping = isHeaderState

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

    const bullets = [
        "After an intense rabbit hole, send key insights into Memsurf.",
        "Interact with files in ChatGPT, extract what you want into Memsurf to learn it better.",
        "Use ChatGPT as your interface, use Memsurf as your retention layer."
    ]

    // Video container visibility: visible during video playing, bullets, loop (but NOT during text-exiting initially? No, we want the container to be there, but maybe the video invisible?)
    // Actually, we want the container frame to be visible always after 'header-settled' or 'initial-overlay'?
    // The previous code had: animate={{ opacity: isCardVisible ? 1 : 0 }}
    // where isCardVisible = initial-overlay || video-playing || showing-bullets || overlay-loop
    // We want the CARD to be visible during text-exiting too, but the VIDEO content to be hidden?
    // Let's keep the CARD visible from initial-overlay onwards.
    const isCardVisible = stage !== 'idle' && stage !== 'icon-entry' && stage !== 'icon-spinning' && stage !== 'icon-moving' && stage !== 'header-settled'

    // Video content visibility: Only visible when fading in, playing, or showing bullets (if we want bg).
    // The user wants: "video fades in after text disappears".
    // So video should be hidden during 'initial-overlay' and 'text-exiting' (or at least fading IN during video-fading-in).
    // isVideoVisible true for: video-fading-in, video-playing
    // REMOVED 'showing-bullets' so video fades out before bullets appear.
    const isVideoVisible = stage === 'video-fading-in' || stage === 'video-playing'

    // Overlay text visibility
    const isOverlayTextVisible = stage === 'initial-overlay' || stage === 'overlay-loop'

    return (
        <LayoutGroup id="chatgpt-integration">
            <div id="chatgpt-integration-section" ref={containerRef} className="relative w-full flex flex-col items-center">

                {/* Header Layout Reservation */}
                <div className="flex items-center gap-4 mb-0 md:mb-8 h-auto min-h-[5rem] md:h-32 w-full justify-center md:justify-start">
                    {/* Only render Icon here when in header state */}
                    {isHeaderState && (
                        <div className="flex items-center gap-8 ml-4">
                            <motion.img
                                layoutId="openai-icon"
                                layout
                                src="/logos/OpenAI-black-monoblossom.svg"
                                alt="OpenAI Logo"
                                className="w-20 h-20 md:w-24 md:h-24 origin-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, scale: isMobile ? 1.1 : 1.3 }}
                                transition={{
                                    layout: { duration: 0.9, ease: "easeInOut" },
                                    type: "spring",
                                    stiffness: 50,
                                    damping: 20,
                                    opacity: { duration: 0.4 }
                                }}
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
                        animate={{ opacity: isCardVisible ? 1 : 0 }} // Only visible when active
                        transition={{ duration: 1 }}
                    >
                        <VideoOverlayContainer
                            className="w-full"
                            shouldPlay={stage === 'video-playing'}
                            isVideoVisible={isVideoVisible}
                            onEnded={handleVideoEnded}
                        >
                            <AnimatePresence mode="wait">
                                {/* Bullet Points Overlay */}
                                {stage === 'showing-bullets' && (
                                    <motion.div
                                        key="bullets"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex items-center justify-center z-40 px-8 py-12 pointer-events-none"
                                    >
                                        <div className="flex flex-col gap-6 max-w-3xl">
                                            {bullets.map((bullet, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.8 + (index * 2.5), duration: 0.5 }} // Stagger appearance + delay for video fadeout
                                                    className="flex items-start gap-4"
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-gray-400 mt-2.5 shrink-0" />
                                                    <p className="text-xl md:text-3xl font-medium text-gray-900 leading-relaxed">
                                                        {bullet}
                                                    </p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Overlay Text Step (Final/Initial) */}
                                {isOverlayTextVisible && (
                                    <motion.div
                                        key="final-text"
                                        className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.8 }}
                                    >
                                        <p className="text-3xl md:text-5xl font-medium text-gray-900 text-center px-4">
                                            From any chat, send to Memsurf.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </VideoOverlayContainer>
                    </motion.div>

                    {/* The Centered Icon (For Entry/Spinning) */}
                    <AnimatePresence>
                        {!isHeaderState && stage !== 'idle' && (
                            <motion.div
                                key="floating-icon"
                                className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <motion.img
                                    layoutId="openai-icon"
                                    layout
                                    src="/logos/OpenAI-black-monoblossom.svg"
                                    alt="OpenAI Logo"
                                    className="w-20 h-20 md:w-24 md:h-24"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{
                                        scale: isMobile ? 1.1 : 1.3, // Bigger scale, capped on all viewports
                                        rotate: stage === 'icon-spinning' ? 360 : 0
                                    }}
                                    transition={{
                                        layout: { duration: 0.9, ease: "easeInOut" },
                                        scale: { duration: 0.8, ease: "easeOut" }, // Faster appear
                                        opacity: { duration: 0.4 },
                                        rotate: {
                                            duration: stage === 'icon-spinning' ? 1.5 : 1.5,
                                            repeat: stage === 'icon-spinning' ? Infinity : 0,
                                            ease: "linear"
                                        }
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </LayoutGroup>
    )
}
