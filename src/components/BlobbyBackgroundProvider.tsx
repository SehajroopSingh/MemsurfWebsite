'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import BlobbyBackground, { BlobbyBackgroundMode } from './BlobbyBackground'

type BlobbyBackgroundContextValue = {
  mode: BlobbyBackgroundMode
  setBackgroundMode: (mode: BlobbyBackgroundMode) => void
}

const BlobbyBackgroundContext = createContext<BlobbyBackgroundContextValue | null>(null)

export function useBlobbyBackground() {
  const context = useContext(BlobbyBackgroundContext)

  if (!context) {
    throw new Error('useBlobbyBackground must be used inside BlobbyBackgroundProvider')
  }

  return context
}

export default function BlobbyBackgroundProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const usesFlatBackground =
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/team' ||
    pathname === '/blog' ||
    pathname === '/download' ||
    pathname === '/coming-soon' ||
    pathname.startsWith('/blog/')
  const [mode, setBackgroundMode] = useState<BlobbyBackgroundMode>('idle')
  const value = useMemo(
    () => ({
      mode,
      setBackgroundMode,
    }),
    [mode],
  )

  return (
    <BlobbyBackgroundContext.Provider value={value}>
      {usesFlatBackground ? null : <BlobbyBackground mode={mode} />}
      {children}
    </BlobbyBackgroundContext.Provider>
  )
}
