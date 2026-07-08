'use client'

import LiquidGlassNavigation from '@/components/LiquidGlassNavigation'
import YouLearnNavigation from '@/components/YouLearnNavigation'

type NavigationProps = {
  isRevealed?: boolean
  variant?: 'liquid' | 'youlearn'
}

export default function Navigation({ isRevealed: _isRevealed = true, variant = 'liquid' }: NavigationProps) {
  if (variant === 'youlearn') {
    return <YouLearnNavigation />
  }

  return <LiquidGlassNavigation />
}
