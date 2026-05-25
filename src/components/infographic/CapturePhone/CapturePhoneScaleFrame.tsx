'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

type CapturePhoneScaleFrameProps = {
    children: React.ReactNode
    className?: string
}

/**
 * Scales children to fit the available width (never above 1).
 * Used so phone + settings annotations stay inside the capture card on narrow viewports.
 */
export default function CapturePhoneScaleFrame({ children, className = '' }: CapturePhoneScaleFrameProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const [layout, setLayout] = useState({ scale: 1, width: 0, height: 0 })

    const measure = useCallback(() => {
        const container = containerRef.current
        const content = contentRef.current
        if (!container || !content) return

        const available = container.clientWidth
        const naturalWidth = content.offsetWidth
        const naturalHeight = content.offsetHeight
        if (naturalWidth <= 0) return

        const scale = Math.min(1, available / naturalWidth)
        setLayout({
            scale,
            width: naturalWidth * scale,
            height: naturalHeight * scale,
        })
    }, [])

    useEffect(() => {
        measure()
        const ro = new ResizeObserver(measure)
        if (containerRef.current) ro.observe(containerRef.current)
        if (contentRef.current) ro.observe(contentRef.current)
        window.addEventListener('resize', measure)
        return () => {
            ro.disconnect()
            window.removeEventListener('resize', measure)
        }
    }, [measure])

    return (
        <div
            ref={containerRef}
            className={`mx-auto flex w-full max-w-full justify-center overflow-visible ${className}`}
        >
            <div
                className="relative shrink-0"
                style={{
                    width: layout.width > 0 ? layout.width : undefined,
                    height: layout.height > 0 ? layout.height : undefined,
                }}
            >
                <div
                    ref={contentRef}
                    className="inline-flex origin-top"
                    style={{
                        transform: `scale(${layout.scale})`,
                        transformOrigin: 'top center',
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    )
}
