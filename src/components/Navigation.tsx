'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAmplitude } from '@/hooks/useAmplitude'

type NavigationProps = {
  isRevealed?: boolean
}

export default function Navigation({ isRevealed = true }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { track } = useAmplitude()

  const handleMenuToggle = () => {
    const nextState = !isOpen
    setIsOpen(nextState)
    track('mobile_menu_toggled', {
      state: nextState ? 'opened' : 'closed',
    })
  }

  const handleNavClick = (label: string, href: string, menuVariant: 'desktop' | 'mobile' | 'logo') => {
    track('navigation_link_clicked', {
      label,
      href,
      location: 'header',
      menu_variant: menuVariant,
    })
  }

  return (
    <motion.nav
      className="fixed top-3 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none"
      initial={{ opacity: 0, y: -16, filter: 'blur(8px)' }}
      animate={
        isRevealed
          ? { opacity: 1, y: 0, filter: 'blur(0px)' }
          : { opacity: 0, y: -16, filter: 'blur(8px)' }
      }
      transition={{ duration: 0.55, ease: 'easeOut', delay: isRevealed ? 0.05 : 0 }}
    >
      <div className="w-full pointer-events-auto">
        <div className="relative rounded-full border border-white/25 bg-app-surfaceElevated/70 shadow-[0_14px_44px_rgba(2,8,24,0.55),inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-3xl supports-[backdrop-filter]:bg-app-surfaceElevated/55">
          <div className="flex justify-between items-center h-[4.5rem] px-4 sm:px-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-app-softBlue to-app-lavender bg-clip-text text-transparent"
              onClick={() => handleNavClick('logo', '/', 'logo')}
            >
              <Image
                src="/memsurf-logo.svg"
                alt="MemSurf logo"
                width={72}
                height={72}
                className="h-[72px] w-[72px] translate-y-1"
                priority
              />
            </Link>
          </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-6 lg:space-x-8">
            <div className="relative group">
              <button className="flex items-center gap-1 text-app-textMuted hover:text-app-text transition-colors py-2 text-sm font-medium">
                Product
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-app-surfaceElevated rounded-lg shadow-xl border border-app-border overflow-hidden py-1">
                  <Link
                    href="/#how-it-works"
                    className="block px-4 py-2 text-sm text-app-textMuted hover:bg-app-border hover:text-app-text"
                    onClick={() => handleNavClick('how it works', '/#how-it-works', 'desktop')}
                  >
                    How it works
                  </Link>
                </div>
              </div>
            </div>
            <Link
              href="/team"
              className="text-app-textMuted hover:text-app-text transition-colors py-2 text-sm font-medium"
              onClick={() => handleNavClick('meet the team', '/team', 'desktop')}
            >
              Meet the Team
            </Link>
            <Link
              href="/blog"
              className="text-app-textMuted hover:text-app-text transition-colors py-2 text-sm font-medium"
              onClick={() => handleNavClick('blog', '/blog', 'desktop')}
            >
              Blog
            </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={handleMenuToggle}
                className="text-app-textMuted hover:text-app-text"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden mt-3 overflow-hidden"
            initial={{ maxHeight: 0 }}
            animate={{ maxHeight: 300 }}
            exit={{ maxHeight: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="px-4 pt-2 pb-4 space-y-2 rounded-3xl border border-white/15 bg-app-surface/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(2,8,24,0.35)]"
            >
              <div className="px-3 pt-2 pb-1 text-xs font-semibold text-app-textMuted/80 uppercase tracking-wider">Product</div>
              <Link
                href="/#how-it-works"
                className="block px-3 py-2 text-app-textMuted hover:bg-app-border rounded-md pl-6"
                onClick={() => {
                  handleNavClick('how it works', '/#how-it-works', 'mobile')
                  setIsOpen(false)
                }}
              >
                How it works
              </Link>
              <Link
                href="/team"
                className="block px-3 py-2 text-app-textMuted hover:bg-app-border rounded-md"
                onClick={() => {
                  handleNavClick('meet the team', '/team', 'mobile')
                  setIsOpen(false)
                }}
              >
                Meet the Team
              </Link>
              <Link
                href="/blog"
                className="block px-3 py-2 text-app-textMuted hover:bg-app-border rounded-md"
                onClick={() => {
                  handleNavClick('blog', '/blog', 'mobile')
                  setIsOpen(false)
                }}
              >
                Blog
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
