'use client'

import React, { useRef } from 'react'
import { motion } from 'framer-motion'

interface VideoOverlayContainerProps {
    className?: string
    shouldPlay?: boolean
    isVideoVisible?: boolean
    onEnded?: () => void
    children?: React.ReactNode
}

export default function VideoOverlayContainer({ className = '', shouldPlay = false, isVideoVisible, onEnded, children }: VideoOverlayContainerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const activeIsVideoVisible = typeof isVideoVisible !== 'undefined' ? isVideoVisible : shouldPlay

    // Playback control
    React.useEffect(() => {
        if (videoRef.current) {
            if (shouldPlay) {
                videoRef.current.play().catch(e => console.log('Video play failed:', e))
            } else {
                videoRef.current.pause()
                // Do NOT reset immediately here. We want to hold the last frame if fading out.
            }
        }
    }, [shouldPlay])

    // Visibility & Reset control
    React.useEffect(() => {
        if (videoRef.current) {
            if (!activeIsVideoVisible) {
                // If hiding, wait for fade out (500ms) then reset
                const timer = setTimeout(() => {
                    if (videoRef.current) {
                        videoRef.current.currentTime = 0
                    }
                }, 600)
                return () => clearTimeout(timer)
            }
        }
    }, [activeIsVideoVisible])

    return (
        <div className={`relative overflow-hidden rounded-[2.5rem] border-[6px] border-[#8c648d] shadow-lg bg-gray-50 ${className}`}>
            {/* Video Layer */}
            <video
                ref={videoRef}
                className={`w-full h-auto block transition-opacity duration-500 ${activeIsVideoVisible ? 'opacity-100' : 'opacity-0'}`}
                muted
                playsInline
                onEnded={onEnded}
                src="/TestLoop.mp4"
            />

            {/* Overlay Container - ready for absolute positioned elements */}
            <div className="absolute inset-0 pointer-events-none">
                {children}
            </div>
        </div>
    )
}
