'use client'

import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'
import StoreBadges from '@/components/StoreBadges'
import WaitlistForm from '@/components/WaitlistForm'
import ScrollTracker from '@/components/ScrollTracker'
import JoinCommunity from '@/components/JoinCommunity'
import { Linkedin, Mail } from 'lucide-react'

// Custom TikTok Icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

// Custom X (Twitter) Icon
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

// Custom Instagram Icon
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

export default function Home() {
  return (
    <main className="min-h-screen">
      <ScrollTracker 
        page="homepage"
        sections={[
          { id: 'hero-section', name: 'Hero' },
          { id: 'capture-section', name: 'Capture' },
          { id: 'processing-section', name: 'Processing' },
          { id: 'practice-section', name: 'Practice' },
          { id: 'app-store-section', name: 'App Store' },
          { id: 'waitlist-section', name: 'Waitlist' },
          { id: 'social-section', name: 'Social Links' },
          { id: 'footer-section', name: 'Footer' },
        ]}
      />
      <ScrollToTop />
      <Navigation />
      <div id="hero-section">
        <Hero />
      </div>

      <section className="pb-24 pt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-10">

            {/* App Store Section */}
            <div id="app-store-section" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 drop-shadow-lg">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                Your Personal Learning Architect
              </h2>
              <p className="text-lg text-gray-600 max-w-lg mx-auto">
                Offload the planning to an agent that knows how you learn. Download Memsurf to turn your information consumption into lasting mastery.
              </p>

              <div className="pt-4 flex flex-col items-center gap-3 w-full">
                <div className="w-full flex justify-center px-4">
                  <StoreBadges location="app_store_section" />
                </div>
                <JoinCommunity className="mt-4" delay={0} centered={true} location="homepage_bottom" />
              </div>
            </div>

            {/* Email Subscription Section */}
            <div id="waitlist-section" className="w-full max-w-xl space-y-4 pt-4">
              <p className="text-center text-lg text-gray-600 mb-4">
                and/or sign up for our email list for updates
              </p>
              <WaitlistForm source="homepage_waitlist" />
            </div>

            {/* Social Icons - Full width on mobile */}
            <div id="social-section" className="w-full pt-6 -mx-4 sm:mx-0">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 justify-between sm:justify-center items-stretch sm:items-center w-full px-4 sm:px-0 sm:max-w-xl sm:mx-auto">
                <a
                  href="https://www.linkedin.com/company/memsurf/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-full sm:w-24 sm:h-24 md:w-20 md:h-20 h-32 sm:h-24 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-all duration-200 border-2 border-gray-200 shadow-md"
                >
                  <Linkedin className="w-16 h-16 sm:w-12 sm:h-12 md:w-8 md:h-8" />
                </a>
                <a
                  href="https://www.tiktok.com/@memsurf"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-full sm:w-24 sm:h-24 md:w-20 md:h-20 h-32 sm:h-24 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-all duration-200 border-2 border-gray-200 shadow-md"
                >
                  <TikTokIcon className="w-16 h-16 sm:w-12 sm:h-12 md:w-8 md:h-8" />
                </a>
                <a
                  href="https://x.com/memsurf"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                  className="w-full sm:w-24 sm:h-24 md:w-20 md:h-20 h-32 sm:h-24 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-all duration-200 border-2 border-gray-200 shadow-md"
                >
                  <XIcon className="w-16 h-16 sm:w-12 sm:h-12 md:w-8 md:h-8" />
                </a>
                <a
                  href="https://www.instagram.com/memsurfai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-full sm:w-24 sm:h-24 md:w-20 md:h-20 h-32 sm:h-24 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-all duration-200 border-2 border-gray-200 shadow-md"
                >
                  <InstagramIcon className="w-16 h-16 sm:w-12 sm:h-12 md:w-8 md:h-8" />
                </a>
                <a
                  href="mailto:contact@memsurf.com"
                  aria-label="Email"
                  className="w-full sm:w-24 sm:h-24 md:w-20 md:h-20 h-32 sm:h-24 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-all duration-200 border-2 border-gray-200 shadow-md"
                >
                  <Mail className="w-16 h-16 sm:w-12 sm:h-12 md:w-8 md:h-8" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div id="footer-section">
        <Footer />
      </div>
    </main>
  )
}
