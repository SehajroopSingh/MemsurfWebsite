import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AmplitudeProvider } from '@/components/AmplitudeProvider'
import BlobbyBackground from '@/components/BlobbyBackground'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Memsurf - AI-Powered Learning Platform',
  description: 'Transform any content into interactive quizzes. Master knowledge with spaced repetition and AI-powered learning.',
  keywords: ['learning', 'quizzes', 'spaced repetition', 'AI learning', 'education', 'study tools'],
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
      <body className={inter.className}>
        {/* <BlobbyBackground /> */}
        <AmplitudeProvider>
          {children}
        </AmplitudeProvider>
      </body>
    </html>
  )
}
