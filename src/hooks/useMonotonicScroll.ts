import { useTransform, MotionValue, useMotionValue } from 'framer-motion'
import { useEffect } from 'react'

/**
 * Returns a new MotionValue that only increases (never decreases) 
 * based on the source MotionValue.
 */
export function useMonotonicScroll(source: MotionValue<number>) {
    const monotonic = useMotionValue(0)

    useEffect(() => {
        return source.on('change', (latest) => {
            const current = monotonic.get()
            if (latest > current) {
                monotonic.set(latest)
            }
        })
    }, [source, monotonic])

    return monotonic
}
