import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'


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
                  <a
                    href="/coming-soon"
                    className="group relative inline-flex items-center justify-center transition-transform active:scale-95 hover:scale-105"
                    aria-label="Download on the App Store"
                  >
                    <img
                      src="/Download_on_App_Store/Black_lockup/SVG/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg"
                      alt="Download on the App Store"
                      className="h-[60px] w-auto"
                    />
                  </a>
                  <a
                    href="/coming-soon"
                    className="group relative inline-flex items-center justify-center transition-transform active:scale-95 hover:scale-105"
                    aria-label="Get it on Google Play"
                  >
                    <img
                      src="/Get_it_on_Google_Play/GetItOnGooglePlay_Badge_Web_color_English.svg"
                      alt="Get it on Google Play"
                      className="h-[60px] w-auto"
                    />
                  </a>
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
                Join the Future of Learning
              </p>
              <form className="flex flex-col sm:relative sm:block gap-3 sm:gap-0">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-6 py-4 rounded-full border-0 bg-white ring-1 ring-gray-200 shadow-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow sm:pr-40"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto sm:absolute sm:right-2 sm:top-2 sm:bottom-2 px-6 py-4 sm:py-0 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors shadow-sm text-sm"
                >
                  Join Waitlist
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
