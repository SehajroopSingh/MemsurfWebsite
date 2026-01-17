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

  // Track section visibility using Intersection Observer
  useEffect(() => {
    if (sections.length === 0) return

    sections.forEach(({ id, name }) => {
      const element = document.getElementById(id)
      if (!element) return

      // Skip if already tracked
      if (trackedSections.has(id)) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
              // Section is at least 50% visible
              const scrollTop = window.scrollY || document.documentElement.scrollTop
              const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
              const scrollPercent = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0

              track('section_viewed', {
                page,
                section_id: id,
                section_name: name,
                scroll_percent: scrollPercent,
                scroll_position: scrollTop,
                time_on_page: Math.round((Date.now() - scrollStartTime.current) / 1000),
                viewport_height: window.innerHeight,
              })

              setTrackedSections((prev) => new Set(prev).add(id))
              observer.disconnect()
            }
          })
        },
        {
          threshold: 0.5, // Trigger when 50% of section is visible
          rootMargin: '-50px 0px', // Only count when section is well into viewport
        }
      )

      observer.observe(element)
      sectionObservers.current.set(id, observer)
    })

    return () => {
      sectionObservers.current.forEach((observer) => observer.disconnect())
      sectionObservers.current.clear()
    }
  }, [sections, track, page, trackedSections])

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

