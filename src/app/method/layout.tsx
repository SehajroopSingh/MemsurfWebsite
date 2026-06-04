import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Method – How MemSurf Builds Lasting Memory',
  description: 'Discover MemSurf\'s capture → retrieval → mastery system. Learn how we turn passive notes into active, lasting knowledge.',
  alternates: {
    canonical: 'https://memsurf.com/method',
  },
  openGraph: {
    title: 'The Method – MemSurf',
    description: 'Discover how MemSurf turns passive notes into active, lasting knowledge.',
    url: 'https://memsurf.com/method',
  },
}

export default function MethodLayout({ children }: { children: React.ReactNode }) {
  const pageUrl = 'https://memsurf.com/method'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'The Method – How MemSurf Builds Lasting Memory',
    description: 'Discover MemSurf\'s capture → retrieval → mastery system.',
    url: pageUrl,
    isPartOf: { '@id': 'https://memsurf.com/#website' },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
