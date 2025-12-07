import { useEffect, useState, RefObject } from 'react'

/**
 * Collapses a container's height state after the user has scrolled past it,
 * but waits until scrolling has stopped to prevent momentum interruption.
 * 
 * @param ref Reference to the container element
 * @param isComplete Boolean indicating if the section's interaction is finished
 * @param expandedHeightVh The height in vh when expanded (e.g. 300)
 * @param collapsedHeightVh The height in vh when collapsed (e.g. 100)
 * @returns boolean: true if should be collapsed
 */
export function useScrollCollapse(
    ref: RefObject<HTMLElement>,
    isComplete: boolean,
    expandedHeightVh: number,
    collapsedHeightVh: number
) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    useEffect(() => {
        if (!isComplete || isCollapsed) return

        let scrollTimer: NodeJS.Timeout | null = null

        const attemptCollapse = () => {
            if (!ref.current) return

            // Collapse immediately when complete + stopped scrolling
            // We previously checked if rect.bottom < -100, but for the last element on page
            // there might not be enough space below to scroll that far.
            // Since isComplete guarantees we are at the end of the sticky sequence (>95%),
            // and the user has stopped scrolling (debounce), it is safe to collapse.

            const vhPixels = window.innerHeight / 100
            const diffValues = (expandedHeightVh - collapsedHeightVh) * vhPixels

            // Update state
            setIsCollapsed(true)

            // Adjust scroll position instantly to compensate for layout shift above
            window.scrollBy({ top: -diffValues, behavior: 'instant' })
        }

        const handleScroll = () => {
            // Clear any pending check
            if (scrollTimer) clearTimeout(scrollTimer)

            // Wait for scroll to stop (150ms)
            scrollTimer = setTimeout(() => {
                attemptCollapse()
            }, 150)
        }

        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (scrollTimer) clearTimeout(scrollTimer)
        }
    }, [isComplete, isCollapsed, expandedHeightVh, collapsedHeightVh, ref])

    return isCollapsed
}
