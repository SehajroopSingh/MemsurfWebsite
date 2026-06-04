import type { Metadata, Viewport } from 'next'
import { Inter, Nanum_Brush_Script, Nanum_Pen_Script } from 'next/font/google'
import './globals.css'
import { AmplitudeProvider } from '@/components/AmplitudeProvider'
import BlobbyBackgroundProvider from '@/components/BlobbyBackgroundProvider'

const inter = Inter({ subsets: ['latin'] })

/** Used for collage tagline cursive; exposed as CSS var for client components. */
const collageTaglineScript = Nanum_Brush_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-collage-tagline',
})

/** Used for collage note copy; exposed as CSS var for client components. */
const collageNoteScript = Nanum_Pen_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-collage-note',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://memsurf.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'MemSurf – Make Knowledge Stick',
  description: 'Transform any content into interactive quizzes. Master knowledge with spaced repetition and adaptive learning.',
  keywords: ['learning', 'quizzes', 'spaced repetition', 'education', 'study tools', 'adaptive learning', 'AI learning'],
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'MemSurf',
    title: 'MemSurf – Make Knowledge Stick',
    description: 'Transform any content into interactive quizzes. Master knowledge with spaced repetition and adaptive learning.',
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/mem-surf-og-image.png`,
        width: 1200,
        height: 630,
        alt: 'MemSurf – Make Knowledge Stick',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MemSurf – Make Knowledge Stick',
    description: 'Transform any content into interactive quizzes. Master knowledge with spaced repetition and adaptive learning.',
    images: [`${siteUrl}/mem-surf-og-image.png`],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#08131d',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // JSON-LD structured data for the homepage (Organization + WebSite)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'MemSurf',
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/memsurf-logo.svg`,
        },
        sameAs: [
          'https://x.com/memsurf',
          'https://www.linkedin.com/company/memsurf',
          'https://github.com/memsurf',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'contact@memsurf.com',
          contactType: 'customer support',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: 'MemSurf',
        url: siteUrl,
        publisher: { '@id': `${siteUrl}/#organization` },
      },
    ],
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} ${collageTaglineScript.variable} ${collageNoteScript.variable}`}>
        <BlobbyBackgroundProvider>
          <AmplitudeProvider>
            {children}
          </AmplitudeProvider>
        </BlobbyBackgroundProvider>
      </body>
    </html>
  )
}
