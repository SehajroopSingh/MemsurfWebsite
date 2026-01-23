'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface RandomizedTextRevealProps {
    text: string
    className?: string
    duration?: number // Approximate duration per letter in ms (default ~50ms)
}

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+'

export default function RandomizedTextReveal({ text, className, duration = 30 }: RandomizedTextRevealProps) {
    const [displayedText, setDisplayedText] = useState('')
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const [isAnimating, setIsAnimating] = useState(false)

    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.5 })

    useEffect(() => {
        if (!isInView) return

        // Reset animation when text changes or comes into view
        setDisplayedText('')
        setIsAnimating(true)

        if (intervalRef.current) clearInterval(intervalRef.current)

        let currentIndex = 0
        let scrambleCount = 0
        const maxScrambles = 4 // Number of random chars before fixing the correct one

        intervalRef.current = setInterval(() => {
            if (currentIndex >= text.length) {
                if (intervalRef.current) clearInterval(intervalRef.current)
                setIsAnimating(false)
                setDisplayedText(text)
                return
            }

            // Construct the current string:
            // Correct part so far: text.substring(0, currentIndex)
            // Current scrambling character: random char

            const correctPart = text.substring(0, currentIndex)

            if (scrambleCount < maxScrambles) {
                const randomChar = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]
                setDisplayedText(correctPart + randomChar)
                scrambleCount++
            } else {
                // Fix the character
                setDisplayedText(correctPart + text[currentIndex])
                currentIndex++
                scrambleCount = 0
            }

        }, duration)

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [text, duration, isInView])

    return (
        <motion.span ref={ref} className={className}>
            {displayedText}
        </motion.span>
    )
}
