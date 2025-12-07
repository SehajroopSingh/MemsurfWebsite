import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import PracticeScrollShowcase from '@/components/infographic/PracticeScrollShowcase'
import InstitutionScroll from '@/components/InstitutionScroll'
import Testimonials from '@/components/Testimonials'
import Footer from '@/components/Footer'
import ScrollMocker from '@/components/ScrollMocker'
import ScrollToTop from '@/components/ScrollToTop'

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <ScrollToTop />
      <ScrollMocker />
      <Navigation />
      <Hero />
      <PracticeScrollShowcase />
      <InstitutionScroll />
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-10">

            {/* App Store Section */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                Get started with Memsurf
              </h2>
              <p className="text-lg text-gray-600 max-w-lg mx-auto">
                The best way to learn is on the go. Download the app to start your personalized learning journey today.
              </p>

              <div className="pt-4 flex flex-col items-center gap-3">
                <a
                  href="#"
                  className="group relative inline-flex items-center justify-center transition-transform active:scale-95 hover:scale-105"
                  aria-label="Download on the App Store"
                >
                  <img 
                    src="/Download_on_App_Store/Black_lockup/SVG/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg"
                    alt="Download on the App Store"
                    className="h-[60px] w-auto"
                  />
                </a>
                <span className="text-xs text-gray-500 font-medium tracking-wide uppercase mt-1">
                  Download from iPhone
                </span>
                <span className="text-sm font-medium text-gray-400">
                  Coming Soon
                </span>
              </div>
            </div>

            {/* Email Subscription Section */}
            <div className="w-full max-w-md space-y-4 pt-4">
              <p className="text-sm text-gray-500">
                Want to be the first to know? Sign up for updates and TestFlight access.
              </p>
              <form className="relative flex items-center">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-6 py-4 rounded-full border-0 bg-white ring-1 ring-gray-200 shadow-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow pr-32"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-6 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors shadow-sm text-sm"
                >
                  Join Waitlist
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
