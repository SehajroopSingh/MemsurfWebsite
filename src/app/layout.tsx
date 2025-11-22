import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

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
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

