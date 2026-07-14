import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'
import StoreBadges from '@/components/StoreBadges'
import WaitlistForm from '@/components/WaitlistForm'
import ScrollTracker from '@/components/ScrollTracker'
import SocialGlassButtons from '@/components/SocialGlassButtons'
import WorkflowAnimation from '@/components/infographic/WorkflowAnimation'
import AppleLogoIcon from '@/components/AppleLogoIcon'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://memsurf.com'

export const metadata: Metadata = {
  title: 'MemSurf – Make Knowledge Stick',
  description: 'Transform any content into interactive quizzes. Master knowledge with spaced repetition and adaptive learning.',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'MemSurf',
      url: siteUrl,
      logo: `${siteUrl}/logos/butterfly-icon-512.png`,
      description: 'Transform any content into interactive quizzes. Master knowledge with spaced repetition and adaptive learning.',
      sameAs: [
        'mailto:contact@memsurf.com',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'contact@memsurf.com',
        contactType: 'customer support',
      },
    },
    {
      '@type': 'WebSite',
      name: 'MemSurf',
      url: siteUrl,
      description: 'AI-powered learning platform that turns content into interactive quizzes with spaced repetition.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-app-canvas">
        <ScrollTracker
          page="homepage"
          sections={[
            { id: 'app-store-section', name: 'App Store' },
            { id: 'capture-section', name: 'Capture' },
            { id: 'processing-section', name: 'Processing' },
            { id: 'chatgpt-integration-section', name: 'ChatGPT Integration' },
            { id: 'practice-section', name: 'Practice' },
            { id: 'waitlist-section', name: 'Waitlist' },
            { id: 'social-section', name: 'Social Links' },
            { id: 'footer-section', name: 'Footer' },
          ]}
        />
        <ScrollToTop />
        <Navigation variant="youlearn" />

        <section className="pb-20 pt-36 sm:pb-24 sm:pt-44">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
              <h1 className="text-5xl font-bold leading-tight tracking-normal text-app-text sm:text-6xl lg:text-7xl">
                Remember anything you learn
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-app-textMuted sm:text-xl">
                MemSurf turns notes, links, videos, and ideas into scheduled practice that keeps showing up at the right time.
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                <a
                  href="/download?src=website"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-[var(--app-action)] px-8 text-base font-bold text-[var(--app-action-text)] shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <AppleLogoIcon className="h-5 w-5" />
                  Download for iPhone
                </a>
                <a
                  href="#capture-section"
                  className="inline-flex h-14 items-center justify-center rounded-full border border-app-border bg-app-surface px-8 text-base font-bold text-app-text transition-colors hover:bg-app-surfaceElevated"
                >
                  See how it works
                </a>
              </div>
            </div>
          </div>
        </section>

        <WorkflowAnimation />

        <section className="pb-24 pt-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center space-y-10">

              <div id="app-store-section" className="w-full rounded-[28px] border border-app-border bg-app-surface p-6 sm:p-8">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-app-text">
                  Your Personal Learning Architect
                </h2>
                <p className="mt-3 text-lg text-app-textMuted max-w-lg mx-auto">
                  Offload the planning to an agent that adapts to your study habits. Download MemSurf to turn your information consumption into lasting mastery.
                </p>

                <div className="pt-4 flex flex-col items-center gap-3 w-full">
                  <div className="w-full flex justify-center px-4">
                    <StoreBadges location="app_store_section" variant="youlearn" />
                  </div>
                </div>
              </div>

              <div id="waitlist-section" className="w-full max-w-xl space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-app-text">
                  Stay in the Loop
                </h2>
                <p className="text-center text-lg text-app-textMuted mb-4">
                  and/or sign up for our email list for updates
                </p>
                <WaitlistForm source="homepage_waitlist" variant="youlearn" />
              </div>

              <div id="social-section" className="flex w-full flex-wrap justify-center pt-6">
                <h2 className="sr-only">Follow MemSurf on Social Media</h2>
                <SocialGlassButtons variant="youlearn" />
              </div>

            </div>
          </div>
        </section>

        <div id="footer-section">
          <Footer />
        </div>
      </main>
    </>
  )
}
