import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Research – The Science Behind MemSurf',
  description: 'The cognitive science behind MemSurf\'s capture → retrieval → mastery system. Discover why most learning fades and how spaced repetition works.',
  alternates: {
    canonical: 'https://memsurf.com/research',
  },
  openGraph: {
    title: 'Research – The Science Behind MemSurf',
    description: 'The cognitive science behind spaced repetition and lasting memory.',
    url: 'https://memsurf.com/research',
  },
}

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  const pageUrl = 'https://memsurf.com/research'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    name: 'Research – The Science Behind MemSurf',
    headline: 'Why Most Learning Fades and Why People Stop Writing Things Down',
    description: 'The cognitive science behind MemSurf\'s capture → retrieval → mastery system.',
    url: pageUrl,
    isPartOf: { '@id': 'https://memsurf.com/#website' },
    publisher: { '@id': 'https://memsurf.com/#organization' },
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
