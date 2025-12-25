'use client'

import { useAmplitudeInit } from '@/hooks/useAmplitude'
import { useEffect } from 'react'

/**
 * Client component to initialize Amplitude
 * Add this to your root layout
 */
export function AmplitudeProvider({ children }: { children: React.ReactNode }) {
  useAmplitudeInit()

  return <>{children}</>
}

