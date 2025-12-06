import React from 'react'
import { motion } from 'framer-motion'

export default function FlyingIcon({ data }: { data: any }) {
    const isLeft = !!data.position.left

    // Target configuration (Phone Screen Inner Area)
    // Phone is ~300px wide. Screen content is inset ~6px.
    // List starts below dynamic island + padding (~100px-140px).

    return (
        <motion.div
            initial={{
                opacity: 0,
                scale: 0.5,
                top: data.position.top,
                left: data.position.left,
                x: data.position.x || 0,
                width: "auto"
            }}
            animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.8, 1, 1, 1.5],
                left: '50%',
                x: '-50%',
                top: '90px', // Matches pt-20 (80px) + inset
                right: 'auto',
                width: "auto"
            }}
            transition={{
                duration: 0.6,
                times: [0, 0.2, 0.8, 1],
                ease: "circOut", // Default for x/left
                top: { duration: 0.6, ease: "circIn" }, // Gravity effect for drop
            }}
            className="absolute z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm text-sm font-medium text-gray-500"
        >
            <div className="grayscale opacity-50 scale-75">{data.icon}</div>
            {data.source}
        </motion.div>
    )
}
