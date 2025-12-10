'use client'

import React from 'react'
import { motion } from 'framer-motion'
import WorkflowAnimation from './infographic/WorkflowAnimation'
// import RippleBackground from './RippleBackground'

export default function Hero() {
    return (
        <section className="relative bg-white">
            <div className="relative min-h-screen flex flex-col items-center justify-start pt-24 sm:pt-28 pb-10 gap-10">

                {/* Background Ambience */}
                <div className="absolute inset-0 z-0">
                    {/* <RippleBackground /> */}
                </div>

                <motion.div className="text-center z-20 w-full px-4 max-w-5xl mx-auto">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Don&apos;t Forget to Remember
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 mb-20 max-w-3xl mx-auto leading-relaxed">
                        Don&apos;t surf the web, surf what you wanted to remember. Use Memsurf.
                    </p>
                </motion.div>

                <div className="w-full z-10 mt-[60vh]">
                    <WorkflowAnimation />
                </div>
            </div>
        </section>
    )
}
