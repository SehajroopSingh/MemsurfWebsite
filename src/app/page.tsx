'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, useReducedMotion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'
import StoreBadges from '@/components/StoreBadges'
import WaitlistForm from '@/components/WaitlistForm'
import ScrollTracker from '@/components/ScrollTracker'
import SocialGlassButtons from '@/components/SocialGlassButtons'
import HomepageLoadingSplash from '@/components/HomepageLoadingSplash'
import { useBlobbyBackground } from '@/components/BlobbyBackgroundProvider'

const MIN_SPLASH_DURATION_MS = 1400
const MAX_SPLASH_DURATION_MS = 5000
const BLOB_SETTLE_DURATION_MS = 1100

export default function Home() {
  const shouldReduceMotion = useReducedMotion()
  const { setBackgroundMode } = useBlobbyBackground()
  const [logoReady, setLogoReady] = useState(false)
  const [phoneReady, setPhoneReady] = useState(false)
  const [collageReady, setCollageReady] = useState(false)
  const [minimumSplashElapsed, setMinimumSplashElapsed] = useState(false)
  const [loadTimedOut, setLoadTimedOut] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const settleTimerRef = useRef<number | null>(null)

  const handleLogoReady = useCallback(() => setLogoReady(true), [])
  const handlePhoneReady = useCallback(() => setPhoneReady(true), [])
  const handleCollageReady = useCallback(() => setCollageReady(true), [])

  useEffect(() => {
    setBackgroundMode('loading')

    return () => {
      if (settleTimerRef.current != null) {
        window.clearTimeout(settleTimerRef.current)
      }
      setBackgroundMode('idle')
    }
  }, [setBackgroundMode])

  useEffect(() => {
    const minimumTimer = window.setTimeout(() => {
      setMinimumSplashElapsed(true)
    }, MIN_SPLASH_DURATION_MS)
    const timeoutTimer = window.setTimeout(() => {
      setLoadTimedOut(true)
    }, MAX_SPLASH_DURATION_MS)

    return () => {
      window.clearTimeout(minimumTimer)
      window.clearTimeout(timeoutTimer)
    }
  }, [])

  useEffect(() => {
    const criticalAssetsReady = logoReady && phoneReady && collageReady

    if (isRevealed || !minimumSplashElapsed || (!criticalAssetsReady && !loadTimedOut)) {
      return
    }

    setIsRevealed(true)

    if (shouldReduceMotion) {
      setBackgroundMode('idle')
      return
    }

    setBackgroundMode('settling')
    settleTimerRef.current = window.setTimeout(() => {
      setBackgroundMode('idle')
      settleTimerRef.current = null
    }, BLOB_SETTLE_DURATION_MS)
  }, [
    collageReady,
    isRevealed,
    loadTimedOut,
    logoReady,
    minimumSplashElapsed,
    phoneReady,
    setBackgroundMode,
    shouldReduceMotion,
  ])

  return (
    <>
      <main
        className={`min-h-screen transition-opacity duration-500 ${
          isRevealed ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-busy={!isRevealed}
      >
        <ScrollTracker
          page="homepage"
          sections={[
            { id: 'hero-section', name: 'Hero' },
            { id: 'capture-section', name: 'Capture' },
            { id: 'processing-section', name: 'Processing' },
            { id: 'chatgpt-integration-section', name: 'ChatGPT Integration' },
            { id: 'practice-section', name: 'Practice' },
            { id: 'app-store-section', name: 'App Store' },
            { id: 'waitlist-section', name: 'Waitlist' },
            { id: 'social-section', name: 'Social Links' },
            { id: 'footer-section', name: 'Footer' },
          ]}
        />
        <ScrollToTop />
        <Navigation isRevealed={isRevealed} />
        <div id="hero-section">
          <Hero
            isRevealed={isRevealed}
            onPhoneReady={handlePhoneReady}
            onCollageReady={handleCollageReady}
          />
        </div>

        <section className="pb-24 pt-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center space-y-10">

              {/* App Store Section */}
              <div id="app-store-section" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 drop-shadow-lg">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                  Your Personal Learning Architect
                </h2>
                <p className="text-lg text-gray-300 max-w-lg mx-auto">
                  Offload the planning to an agent that knows how you learn. Download MemSurf to turn your information consumption into lasting mastery.
                </p>

                <div className="pt-4 flex flex-col items-center gap-3 w-full">
                  <div className="w-full flex justify-center px-4">
                    <StoreBadges location="app_store_section" />
                  </div>
                </div>
              </div>

              {/* Email Subscription Section */}
              <div id="waitlist-section" className="w-full max-w-xl space-y-4 -mt-4">
                <p className="text-center text-lg text-gray-300 mb-4">
                  and/or sign up for our email list for updates
                </p>
                <WaitlistForm source="homepage_waitlist" />
              </div>

              {/* Social Icons - Full width on mobile */}
              <div id="social-section" className="w-full pt-6 -mx-4 sm:mx-0">
                <SocialGlassButtons />
              </div>

            </div>
          </div>
        </section>

        <div id="footer-section">
          <Footer />
        </div>
      </main>
      <AnimatePresence>
        {!isRevealed && (
          <HomepageLoadingSplash
            key="homepage-loading-splash"
            onLogoReady={handleLogoReady}
          />
        )}
      </AnimatePresence>
    </>
  )
}
