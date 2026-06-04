import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Meet the Team – The People Behind MemSurf',
  description: 'Meet the founders behind MemSurf: Sehaj Singh and Alessia Canuto. Built by learners, for learners.',
  alternates: {
    canonical: 'https://memsurf.com/team',
  },
  openGraph: {
    title: 'Meet the Team – MemSurf',
    description: 'Meet the founders behind MemSurf. Built by learners, for learners.',
    url: 'https://memsurf.com/team',
  },
}

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  const pageUrl = 'https://memsurf.com/team'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Meet the Team – MemSurf',
    description: 'Meet the founders behind MemSurf: Sehaj Singh and Alessia Canuto. Built by learners, for learners.',
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
