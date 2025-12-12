import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import Footer from '@/components/Footer'
import ScrollMocker from '@/components/ScrollMocker'
import ScrollToTop from '@/components/ScrollToTop'
import StoreBadges from '@/components/StoreBadges'
import WaitlistForm from '@/components/WaitlistForm'

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <ScrollToTop />
      <ScrollMocker />
      <Navigation />
      <Hero />

      <section className="pb-24 pt-12 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-10">

            {/* App Store Section */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                Your Personal Learning Architect
              </h2>
              <p className="text-lg text-gray-600 max-w-lg mx-auto">
                Offload the planning to an agent that knows how you learn. Download Memsurf to turn your information consumption into lasting mastery.
              </p>

              <div className="pt-4 flex flex-col items-center gap-3">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <StoreBadges location="app_store_section" imageClassName="h-[60px] w-auto" />
                </div>
                <span className="text-xs text-gray-500 font-medium tracking-wide uppercase mt-1">
                  Download from iPhone & Android
                </span>
                <span className="text-sm font-medium text-gray-400">
                  Coming Soon
                </span>
              </div>
            </div>

            {/* Email Subscription Section */}
            <div className="w-full max-w-xl space-y-4 pt-4">
              <p className="text-sm text-gray-500">
                Sign up for email list to hear updates.
              </p>
              <WaitlistForm source="homepage_waitlist" />
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
