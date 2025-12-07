import { useMotionValue, MotionValue, animate } from 'framer-motion'
import { useEffect } from 'react'

interface UseTimeProgressOptions {
    trigger: boolean
    duration: number // Duration in milliseconds
    delay?: number
}

/**
 * Returns a MotionValue that animates from 0 to 1 over the specified duration
 * when the trigger becomes true.
 */
export function useTimeProgress({ trigger, duration, delay = 0 }: UseTimeProgressOptions): MotionValue {
    const progress = useMotionValue(0)

    useEffect(() => {
        if (trigger) {
            animate(progress, 1, {
                duration: duration / 1000,
                delay: delay / 1000,
                ease: "linear"
            })
            // output the progress to help debug if needed
            // progress.on("change", v => console.log(v))
        }
    }, [trigger, duration, delay, progress])

    return progress
}
