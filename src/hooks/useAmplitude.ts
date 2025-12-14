'use client'

import { useEffect } from 'react'
import { initAmplitude, trackEvent, setUserProperties, identify, reset } from '@/lib/amplitude'

/**
 * Initialize Amplitude on mount
 * Also handles internal user tagging via ?internal=true query param
 */
export function useAmplitudeInit() {
  useEffect(() => {
    initAmplitude()
    
    // Check for internal tagging via query param
    // This allows you to tag your device by visiting: https://yoursite.com/?internal=true
    // Once set, it persists in Amplitude's storage for that device/browser
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('internal') === 'true') {
        // Small delay to ensure Amplitude is fully initialized
        setTimeout(() => {
          setUserProperties({ is_internal: true })
          console.log('✅ Tagged as internal user in Amplitude')
        }, 100)
      }
    }
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
