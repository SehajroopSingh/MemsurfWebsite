'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function BlobbyBackground() {
    const [isDark, setIsDark] = useState(true)

    useEffect(() => {
        // Check system preference on mount
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        setIsDark(darkModeMediaQuery.matches)

        const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
        darkModeMediaQuery.addEventListener('change', handler)
        return () => darkModeMediaQuery.removeEventListener('change', handler)
    }, [])

    // Helper to get color based on mode
    const c = (darkHex: string, lightHex: string) => isDark ? darkHex : lightHex
    const o = (darkOp: number, lightOp: number) => isDark ? darkOp : lightOp
    const b = (darkBlur: number, lightBlur: number) => `blur(${isDark ? darkBlur : lightBlur}px)`

    // Blobs definition based on SwiftUI code
    const blobs = [
        // 🟠 Blob 1 - Top left
        {
            id: 1,
            color: c("#8b4a3a", "#df896b"),
            opacity: o(0.3, 0.6),
            size: [350, 250], // [expanded, contracted]
            initial: { left: '20%', top: '20%' },
            animate: { left: ['20%', '40%'], top: ['20%', '20%'] }, // move
            durationMove: 8,
            durationSize: 6,
            blur: b(30, 60)
        },
        // 🔵 Blob 2 - Middle right
        {
            id: 2,
            color: c("#4a5a7a", "#84aae1"),
            opacity: o(0.3, 0.6),
            size: [250, 150],
            initial: { left: '75%', top: '50%' },
            animate: { left: ['75%', '90%'], top: ['50%', '50%'] },
            durationMove: 10,
            durationSize: 7,
            blur: b(30, 60)
        },
        // 🟣 Blob 3 - Bottom left
        {
            id: 3,
            color: c("#2a2b4a", "#4c4d8a"),
            opacity: o(0.3, 0.6),
            size: [300, 200],
            initial: { left: '10%', top: '80%' },
            animate: { left: ['10%', '30%'], top: ['80%', '80%'] },
            durationMove: 12,
            durationSize: 9,
            blur: b(30, 60)
        },
        // 💜 Blob 4 - Bottom left (soft purple)
        {
            id: 4,
            color: c("#5a3a6a", "#d4a5ff"),
            opacity: o(0.25, 0.5),
            size: [270, 170],
            initial: { left: '15%', top: '85%' },
            animate: { left: ['15%', '35%'], top: ['85%', '85%'] },
            durationMove: 11,
            durationSize: 8,
            blur: b(35, 70)
        },
        // Small Blobs
        // 🌸 Small 1 - Top center
        {
            id: 5,
            color: c("#6a3a4a", "#ffb3c1"),
            opacity: o(0.25, 0.45),
            size: [180, 120],
            initial: { left: '35%', top: '8%' },
            animate: { left: ['35%', '65%'], top: ['8%', '18%'] },
            durationMove: 9,
            durationSize: 5,
            blur: b(25, 50)
        },
        // 🌿 Small 2 - Upper right
        {
            id: 6,
            color: c("#3a5a6a", "#7bdff2"),
            opacity: o(0.25, 0.45),
            size: [160, 100],
            initial: { left: '75%', top: '15%' },
            animate: { left: ['75%', '90%'], top: ['15%', '30%'] },
            durationMove: 11,
            durationSize: 6,
            blur: b(22, 45)
        },
        // 🌼 Small 3 - Bottom center
        {
            id: 7,
            color: c("#6a5a3a", "#fff3b0"),
            opacity: o(0.25, 0.45),
            size: [190, 130],
            initial: { left: '45%', top: '82%' },
            animate: { left: ['45%', '75%'], top: ['82%', '92%'] },
            durationMove: 10,
            durationSize: 7,
            blur: b(27, 55)
        },
        // 🍃 Small 4 - Middle left
        {
            id: 8,
            color: c("#3a5a4a", "#b8f2e6"),
            opacity: o(0.25, 0.45),
            size: [170, 110],
            initial: { left: '15%', top: '45%' },
            animate: { left: ['15%', '25%'], top: ['45%', '60%'] },
            durationMove: 12,
            durationSize: 8,
            blur: b(20, 40)
        },
        // 💠 Small 5 - Bottom right
        {
            id: 9,
            color: c("#6a4a3a", "#ffd6a5"),
            opacity: o(0.25, 0.45),
            size: [150, 90],
            initial: { left: '85%', top: '70%' },
            animate: { left: ['85%', '95%'], top: ['70%', '80%'] },
            durationMove: 13,
            durationSize: 6,
            blur: b(17, 35)
        },
        // 🔹 Small 6 - Lower left mid
        {
            id: 10,
            color: c("#4a4a6a", "#c9c5ff"),
            opacity: o(0.25, 0.45),
            size: [180, 120],
            initial: { left: '20%', top: '55%' },
            animate: { left: ['20%', '35%'], top: ['55%', '70%'] },
            durationMove: 9.5,
            durationSize: 5.5,
            blur: b(25, 50)
        },
        // Tiny Blobs (Fast)
        // ✨ Tiny 1
        {
            id: 11,
            color: c("#6a3a5a", "#ffb3e6"),
            opacity: o(0.2, 0.4),
            size: [240, 160],
            initial: { left: '15%', top: '10%' },
            animate: { left: ['15%', '85%'], top: ['10%', '25%'] },
            durationMove: 6,
            durationSize: 4,
            blur: b(40, 80)
        },
        // ✨ Tiny 2
        {
            id: 12,
            color: c("#3a6a4a", "#b3ffcc"),
            opacity: o(0.2, 0.4),
            size: [220, 140],
            initial: { left: '10%', top: '40%' },
            animate: { left: ['10%', '90%'], top: ['40%', '55%'] },
            durationMove: 7,
            durationSize: 4.5,
            blur: b(37, 75)
        },
        // ✨ Tiny 3
        {
            id: 13,
            color: c("#5a3a6a", "#e6b3ff"),
            opacity: o(0.2, 0.4),
            size: [230, 150],
            initial: { left: '25%', top: '70%' },
            animate: { left: ['25%', '75%'], top: ['70%', '85%'] },
            durationMove: 5.5,
            durationSize: 3.5,
            blur: b(42, 85)
        },
    ]

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none" style={{ backgroundColor: isDark ? '#000000' : '#e1e6f5' }}>
            {blobs.map((blob) => (
                <motion.div
                    key={blob.id}
                    style={{
                        position: 'absolute',
                        borderRadius: '50%',
                        backgroundColor: blob.color,
                        filter: blob.blur,
                        opacity: blob.opacity,
                    }}
                    initial={{
                        width: blob.size[1],
                        height: blob.size[1],
                        left: blob.initial.left,
                        top: blob.initial.top,
                    }}
                    animate={{
                        width: [blob.size[1], blob.size[0], blob.size[1]], // Pulse size
                        height: [blob.size[1], blob.size[0], blob.size[1]],
                        ...blob.animate
                    }}
                    transition={{
                        width: { duration: blob.durationSize, repeat: Infinity, ease: 'easeInOut' },
                        height: { duration: blob.durationSize, repeat: Infinity, ease: 'easeInOut' },
                        left: { duration: blob.durationMove, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
                        top: { duration: blob.durationMove, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }
                    }}
                />
            ))}
        </div>
    )
}
