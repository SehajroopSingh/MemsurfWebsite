'use client'

import React from 'react'
import { motion } from 'framer-motion'
import WorkflowAnimation from './infographic/WorkflowAnimation'
import GreenScreenVideo from './GreenScreenVideo'
import { VIDEO_PATH, VIDEO_PLACEHOLDER } from '@/config/video'
import StoreBadges from './StoreBadges'
import JoinCommunity from './JoinCommunity'

// import RippleBackground from './RippleBackground'

export default function Hero() {
    return (
        <section className="relative">
            <div className="relative min-h-screen flex flex-col items-center justify-start pt-24 sm:pt-28 pb-0 gap-10">

                {/* Background Ambience */}
                <div className="absolute inset-0 z-0">
                    {/* <RippleBackground /> */}
                </div>

                {/* Subtitle and Video Container - Side by side on desktop, stacked on mobile */}
                <div className="relative w-full max-w-7xl mx-auto px-4 z-20 flex flex-col lg:flex-row lg:items-center lg:gap-6 gap-8">

                    {/* Subtitle - Left side on desktop, top on mobile */}
                    <motion.div
                        className="text-center lg:text-left z-20 flex-1 lg:flex-shrink-0"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-7xl sm:text-8xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
                            <span className="bg-gradient-to-r from-blue-600 via-[#8c648d] to-pink-600 bg-clip-text text-transparent">
                                The Memory Agent.
                            </span>
                        </h1>
                        <p className="text-3xl sm:text-4xl md:text-2xl text-gray-600 mb-0 max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto lg:mx-0 leading-relaxed">
                            You decide what&apos;s worth remembering. The agent optimizes how it sticks.
                        </p>
                    </motion.div>

                    {/* Green Screen Video - Right side on desktop, below on mobile */}
                    <motion.div
                        className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto lg:w-auto lg:max-w-none lg:flex-[2] lg:ml-auto lg:mx-0 z-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <GreenScreenVideo
                            src={VIDEO_PATH}
                            placeholder={VIDEO_PLACEHOLDER}
                            className="w-full"
                            autoPlay={true}
                            loop={true}
                            muted={true}
                            controls={false}
                            trackingLabel="hero_demo_video"
                            trackingLocation="hero"
                        />
                    </motion.div>
                </div>

                {/* Join Our Community Section - Above App Store Links */}
                <JoinCommunity className="mt-8" />

                {/* App Store Links - Below community section */}
                <motion.div
                    className="relative w-full max-w-7xl mx-auto px-4 sm:px-4 z-20 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-0 sm:gap-6 mt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <StoreBadges location="hero" />
                </motion.div>

                <div className="w-full z-10 mt-10">
                    <WorkflowAnimation />
                </div>
            </div>
        </section>
    )
}
