'use client'

import { useEffect, useRef, useState } from 'react'
import { useAmplitude } from '@/hooks/useAmplitude'

interface ScrollTrackerProps {
  page?: string
  sections?: Array<{ id: string; name: string }>
}

/**
 * ScrollTracker component that tracks:
 * 1. Scroll percentage milestones (10%, 25%, 50%, 75%, 90%, 100%)
 * 2. Section visibility (when sections come into view)
 * 3. Time spent at different scroll depths
 */
export default function ScrollTracker({ 
  page = 'homepage',
  sections = []
}: ScrollTrackerProps) {
  const { track } = useAmplitude()
  const [trackedMilestones, setTrackedMilestones] = useState<Set<number>>(new Set())
  const [trackedSections, setTrackedSections] = useState<Set<string>>(new Set())
  const [maxScrollReached, setMaxScrollReached] = useState(0)
  const scrollStartTime = useRef<number>(Date.now())
  const lastScrollPosition = useRef<number>(0)
  const timeAtPosition = useRef<Map<number, number>>(new Map())
  const sectionObservers = useRef<Map<string, IntersectionObserver>>(new Map())
  const trackedSectionsRef = useRef<Set<string>>(new Set()) // Ref to avoid stale closures

  // Track scroll percentage milestones
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0

      // Update max scroll reached
      if (scrollPercent > maxScrollReached) {
        setMaxScrollReached(scrollPercent)
      }

      // Track milestones: 10%, 25%, 50%, 75%, 90%, 100%
      const milestones = [10, 25, 50, 75, 90, 100]
      milestones.forEach((milestone) => {
        if (scrollPercent >= milestone && !trackedMilestones.has(milestone)) {
          track('scroll_milestone_reached', {
            page,
            scroll_percent: milestone,
            scroll_position: scrollTop,
            total_page_height: document.documentElement.scrollHeight,
            viewport_height: window.innerHeight,
            time_on_page: Math.round((Date.now() - scrollStartTime.current) / 1000), // seconds
          })
          setTrackedMilestones((prev) => new Set(prev).add(milestone))
        }
      })

      // Track continuous scroll depth (every 5% after 10%)
      if (scrollPercent >= 10 && scrollPercent % 5 === 0 && !trackedMilestones.has(scrollPercent)) {
        track('scroll_depth', {
          page,
          scroll_percent: scrollPercent,
          scroll_position: scrollTop,
          time_on_page: Math.round((Date.now() - scrollStartTime.current) / 1000),
        })
        setTrackedMilestones((prev) => new Set(prev).add(scrollPercent))
      }

      // Track time spent at different scroll positions
      const currentPosition = Math.floor(scrollTop / 100) * 100 // Round to nearest 100px
      if (currentPosition !== lastScrollPosition.current) {
        // Record time spent at previous position
        if (lastScrollPosition.current > 0) {
          const timeSpent = Date.now() - (timeAtPosition.current.get(lastScrollPosition.current) || Date.now())
          if (timeSpent > 1000) { // Only track if spent more than 1 second
            track('time_at_scroll_position', {
              page,
              scroll_position: lastScrollPosition.current,
              scroll_percent: Math.round((lastScrollPosition.current / scrollHeight) * 100),
              time_spent_seconds: Math.round(timeSpent / 1000),
            })
          }
        }
        // Update current position
        lastScrollPosition.current = currentPosition
        timeAtPosition.current.set(currentPosition, Date.now())
      }
    }

    // Throttle scroll events for better performance
    let ticking = false
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    
    // Track initial page view with scroll info
    track('page_scroll_tracked', {
      page,
      initial_scroll_position: 0,
      total_page_height: document.documentElement.scrollHeight,
      viewport_height: window.innerHeight,
    })

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
    }
  }, [track, page, trackedMilestones, maxScrollReached])

  // Keep ref in sync with state
  useEffect(() => {
    trackedSectionsRef.current = new Set(trackedSections)
  }, [trackedSections])

  // Track section visibility using Intersection Observer
  useEffect(() => {
    if (sections.length === 0) return

    // Use a timeout to ensure DOM is ready, especially for dynamically rendered sections
    const setupObservers = () => {
      sections.forEach(({ id, name }) => {
        // Skip if already tracked (using ref to avoid stale closure)
        if (trackedSectionsRef.current.has(id)) return

        // Try to find the element
        const element = document.getElementById(id)
        if (!element) {
          // Log missing elements for debugging (only in dev)
          if (process.env.NODE_ENV === 'development') {
            console.log(`[ScrollTracker] Element not found: ${id}`)
          }
          return
        }

        // Check if observer already exists
        if (sectionObservers.current.has(id)) {
          return
        }

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              // Use a lower threshold and check intersection ratio
              if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
                // Section is at least 25% visible (more lenient)
                const scrollTop = window.scrollY || document.documentElement.scrollTop
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
                const scrollPercent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0

                // Double-check we haven't already tracked this (using ref)
                if (trackedSectionsRef.current.has(id)) {
                  observer.disconnect()
                  sectionObservers.current.delete(id)
                  return
                }

                // Mark as tracked immediately to prevent duplicate events
                trackedSectionsRef.current.add(id)

                track('section_viewed', {
                  page,
                  section_id: id,
                  section_name: name,
                  scroll_percent: scrollPercent,
                  scroll_position: scrollTop,
                  time_on_page: Math.round((Date.now() - scrollStartTime.current) / 1000),
                  viewport_height: window.innerHeight,
                  intersection_ratio: entry.intersectionRatio,
                })

                setTrackedSections((prev) => {
                  const newSet = new Set(prev).add(id)
                  return newSet
                })
                observer.disconnect()
                sectionObservers.current.delete(id)

                // Log for debugging (only in dev)
                if (process.env.NODE_ENV === 'development') {
                  console.log(`[ScrollTracker] Section viewed: ${id} (${name}) at ${scrollPercent}%`)
                }
              }
            })
          },
          {
            threshold: [0.25, 0.5, 0.75], // Multiple thresholds for better detection
            rootMargin: '0px', // No margin adjustment - simpler detection
          }
        )

        observer.observe(element)
        sectionObservers.current.set(id, observer)

        // Log setup for debugging (only in dev)
        if (process.env.NODE_ENV === 'development') {
          console.log(`[ScrollTracker] Observer set up for: ${id} (${name})`)
        }
      })
    }

    // Initial setup with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(setupObservers, 100)

    // Also retry after a longer delay for dynamically rendered content
    const retryTimeoutId = setTimeout(() => {
      setupObservers()
    }, 1000)

    // Periodic check for missing elements (every 2 seconds, max 5 times)
    let retryCount = 0
    const maxRetries = 5
    const periodicCheck = setInterval(() => {
      if (retryCount >= maxRetries) {
        clearInterval(periodicCheck)
        return
      }
      retryCount++
      setupObservers()
    }, 2000)

    return () => {
      clearTimeout(timeoutId)
      clearTimeout(retryTimeoutId)
      clearInterval(periodicCheck)
      sectionObservers.current.forEach((observer) => observer.disconnect())
      sectionObservers.current.clear()
    }
  }, [sections, track, page]) // Removed trackedSections from deps to avoid re-running

  // Track final scroll depth when component unmounts or user leaves
  useEffect(() => {
    const handleBeforeUnload = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0
      const totalTime = Math.round((Date.now() - scrollStartTime.current) / 1000)

      track('page_scroll_session_end', {
        page,
        final_scroll_percent: scrollPercent,
        max_scroll_percent: maxScrollReached,
        total_time_seconds: totalTime,
        sections_viewed: trackedSections.size,
        milestones_reached: trackedMilestones.size,
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      handleBeforeUnload() // Also track on cleanup
    }
  }, [track, page, maxScrollReached, trackedSections.size, trackedMilestones.size])

  return null // This component doesn't render anything
}

