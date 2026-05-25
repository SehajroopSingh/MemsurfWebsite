'use client'

import LiquidGlassNavigation from '@/components/LiquidGlassNavigation'

type NavigationProps = {
  isRevealed?: boolean
}

export default function Navigation({ isRevealed: _isRevealed = true }: NavigationProps) {
  return <LiquidGlassNavigation />
}
