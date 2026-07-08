'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Menu, X } from 'lucide-react'

const productLinks = [
  { label: 'How it works', href: '/#capture-section' },
]

const mainLinks = [
  { label: 'Team', href: '/team' },
  { label: 'Blog', href: '/blog' },
]

function BrandMark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <img
        src="/logos/butterfly-no-shadow-transparent-cropped.png"
        alt=""
        className="h-9 w-9 object-contain"
      />
      <span className="text-base font-bold tracking-tight text-app-text">MemSurf</span>
    </span>
  )
}

export default function YouLearnNavigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed left-0 right-0 top-0 z-[52] px-3 pt-3 sm:px-5">
      <nav className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 rounded-full border border-app-border bg-app-surface/95 px-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-md sm:px-5">
        <Link href="/" className="inline-flex items-center py-3" aria-label="MemSurf home">
          <BrandMark />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <div className="group relative">
            <button className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-app-textMuted transition hover:bg-app-surfaceElevated hover:text-app-text">
              Product
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="invisible absolute left-1/2 top-full w-56 -translate-x-1/2 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="rounded-3xl border border-app-border bg-app-surface p-2 shadow-[0_18px_48px_rgba(0,0,0,0.14)]">
                {productLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-2xl px-4 py-2.5 text-sm font-semibold text-app-textMuted transition hover:bg-app-surfaceElevated hover:text-app-text focus-visible:bg-app-surfaceElevated focus-visible:text-app-text focus-visible:outline-none"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-semibold text-app-textMuted transition hover:bg-app-surfaceElevated hover:text-app-text"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/download?src=website_nav"
            className="rounded-full bg-[var(--app-action)] px-4 py-2 text-sm font-bold text-[var(--app-action-text)] transition hover:opacity-[0.86] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-text focus-visible:ring-offset-2 focus-visible:ring-offset-app-canvas"
          >
            Download
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-app-surfaceElevated text-app-text md:hidden"
          onClick={() => setIsOpen((current) => !current)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {isOpen ? (
        <div className="mx-auto mt-2 max-w-6xl rounded-3xl border border-app-border bg-app-surface p-3 shadow-[0_18px_48px_rgba(0,0,0,0.14)] md:hidden">
          {[...productLinks, ...mainLinks, { label: 'Contact', href: '/contact' }].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-2xl px-4 py-3 text-sm font-semibold text-app-textMuted transition hover:bg-app-surfaceElevated hover:text-app-text"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/download?src=website_nav"
            className="mt-2 block rounded-full bg-[var(--app-action)] px-4 py-3 text-center text-sm font-bold text-[var(--app-action-text)]"
            onClick={() => setIsOpen(false)}
          >
            Download
          </Link>
        </div>
      ) : null}
    </header>
  )
}
