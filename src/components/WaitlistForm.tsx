'use client'

import { useEffect, useRef } from 'react'
import { useAmplitude } from '@/hooks/useAmplitude'

type WaitlistFormProps = {
  source?: string
}

export default function WaitlistForm({ source = 'homepage_waitlist' }: WaitlistFormProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { track } = useAmplitude()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let formEl: HTMLFormElement | null = null

    const handleInvalid = (event: Event) => {
      const target = event.target as HTMLInputElement | null
      const trimmedEmail = (target?.value ?? '').trim()

      track('waitlist_submitted', {
        source,
        status: 'invalid_email',
        is_valid_email: false,
        email_length: trimmedEmail.length,
      })
    }

    const handleSubmit = () => {
      const emailInput = formEl?.querySelector('input[type="email"]') as HTMLInputElement | null
      const trimmedEmail = (emailInput?.value ?? '').trim()
      const isValidEmail = /\S+@\S+\.\S+/.test(trimmedEmail)

      track('waitlist_submitted', {
        source,
        status: isValidEmail ? 'success' : 'invalid_email',
        is_valid_email: isValidEmail,
        email_length: trimmedEmail.length,
      })
    }

    const attachListener = () => {
      const foundForm = container.querySelector('form')
      if (foundForm && formEl !== foundForm) {
        formEl?.removeEventListener('submit', handleSubmit)
        formEl = foundForm as HTMLFormElement
        formEl.addEventListener('submit', handleSubmit)
      }
    }

    const observer = new MutationObserver(attachListener)
    observer.observe(container, { childList: true, subtree: true })
    attachListener()
    container.addEventListener('invalid', handleInvalid, true)

    return () => {
      observer.disconnect()
      formEl?.removeEventListener('submit', handleSubmit)
      container.removeEventListener('invalid', handleInvalid, true)
    }
  }, [track, source])

  return (
    <div
      ref={containerRef}
      className="ml-embedded w-full"
      data-form="ZKCdmE"
      aria-label="Join the waitlist"
    />
  )
}
