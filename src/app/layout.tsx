import type { Metadata } from 'next'
import { Dancing_Script, Inter } from 'next/font/google'
import './globals.css'
import { AmplitudeProvider } from '@/components/AmplitudeProvider'
import BlobbyBackground from '@/components/BlobbyBackground'

const inter = Inter({ subsets: ['latin'] })

/** Used for collage tagline cursive; exposed as CSS var for client components. */
const collageTaglineScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-collage-tagline',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://memsurf.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'MemSurf – Make Knowledge Stick',
  description: 'Transform any content into interactive quizzes. Master knowledge with spaced repetition and adaptive learning.',
  keywords: ['learning', 'quizzes', 'spaced repetition', 'education', 'study tools', 'adaptive learning'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'MemSurf',
    title: 'MemSurf – Make Knowledge Stick',
    description: 'Transform any content into interactive quizzes. Master knowledge with spaced repetition and adaptive learning.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MemSurf – Make Knowledge Stick',
    description: 'Transform any content into interactive quizzes. Master knowledge with spaced repetition and adaptive learning.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var contentWidth = 620;
                var deviceWidth = window.screen.width || window.innerWidth || 375;
                var calculatedScale = Math.min(deviceWidth / contentWidth, 1);
                var viewportContent = 'width=' + contentWidth + ', initial-scale=' + calculatedScale + ', maximum-scale=5, user-scalable=yes';
                var meta = document.createElement('meta');
                meta.name = 'viewport';
                meta.content = viewportContent;
                document.getElementsByTagName('head')[0].appendChild(meta);
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} ${collageTaglineScript.variable}`}>
        <BlobbyBackground />
        <AmplitudeProvider>
          {children}
        </AmplitudeProvider>
      </body>
    </html>
  )
}
