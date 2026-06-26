'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { initAmplitude, trackEvent, getAmplitude } from '@/lib/amplitude'

function DownloadRedirect() {
  const params = useSearchParams()

  const src = params.get('src') || 'unknown'
  const campaign = params.get('campaign') || null
  const creator = params.get('creator') || null

  useEffect(() => {
    const run = async () => {
      // 1. Initialize Amplitude browser SDK
      initAmplitude()

      // 2. Track event
      trackEvent('Download Link Clicked', {
        source: src,
        campaign,
        creator,
      })

      // 3. Flush events to ensure tracking goes through before redirecting
      const amplitudeInstance = getAmplitude()
      if (amplitudeInstance && typeof amplitudeInstance.flush === 'function') {
        try {
          await amplitudeInstance.flush().promise
        } catch (err) {
          console.error('Failed to flush Amplitude events:', err)
        }
      }

      // 4. Redirect to the App Store
      window.location.href = 'https://apps.apple.com/us/app/memsurf/id6745132314'
    }

    run()

    // Safety fallback: Redirect after 800ms regardless of flush completion
    const timer = setTimeout(() => {
      window.location.href = 'https://apps.apple.com/us/app/memsurf/id6745132314'
    }, 800)

    return () => clearTimeout(timer)
  }, [src, campaign, creator])

  return null
}

export default function DownloadPage() {
  return (
    <Suspense fallback={null}>
      <DownloadRedirect />
    </Suspense>
  )
}
