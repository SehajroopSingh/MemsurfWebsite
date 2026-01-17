'use client'

import { useState } from 'react'
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
      const response = await fetch(
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
    } catch (err) {
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
      <div className="w-full rounded-2xl bg-green-50 border border-green-200 p-4 text-center">
        <h4 className="text-green-800 font-semibold mb-1">Thank you!</h4>
        <p className="text-green-700 text-sm">You have successfully joined our subscriber list.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-row sm:relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full h-28 sm:h-14 px-8 sm:pr-36 rounded-full bg-white text-gray-900 text-3xl sm:text-base outline-none shadow-sm border-0 focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto sm:absolute sm:right-2 sm:top-2 sm:bottom-2 h-28 sm:h-auto px-8 rounded-full bg-black text-white font-semibold text-4xl sm:text-base hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <span className="inline-block w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Subscribe'
          )}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-red-600 text-sm">{error}</p>
      )}
    </form>
  )
}
