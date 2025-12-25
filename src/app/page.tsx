import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import Footer from '@/components/Footer'
import ScrollMocker from '@/components/ScrollMocker'
import ScrollToTop from '@/components/ScrollToTop'
import StoreBadges from '@/components/StoreBadges'
import WaitlistForm from '@/components/WaitlistForm'

export default function Home() {
  return (
    <main className="min-h-screen">
      <ScrollToTop />
      <ScrollMocker />
      <Navigation />
      <Hero />

      <section className="pb-24 pt-12">
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

              <div className="pt-4 flex flex-col items-center gap-3 w-full">
                <div className="w-full px-4">
                  <StoreBadges location="app_store_section" />
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

      {/* Meet the Founder Section */}
      <section className="py-20 border-t border-gray-100/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Built for Mastery
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Memsurf is built effectively by a team passionate about solving the memory problem.
          </p>
          <a
            href="/team"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
          >
            Meet the Founder
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}
