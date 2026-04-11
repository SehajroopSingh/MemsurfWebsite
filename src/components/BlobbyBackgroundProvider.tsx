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
  const [mode, setBackgroundMode] = useState<BlobbyBackgroundMode>(() =>
    pathname === '/' ? 'loading' : 'idle',
  )
  const value = useMemo(
    () => ({
      mode,
      setBackgroundMode,
    }),
    [mode],
  )

  return (
    <BlobbyBackgroundContext.Provider value={value}>
      <BlobbyBackground mode={mode} />
      {children}
    </BlobbyBackgroundContext.Provider>
  )
}
