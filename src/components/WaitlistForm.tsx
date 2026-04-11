'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useAmplitude } from '@/hooks/useAmplitude'

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
        className="relative w-full overflow-hidden rounded-[1.75rem] border border-white/20 bg-emerald-300/10 p-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_18px_50px_rgba(2,8,24,0.35)] backdrop-blur-2xl"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      >
        <div className="pointer-events-none absolute inset-px rounded-[1.6rem] bg-[radial-gradient(circle_at_22%_0%,rgba(255,255,255,0.28),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.16),transparent_52%)]" />
        <div className="relative">
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
        <motion.input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="relative w-full h-14 sm:h-14 px-5 sm:pr-40 rounded-full border border-white/20 bg-white/[0.08] text-white placeholder:text-white/55 text-base sm:text-base outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.26),0_18px_45px_rgba(2,8,24,0.32)] backdrop-blur-2xl transition-[background-color,border-color,box-shadow] duration-300 focus:border-app-mint/80 focus:bg-white/[0.12] focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.34),0_0_0_4px_rgba(79,158,149,0.18),0_20px_60px_rgba(2,8,24,0.38)] disabled:cursor-not-allowed disabled:opacity-70"
          whileFocus={shouldReduceMotion ? undefined : { scale: 1.005 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          disabled={isLoading}
          required
        />
        <motion.button
          type="submit"
          disabled={isLoading}
          className="group relative flex w-full h-14 sm:h-auto sm:w-auto sm:absolute sm:right-2 sm:top-2 sm:bottom-2 min-w-[8.5rem] items-center justify-center overflow-hidden rounded-full border border-white/25 bg-white/[0.14] px-6 text-base sm:text-base font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.32),0_12px_32px_rgba(2,8,24,0.36)] backdrop-blur-xl transition-colors duration-300 hover:border-app-mint/70 hover:bg-white/[0.20] disabled:cursor-not-allowed disabled:opacity-60"
          whileHover={shouldReduceMotion || isLoading ? undefined : { scale: 1.04 }}
          whileTap={shouldReduceMotion || isLoading ? undefined : { scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 520, damping: 22 }}
        >
          <span className="pointer-events-none absolute inset-px rounded-full bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.42),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.20),transparent_62%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="pointer-events-none absolute -left-12 top-0 h-full w-10 rotate-12 bg-white/25 blur-sm transition-transform duration-700 group-hover:translate-x-48" />
          <span className="relative flex items-center justify-center">
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
