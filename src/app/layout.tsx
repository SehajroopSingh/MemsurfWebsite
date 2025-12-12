import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AmplitudeProvider } from '@/components/AmplitudeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Memsurf - AI-Powered Learning Platform',
  description: 'Transform any content into interactive quizzes. Master knowledge with spaced repetition and AI-powered learning.',
  keywords: ['learning', 'quizzes', 'spaced repetition', 'AI learning', 'education', 'study tools'],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head />
      <body className={inter.className}>
        <AmplitudeProvider>
          {children}
        </AmplitudeProvider>
      </body>
    </html>
  )
}
