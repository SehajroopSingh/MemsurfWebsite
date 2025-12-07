'use client'

import { useEffect } from 'react'

export default function ScrollToTop() {
    useEffect(() => {
        // Disable browser's default scroll restoration
        if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
            history.scrollRestoration = 'manual'
        }

        // Force scroll to top on mount
        window.scrollTo(0, 0)
    }, [])

    return null
}
