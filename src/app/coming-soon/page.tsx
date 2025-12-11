'use client'

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAmplitude } from '@/hooks/useAmplitude'

export default function ComingSoonPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { track } = useAmplitude()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    const trimmedEmail = email.trim()
    const isValidEmail = /\S+@\S+\.\S+/.test(trimmedEmail)

    track('waitlist_submitted', {
      source: 'coming_soon_page',
      status: isValidEmail ? 'success' : 'invalid_email',
      is_valid_email: isValidEmail,
      email_length: trimmedEmail.length,
    })

    if (!isValidEmail) {
      setIsSubmitting(false)
      setError('Please enter a valid email address.')
      return
    }
    
    // TODO: Add API call to save email
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSubmitted(true)
    setIsSubmitting(false)
    setEmail('')
  }

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navigation />
      <section className="flex-1 pt-24 pb-16 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-center text-center space-y-8">
            
            {/* Coming Soon Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full"
            >
              Coming Soon
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
            >
              <span className="bg-gradient-to-r from-blue-600 via-[#8c648d] to-pink-600 bg-clip-text text-transparent">
                Memsurf is on its way
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
            >
              We&apos;re putting the finishing touches on our mobile app. Be the first to know when it&apos;s available on the App Store and Google Play.
            </motion.p>

            {/* App Store Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 pt-4"
            >
              <div className="group relative inline-flex items-center justify-center transition-transform active:scale-95 hover:scale-105 opacity-60">
                <img
                  src="/Download_on_App_Store/Black_lockup/SVG/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg"
                  alt="Download on the App Store"
                  className="h-[60px] w-auto"
                />
              </div>
              <div className="group relative inline-flex items-center justify-center transition-transform active:scale-95 hover:scale-105 opacity-60">
                <img
                  src="/Get_it_on_Google_Play/GetItOnGooglePlay_Badge_Web_color_English.svg"
                  alt="Get it on Google Play"
                  className="h-[60px] w-auto"
                />
              </div>
            </motion.div>

            {/* Email Signup Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-full max-w-xl space-y-4 pt-8"
            >
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <p className="text-green-800 font-medium">
                    ✓ Thanks! We&apos;ll notify you when the app is available.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500">
                    Want to be the first to know? Sign up to get notified when we launch.
                  </p>
                  <form onSubmit={handleSubmit} className="flex flex-col sm:relative sm:block gap-3 sm:gap-0">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="w-full px-6 py-4 rounded-full border-0 bg-gray-50 ring-1 ring-gray-200 shadow-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow sm:pr-40"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto sm:absolute sm:right-2 sm:top-2 sm:bottom-2 px-6 py-4 sm:py-0 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Submitting...' : 'Notify Me'}
                    </button>
                  </form>
                  {error && (
                    <p className="text-sm text-red-600 pt-2">
                      {error}
                    </p>
                  )}
                </>
              )}
            </motion.div>

          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
