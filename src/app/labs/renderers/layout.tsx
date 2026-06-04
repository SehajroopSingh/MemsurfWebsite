import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Renderer Lab – MemSurf',
  description: 'Internal renderer lab for MemSurf cell previews.',
  alternates: {
    canonical: 'https://memsurf.com/labs/renderers',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function RenderersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
