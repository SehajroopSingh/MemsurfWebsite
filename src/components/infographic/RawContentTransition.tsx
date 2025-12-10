'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { FileText } from 'lucide-react'

export default function RawContentTransition() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 60%", "end center"]
    })

    // Smooth out the scroll progress
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    // Map scroll progress to vertical position
    // Start: Align with create button (approx bottom of phone 1)
    // End: Top of Phone 2
    const y = useTransform(smoothProgress, [0, 1], ['10vh', '125vh'])
    const scale = useTransform(smoothProgress, [0, 0.2, 0.9], [0.2, 1, 0.8])
    const opacity = useTransform(smoothProgress, [0, 0.05, 0.8, 0.9], [0, 1, 1, 0])
    const rotate = useTransform(smoothProgress, [0, 1], [-5, 5])

    return (
        <div ref={containerRef} className="absolute inset-0 pointer-events-none z-[60] overflow-visible">
            <motion.div
                style={{ y, scale, opacity, rotate, x: '-50%' }}
                className="absolute left-1/2 top-0 w-64 p-4 bg-white rounded-xl shadow-2xl border border-gray-200"
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <FileText size={20} />
                    </div>
                    <div>
                        <div className="h-2 w-24 bg-gray-200 rounded-full mb-1" />
                        <div className="h-2 w-16 bg-gray-100 rounded-full" />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-2 w-full bg-gray-100 rounded-full" />
                    <div className="h-2 w-full bg-gray-100 rounded-full" />
                    <div className="h-2 w-3/4 bg-gray-100 rounded-full" />
                </div>
            </motion.div>
        </div>
    )
}
