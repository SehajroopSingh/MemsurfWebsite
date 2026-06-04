import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Contact MemSurf – Get in Touch',
  description: 'Have questions, feedback, or partnership ideas? Get in touch with the MemSurf team. We aim to respond within 1–2 business days.',
  alternates: {
    canonical: 'https://memsurf.com/contact',
  },
  openGraph: {
    title: 'Contact MemSurf',
    description: 'Get in touch with the MemSurf team. We would love to connect.',
    url: 'https://memsurf.com/contact',
  },
}

export default function ContactPage() {
  const pageUrl = 'https://memsurf.com/contact'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact MemSurf',
    description: 'Get in touch with the MemSurf team. We aim to respond within 1–2 business days.',
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
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-bold text-app-text mb-6">
              Contact Us
            </h1>
          <p className="text-app-textMuted text-lg mb-6">
            Have questions, feedback, or partnership ideas? We&apos;d love to connect.
          </p>
          <h2 className="text-2xl font-semibold text-app-text mb-4">
            How to Reach Us
          </h2>
          <div className="space-y-4 text-app-textMuted">
            <p>
              You can reach the MemSurf team at:
            </p>
            <p className="font-medium">
              contact@memsurf.com
            </p>
            <p>
              We aim to respond to most inquiries within 1–2 business days.
            </p>
          </div>
        </div>
      </section>
        <Footer />
      </main>
    </>
  )
}
