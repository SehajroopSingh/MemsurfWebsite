import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Careers at MemSurf – Join Our Team',
  description: 'Join the MemSurf team. We are building the future of AI-powered learning. Explore career opportunities with us.',
  alternates: {
    canonical: 'https://memsurf.com/careers',
  },
  openGraph: {
    title: 'Careers at MemSurf',
    description: 'Join the MemSurf team. We are building the future of AI-powered learning.',
    url: 'https://memsurf.com/careers',
  },
}

export default function CareersPage() {
  const pageUrl = 'https://memsurf.com/careers'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Careers at MemSurf',
    description: 'Join the MemSurf team. We are building the future of AI-powered learning.',
    url: pageUrl,
    isPartOf: { '@id': 'https://memsurf.com/#website' },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen flex flex-col">
        <Navigation />
        <section className="flex-1 pt-24 pb-16 bg-transparent">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-bold text-app-text mb-6">
              Careers at MemSurf
            </h1>
          <h2 className="text-2xl font-semibold text-app-text mt-10 mb-4">
            Who We Are
          </h2>
          <p className="text-app-textMuted text-lg mb-4">
            We&apos;re a small, fast-moving team building the future of AI-powered learning.
          </p>
          <h2 className="text-2xl font-semibold text-app-text mt-8 mb-4">
            Join Us
          </h2>
          <p className="text-app-textMuted text-lg mb-4">
            If you&apos;re passionate about education, AI, and creating delightful product
            experiences, we&apos;d love to hear from you.
          </p>
          <p className="text-app-textMuted text-lg">
            For opportunities, please reach out via our contact page or email us directly.
          </p>
        </div>
      </section>
        <Footer />
      </main>
    </>
  )
}
