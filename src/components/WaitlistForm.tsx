'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useAmplitude } from '@/hooks/useAmplitude'
import LiquidGlassOverlays from '@/components/ui/LiquidGlassOverlays'
import { liquidGlassSurfaceStyle } from '@/lib/liquidGlass'

type WaitlistFormProps = {
  source?: string
}

export default function WaitlistForm({ source = 'homepage_waitlist' }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const { track } = useAmplitude()
  const shouldReduceMotion = useReducedMotion()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedEmail = email.trim()
    const isValidEmail = /\S+@\S+\.\S+/.test(trimmedEmail)

    if (!isValidEmail) {
      setError('Please enter a valid email address')
      track('waitlist_submitted', {
        source,
        status: 'invalid_email',
        is_valid_email: false,
        email_length: trimmedEmail.length,
      })
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Submit to MailerLite
      await fetch(
        'https://assets.mailerlite.com/jsonp/1978217/forms/173531262883989214/subscribe',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'fields[email]': trimmedEmail,
            'ml-submit': '1',
            'anticsrf': 'true',
          }),
          mode: 'no-cors', // MailerLite doesn't support CORS
        }
      )

      // Since we're using no-cors, we can't read the response
      // Assume success if no error thrown
      setIsSuccess(true)
      setEmail('')

      track('waitlist_submitted', {
        source,
        status: 'success',
        is_valid_email: true,
        email_length: trimmedEmail.length,
      })
    } catch {
      setError('Something went wrong. Please try again.')
      track('waitlist_submitted', {
        source,
        status: 'error',
        is_valid_email: true,
        email_length: trimmedEmail.length,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        className="group relative w-full overflow-hidden rounded-[1.75rem] border border-emerald-300/35 p-5 text-center"
        style={liquidGlassSurfaceStyle}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      >
        <LiquidGlassOverlays roundedClassName="rounded-[1.75rem]" sheenTranslateClassName="group-hover:translate-x-[120%]" />
        <div className="relative z-10">
          <h4 className="mb-1 font-semibold text-emerald-200">Thank you!</h4>
          <p className="text-sm text-emerald-100/90">You have successfully joined our subscriber list.</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.985 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
    >
      <motion.div
        className="relative space-y-4 sm:flex sm:flex-row sm:space-y-0"
        whileHover={shouldReduceMotion || isLoading ? undefined : { y: -2 }}
        transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      >
        <div className="pointer-events-none absolute -inset-3 hidden rounded-[2rem] bg-[radial-gradient(circle_at_18%_20%,rgba(143,225,212,0.20),transparent_34%),radial-gradient(circle_at_82%_10%,rgba(137,176,235,0.18),transparent_32%)] blur-xl sm:block" />
        <div
          className="group relative w-full overflow-hidden rounded-full border border-transparent transition-[border-color,box-shadow] duration-300 hover:border-app-mint/70 focus-within:border-app-mint/80 focus-within:ring-2 focus-within:ring-app-mint/75 focus-within:ring-offset-2 focus-within:ring-offset-app-canvas sm:flex-1"
          style={liquidGlassSurfaceStyle}
        >
          <LiquidGlassOverlays />
          <motion.input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="relative z-10 h-14 w-full border-0 bg-transparent px-5 text-base text-white outline-none placeholder:text-white/55 sm:h-14 sm:pr-40 sm:text-base disabled:cursor-not-allowed disabled:opacity-70"
            whileFocus={shouldReduceMotion ? undefined : { scale: 1.005 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            disabled={isLoading}
            required
          />
        </div>
        <motion.button
          type="submit"
          disabled={isLoading}
          className="group relative flex h-14 w-full min-w-[8.5rem] items-center justify-center overflow-hidden rounded-full border border-transparent px-6 text-base font-semibold text-white transition-colors duration-300 hover:border-app-mint/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-mint/75 focus-visible:ring-offset-2 focus-visible:ring-offset-app-canvas disabled:cursor-not-allowed disabled:opacity-60 sm:absolute sm:right-2 sm:top-2 sm:bottom-2 sm:h-auto sm:w-auto sm:text-base"
          style={liquidGlassSurfaceStyle}
          whileHover={shouldReduceMotion || isLoading ? undefined : { scale: 1.04 }}
          whileTap={shouldReduceMotion || isLoading ? undefined : { scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 520, damping: 22 }}
        >
          <LiquidGlassOverlays />
          <span className="relative z-10 flex items-center justify-center">
            {isLoading ? (
              <span className="inline-block w-8 h-8 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
            ) : (
              'Subscribe'
            )}
          </span>
        </motion.button>
      </motion.div>
      {error && (
        <motion.p
          className="mt-2 text-sm text-red-300"
          initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </motion.form>
  )
}
