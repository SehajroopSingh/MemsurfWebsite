'use client'

import { useEffect } from 'react'
import { initAmplitude, trackEvent, setUserProperties, identify, reset } from '@/lib/amplitude'

/**
 * Initialize Amplitude on mount
 */
export function useAmplitudeInit() {
  useEffect(() => {
    initAmplitude()
  }, [])
}

/**
 * Hook for tracking events with Amplitude
 * @example
 * const { track } = useAmplitude()
 * track('button_clicked', { button_name: 'signup' })
 */
export function useAmplitude() {
  return {
    track: trackEvent,
    setUserProperties,
    identify,
    reset,
  }
}
