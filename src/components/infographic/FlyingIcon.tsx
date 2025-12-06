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
                left: isLeft ? data.position.left : 'auto',
                right: !isLeft ? data.position.right : 'auto',
                x: 0,
                y: 0,
                width: "auto"
            }}
            animate={{
                opacity: [0, 1, 1],
                scale: [0.8, 1.1, 1],
                left: '50%',
                x: '-50%',
                top: '90px', // Matches pt-20 (80px) + inset
                y: 0,
                right: 'auto',
                width: "274px" // Wider width (300 phone - 12 frame - 14 padding)
            }}
            transition={{ duration: 0.6, times: [0, 0.6, 1], ease: "circOut" }}
            className={`absolute z-50 p-3 rounded-2xl shadow-xl backdrop-blur-md border border-white/50 flex items-center gap-3 ${data.color}`}
        >
            {/* Render full card content to match list look */}
            <div className="shrink-0">{data.icon}</div>
            <span className="text-sm font-semibold text-gray-900 truncate opacity-0 animate-[fadeIn_0.3s_0.3s_forwards]">{data.label}</span>
        </motion.div>
    )
}
