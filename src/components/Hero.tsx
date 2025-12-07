'use client'

import React from 'react'
import { motion } from 'framer-motion'
import WorkflowAnimation from './infographic/WorkflowAnimation'

export default function Hero() {
    return (
        <section className="relative min-h-screen bg-white">
            <div className="relative min-h-screen flex flex-col items-center justify-center pt-20">

                {/* Background Ambience */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNlN2U1ZTQiLz48L3N2Zz4=')] opacity-20 pointer-events-none"></div>

                <motion.div className="text-center z-20 absolute top-32 w-full px-4">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Don&apos;t Forget to Remember
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 mb-20 max-w-3xl mx-auto leading-relaxed">
                        Don&apos;t surf the web, surf what you wanted to remember. Use Memsurf.
                    </p>
                </motion.div>

                <WorkflowAnimation />
            </div>
        </section>
    )
}
