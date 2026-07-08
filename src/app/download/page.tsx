'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { initAmplitude, trackEvent, flushEvents } from '@/lib/amplitude'
import Navigation from '@/components/Navigation'

const appStoreUrl = 'https://apps.apple.com/us/app/memsurf/id6745132314'

function DownloadShell() {
  return (
    <main className="min-h-screen bg-app-canvas text-app-text">
      <Navigation variant="youlearn" />
      <section className="flex min-h-screen items-center justify-center px-4 py-32">
        <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
          <img
            src="/logos/butterfly-no-shadow-transparent-cropped.png"
            alt=""
            className="mb-6 h-16 w-16 object-contain"
          />
          <h1 className="text-4xl font-bold leading-tight tracking-normal text-app-text sm:text-5xl">
            Opening MemSurf
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-app-textMuted sm:text-lg">
            We&apos;re taking you to the App Store. If it does not open automatically, continue below.
          </p>
          <a
            href={appStoreUrl}
            className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-[var(--app-action)] px-8 text-base font-bold text-[var(--app-action-text)] shadow-sm transition hover:opacity-[0.86]"
          >
            Continue to App Store
          </a>
        </div>
      </section>
    </main>
  )
}

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
      window.location.href = appStoreUrl
    }

    run()

    // Safety fallback: Redirect after 800ms regardless of flush completion
    const timer = setTimeout(() => {
      window.location.href = appStoreUrl
    }, 800)

    return () => clearTimeout(timer)
  }, [src, campaign, creator])

  return <DownloadShell />
}

export default function DownloadPage() {
  return (
    <Suspense fallback={<DownloadShell />}>
      <DownloadRedirect />
    </Suspense>
  )
}
