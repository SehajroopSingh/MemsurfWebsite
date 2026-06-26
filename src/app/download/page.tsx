'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { initAmplitude, trackEvent, flushEvents } from '@/lib/amplitude'

function DownloadRedirect() {
  const params = useSearchParams()

  const src = params.get('src') || 'unknown'
  const campaign = params.get('campaign') || null
  const creator = params.get('creator') || null

  useEffect(() => {
    const run = async () => {
      // 1. Initialize Amplitude browser SDK (both primary and secondary)
      initAmplitude()

      // 2. Track event on both workspaces
      trackEvent('Download Link Clicked', {
        source: src,
        campaign,
        creator,
      })

      // 3. Flush events on both workspaces to ensure delivery before redirect
      await flushEvents()

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
