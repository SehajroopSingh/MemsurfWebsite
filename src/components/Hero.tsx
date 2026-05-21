'use client'

import React from 'react'
import { motion } from 'framer-motion'
import WorkflowAnimation from './infographic/WorkflowAnimation'
import PhoneHeroMockup from './hero/PhoneHeroMockup'
import StoreBadges from './StoreBadges'
import SocialGlassButtons from './SocialGlassButtons'

// import RippleBackground from './RippleBackground'

type HeroProps = {
    isRevealed?: boolean
    mountHeavyAssets?: boolean
    onPhoneReady?: () => void
    onCollageReady?: () => void
    onCollageLoadProgress?: (loaded: number, total: number) => void
}

export default function Hero({
    isRevealed = true,
    mountHeavyAssets = true,
    onPhoneReady,
    onCollageReady,
    onCollageLoadProgress,
}: HeroProps) {
    return (
        <section className="relative">
            <div className="relative min-h-screen flex flex-col items-center justify-start pt-24 sm:pt-28 pb-0 gap-10">

                {/* Background Ambience */}
                <div className="absolute inset-0 z-0">
                    {/* <RippleBackground /> */}
                </div>

                {/* Subtitle and Video Container - Side by side on desktop, stacked on mobile */}
                <div className="relative z-[45] w-full max-w-7xl mx-auto px-4 flex flex-col lg:flex-row lg:items-start lg:gap-5 gap-4 sm:gap-6 overflow-visible">

                    {/* Subtitle - Left side on desktop, top on mobile */}
                    <motion.div
                        className="text-center lg:text-left flex-1 lg:flex-shrink-0 lg:pt-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-7xl sm:text-8xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
                            <span
                                className="bg-clip-text text-transparent"
                                style={{
                                    backgroundImage:
                                        'linear-gradient(90deg, rgba(65, 139, 251, 1) 0%, rgba(140, 101, 198, 1) 50%, rgba(63, 202, 186, 1) 100%)',
                                }}
                            >
                                The Memory Agent.
                            </span>
                        </h1>
                        <p className="text-3xl sm:text-4xl md:text-2xl text-gray-300 mb-0 max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto lg:mx-0 leading-relaxed">
                            You decide what&apos;s worth remembering. The agent optimizes how it sticks.
                        </p>
                    </motion.div>

                    {/* Phone mockup - Right side on desktop, below on mobile */}
                    <motion.div
                        className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto lg:w-auto lg:max-w-none lg:flex-[2] lg:ml-auto lg:mx-0 lg:self-start overflow-visible"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.8, delay: isRevealed ? 0.25 : 0 }}
                    >
                        {mountHeavyAssets ? (
                            <PhoneHeroMockup
                                className="w-full"
                                screenContentSrc="/images/hero-phone-screen.png"
                                onReady={onPhoneReady}
                            />
                        ) : (
                            <div
                                className="w-full aspect-[9/19] max-h-[min(72vh,640px)]"
                                aria-hidden
                            />
                        )}
                    </motion.div>
                </div>

                {/* App Store Links */}
                <motion.div
                    className="relative z-[45] w-full max-w-7xl mx-auto px-4 sm:px-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-0 sm:gap-6 mt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.8, delay: isRevealed ? 0.45 : 0 }}
                >
                    <StoreBadges location="hero" />
                </motion.div>

                <SocialGlassButtons className="relative z-[45]" />

                <div className="relative w-full mt-10">
                    {mountHeavyAssets ? (
                        <WorkflowAnimation
                            onCollageReady={onCollageReady}
                            onCollageLoadProgress={onCollageLoadProgress}
                        />
                    ) : null}
                </div>
            </div>
        </section>
    )
}
