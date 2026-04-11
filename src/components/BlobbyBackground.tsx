'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function BlobbyBackground() {
    // 13 Blobs mapped directly to AppPalette.swift dark mode hexes and opacities
    const blobs = [
        // 🟢 Blob 1 - Top left
        {
            id: 1,
            color: "#4f9e95",
            opacity: 0.40,
            size: 250, // compact size
            scale: [1, 350 / 250, 1], // [compact, expanded, compact]
            initial: { x: '20vw', y: '20vh' },
            animate: { x: ['20vw', '40vw'], y: ['20vh', '20vh'] },
            durationMove: 8,
            durationSize: 6,
            blur: "blur(30px)"
        },
        // 🔵 Blob 2 - Middle right
        {
            id: 2,
            color: "#5376ab",
            opacity: 0.40,
            size: 150,
            scale: [1, 250 / 150, 1],
            initial: { x: '75vw', y: '50vh' },
            animate: { x: ['75vw', '90vw'], y: ['50vh', '50vh'] },
            durationMove: 10,
            durationSize: 7,
            blur: "blur(30px)"
        },
        // 🟣 Blob 3 - Bottom left
        {
            id: 3,
            color: "#6b57a8",
            opacity: 0.36,
            size: 200,
            scale: [1, 300 / 200, 1],
            initial: { x: '10vw', y: '80vh' },
            animate: { x: ['10vw', '30vw'], y: ['80vh', '80vh'] },
            durationMove: 12,
            durationSize: 9,
            blur: "blur(30px)"
        },
        // 💜 Blob 4 - Bottom left
        {
            id: 4,
            color: "#8c65c6",
            opacity: 0.34,
            size: 170,
            scale: [1, 270 / 170, 1],
            initial: { x: '15vw', y: '85vh' },
            animate: { x: ['15vw', '35vw'], y: ['85vh', '85vh'] },
            durationMove: 11,
            durationSize: 8,
            blur: "blur(35px)"
        },
        // Small Blobs
        // 🌸 Small 1 - Top center
        {
            id: 5,
            color: "#77c2b7",
            opacity: 0.30,
            size: 120,
            scale: [1, 180 / 120, 1],
            initial: { x: '35vw', y: '8vh' },
            animate: { x: ['35vw', '65vw'], y: ['8vh', '18vh'] },
            durationMove: 9,
            durationSize: 5,
            blur: "blur(25px)"
        },
        // 🌿 Small 2 - Upper right
        {
            id: 6,
            color: "#7196cf",
            opacity: 0.30,
            size: 100,
            scale: [1, 160 / 100, 1],
            initial: { x: '75vw', y: '15vh' },
            animate: { x: ['75vw', '90vw'], y: ['15vh', '30vh'] },
            durationMove: 11,
            durationSize: 6,
            blur: "blur(22px)"
        },
        // 🌼 Small 3 - Bottom center
        {
            id: 7,
            color: "#a580da",
            opacity: 0.28,
            size: 130,
            scale: [1, 190 / 130, 1],
            initial: { x: '45vw', y: '82vh' },
            animate: { x: ['45vw', '75vw'], y: ['82vh', '92vh'] },
            durationMove: 10,
            durationSize: 7,
            blur: "blur(27px)"
        },
        // 🍃 Small 4 - Middle left
        {
            id: 8,
            color: "#438a81",
            opacity: 0.28,
            size: 110,
            scale: [1, 170 / 110, 1],
            initial: { x: '15vw', y: '45vh' },
            animate: { x: ['15vw', '25vw'], y: ['45vh', '60vh'] },
            durationMove: 12,
            durationSize: 8,
            blur: "blur(20px)"
        },
        // 💠 Small 5 - Bottom right
        {
            id: 9,
            color: "#3f6196",
            opacity: 0.28,
            size: 90,
            scale: [1, 150 / 90, 1],
            initial: { x: '85vw', y: '70vh' },
            animate: { x: ['85vw', '95vw'], y: ['70vh', '80vh'] },
            durationMove: 13,
            durationSize: 6,
            blur: "blur(17px)"
        },
        // 🔹 Small 6 - Lower left mid
        {
            id: 10,
            color: "#7a73b2",
            opacity: 0.28,
            size: 120,
            scale: [1, 180 / 120, 1],
            initial: { x: '20vw', y: '55vh' },
            animate: { x: ['20vw', '35vw'], y: ['55vh', '70vh'] },
            durationMove: 9.5,
            durationSize: 5.5,
            blur: "blur(25px)"
        },
        // Tiny Blobs (Fast)
        // ✨ Tiny 1
        {
            id: 11,
            color: "#8fe1d4",
            opacity: 0.24,
            size: 160,
            scale: [1, 240 / 160, 1],
            initial: { x: '15vw', y: '10vh' },
            animate: { x: ['15vw', '85vw'], y: ['10vh', '25vh'] },
            durationMove: 6,
            durationSize: 4,
            blur: "blur(40px)"
        },
        // ✨ Tiny 2
        {
            id: 12,
            color: "#89b0eb",
            opacity: 0.24,
            size: 140,
            scale: [1, 220 / 140, 1],
            initial: { x: '10vw', y: '40vh' },
            animate: { x: ['10vw', '90vw'], y: ['40vh', '55vh'] },
            durationMove: 7,
            durationSize: 4.5,
            blur: "blur(37px)"
        },
        // ✨ Tiny 3
        {
            id: 13,
            color: "#b08ae4",
            opacity: 0.24,
            size: 150,
            scale: [1, 230 / 150, 1],
            initial: { x: '25vw', y: '70vh' },
            animate: { x: ['25vw', '75vw'], y: ['70vh', '85vh'] },
            durationMove: 5.5,
            durationSize: 3.5,
            blur: "blur(42px)"
        },
    ]

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none" style={{ backgroundColor: '#08131d' }}>
            {blobs.map((blob) => (
                <motion.div
                    key={blob.id}
                    style={{
                        position: 'absolute',
                        borderRadius: '50%',
                        backgroundColor: blob.color,
                        filter: blob.blur,
                        opacity: blob.opacity,
                        width: blob.size,
                        height: blob.size,
                        // Center the transform origin so scaling works outward evenly
                        transformOrigin: 'center center',
                        willChange: 'transform'
                    }}
                    initial={{
                        x: blob.initial.x,
                        y: blob.initial.y,
                        scale: blob.scale[0]
                    }}
                    animate={{
                        x: blob.animate.x,
                        y: blob.animate.y,
                        scale: blob.scale
                    }}
                    transition={{
                        scale: { duration: blob.durationSize, repeat: Infinity, ease: 'easeInOut' },
                        x: { duration: blob.durationMove, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
                        y: { duration: blob.durationMove, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }
                    }}
                />
            ))}
        </div>
    )
}
