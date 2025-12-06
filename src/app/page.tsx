import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import PracticeScrollShowcase from '@/components/infographic/PracticeScrollShowcase'
import InstitutionScroll from '@/components/InstitutionScroll'
import Testimonials from '@/components/Testimonials'
import Footer from '@/components/Footer'
import ScrollMocker from '@/components/ScrollMocker'

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <ScrollMocker />
      <Navigation />
      <Hero />
      <PracticeScrollShowcase />
      <InstitutionScroll />
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Coming to Apple App Store soon
              </h2>
              <p className="text-base md:text-lg text-gray-600">
                Web app and Play Store app in development
              </p>
            </div>
            <div className="max-w-md mx-auto pt-4">
              <form className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter email to keep updated, or sign up for TestFlight"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm md:text-base whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Testimonials />
      <Footer />
    </main>
  )
}
