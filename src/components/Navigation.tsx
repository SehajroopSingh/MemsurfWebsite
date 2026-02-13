'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAmplitude } from '@/hooks/useAmplitude'

export default function Navigation() {
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-[#8c648d] bg-clip-text text-transparent"
              onClick={() => handleNavClick('logo', '/', 'logo')}
            >
              Memsurf
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6 lg:space-x-8">
            <div className="relative group">
              <button className="flex items-center gap-1 text-gray-800 hover:text-gray-900 transition-colors py-2 text-sm font-medium">
                Product
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden py-1">
                  <Link
                    href="/#how-it-works"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    onClick={() => handleNavClick('how it works', '/#how-it-works', 'desktop')}
                  >
                    How it works
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={handleMenuToggle}
              className="text-gray-800 hover:text-gray-900"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden overflow-hidden"
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
              className="px-4 pt-2 pb-4 space-y-2 bg-white border-t border-gray-100"
            >
              <div className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</div>
              <Link
                href="/#how-it-works"
                className="block px-3 py-2 text-gray-800 hover:bg-gray-50 rounded-md pl-6"
                onClick={() => {
                  handleNavClick('how it works', '/#how-it-works', 'mobile')
                  setIsOpen(false)
                }}
              >
                How it works
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
