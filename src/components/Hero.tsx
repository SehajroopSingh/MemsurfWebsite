'use client'

import React from 'react'
import { motion } from 'framer-motion'
import WorkflowAnimation from './infographic/WorkflowAnimation'
import GreenScreenVideo from './GreenScreenVideo'
import { VIDEO_PATH } from '@/config/video'

// import RippleBackground from './RippleBackground'

export default function Hero() {
    return (
        <section className="relative bg-white">
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
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
                            <span className="bg-gradient-to-r from-blue-600 via-[#8c648d] to-pink-600 bg-clip-text text-transparent">
                                Your Memory Is Leaking.
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 mb-0 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
                            It&apos;s a biological fact: you forget 90% of what you read. Stop trusting your brain. Trust our agent to patch the leak.
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
                            className="w-full"
                            autoPlay={true}
                            loop={true}
                            muted={true}
                            controls={false}
                        />
                    </motion.div>
                </div>

                {/* App Store Links - Below both text and video */}
                <motion.div
                    className="relative w-full max-w-7xl mx-auto px-4 z-20 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <a
                        href="/coming-soon"
                        className="group relative inline-flex items-center justify-center transition-transform active:scale-95 hover:scale-105"
                        aria-label="Download on the App Store"
                    >
                        <img
                            src="/Download_on_App_Store/Black_lockup/SVG/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg"
                            alt="Download on the App Store"
                            className="h-[50px] md:h-[60px] w-auto"
                        />
                    </a>
                    <a
                        href="/coming-soon"
                        className="group relative inline-flex items-center justify-center transition-transform active:scale-95 hover:scale-105"
                        aria-label="Get it on Google Play"
                    >
                        <img
                            src="/Get_it_on_Google_Play/GetItOnGooglePlay_Badge_Web_color_English.svg"
                            alt="Get it on Google Play"
                            className="h-[50px] md:h-[60px] w-auto"
                        />
                    </a>
                </motion.div>

                <div className="w-full z-10 mt-10">
                    <WorkflowAnimation />
                </div>
            </div>
        </section>
    )
}
