'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useAmplitude } from '@/hooks/useAmplitude'

type WaitlistFormProps = {
  source?: string
}

export default function WaitlistForm({ source = 'homepage_waitlist' }: WaitlistFormProps) {
  const { track } = useAmplitude()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const emailLength = useMemo(() => email.trim().length, [email])

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    const valid = isValidEmail(trimmedEmail)
    const statusLabel = valid ? 'success' : 'invalid_email'

    track('waitlist_submitted', {
      source,
      status: statusLabel,
      is_valid_email: valid,
      email_length: emailLength,
    })

    if (!valid) {
      setError('Please enter a valid email.')
      setStatus('error')
      return
    }

    setError(null)
    setStatus('submitting')

    // Simulate network latency while keeping the UI responsive
    await new Promise(resolve => setTimeout(resolve, 600))

    setStatus('success')
    setEmail('')

    // Reset the success message after a short delay
    setTimeout(() => {
      setStatus('idle')
    }, 3500)
  }

  const isSubmitting = status === 'submitting'

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col sm:relative sm:block gap-3 sm:gap-0">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="w-full px-6 py-4 rounded-full border-0 bg-white ring-1 ring-gray-200 shadow-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow sm:pr-40"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto sm:absolute sm:right-2 sm:top-2 sm:bottom-2 px-6 py-4 sm:py-0 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors shadow-sm text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Joining...' : 'Join Waitlist'}
        </button>
      </form>
      {error && (
        <p className="text-sm text-red-600 pt-2">
          {error}
        </p>
      )}
      {status === 'success' && (
        <p className="text-sm text-green-700 pt-2">
          You&apos;re on the list. We&apos;ll email you as soon as Memsurf launches.
        </p>
      )}
    </>
  )
}
