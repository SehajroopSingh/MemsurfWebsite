import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import QuizShowcase from '@/components/QuizShowcase'
import QuickCaptureShowcase from '@/components/QuickCaptureShowcase'
import SpacedRepetitionShowcase from '@/components/SpacedRepetitionShowcase'
import AIPoweredShowcase from '@/components/AIPoweredShowcase'
import Testimonials from '@/components/Testimonials'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <Features />
      <QuizShowcase />
      <QuickCaptureShowcase />
      <SpacedRepetitionShowcase />
      <AIPoweredShowcase />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  )
}

