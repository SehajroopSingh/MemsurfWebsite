'use client'

import React, { useRef } from 'react'
import { motion } from 'framer-motion'

interface VideoOverlayContainerProps {
    className?: string
    shouldPlay?: boolean
}

export default function VideoOverlayContainer({ className = '', shouldPlay = false }: VideoOverlayContainerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)

    React.useEffect(() => {
        if (videoRef.current) {
            if (shouldPlay) {
                videoRef.current.play().catch(e => console.log('Video play failed:', e))
            } else {
                videoRef.current.pause()
                videoRef.current.currentTime = 0
            }
        }
    }, [shouldPlay])

    return (
        <div className={`relative overflow-hidden rounded-[2.5rem] border-[6px] border-[#8c648d] shadow-lg bg-gray-900 ${className}`}>
            {/* Video Layer */}
            <video
                ref={videoRef}
                className="w-full h-auto block"
                loop
                muted
                playsInline
                src="/TestLoop.mp4"
            />

            {/* Overlay Container - ready for absolute positioned elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Future overlays go here */}
            </div>
        </div>
    )
}
