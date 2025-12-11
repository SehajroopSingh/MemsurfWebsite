'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Eye } from 'lucide-react'

export default function ScrollMocker() {
    const lastScrollY = useRef(0)
    const lastTime = useRef(0)
    const [message, setMessage] = useState<string | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            const currentTime = Date.now()
            const timeDiff = currentTime - lastTime.current
            const scrollDiff = Math.abs(currentScrollY - lastScrollY.current)

            if (timeDiff > 100 && scrollDiff > 0) {
                const speed = scrollDiff / timeDiff // pixels per ms

                // Clear existing timeout
                if (timeoutRef.current) clearTimeout(timeoutRef.current)

                if (speed > 3) {
                    showMessage("Whoa, slow down. You can't read that fast.", 3000)
                } else if (speed < 0.1 && scrollDiff > 50) {
                    // Only trigger slow message if they moved a significant amount but slowly
                    showMessage("Sound it out. You can do it.", 3000)
                }

                lastScrollY.current = currentScrollY
                lastTime.current = currentTime
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const showMessage = (msg: string, duration: number) => {
        setMessage(msg)
        timeoutRef.current = setTimeout(() => {
            setMessage(null)
        }, duration)
    }

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: 20, x: '-50%' }}
                    className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
                >
                    <div className="bg-yellow-400 text-black px-6 py-3 rounded-none font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black flex items-center gap-3">
                        <Eye className="w-5 h-5" />
                        {message}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
