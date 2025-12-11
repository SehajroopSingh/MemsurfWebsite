'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-[#8c648d] bg-clip-text text-transparent">
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
                  <Link href="/method" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                    How it works
                  </Link>
                  <Link href="/use-cases" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                    Customer Use cases
                  </Link>
                </div>
              </div>
            </div>

            <Link href="/research" className="text-gray-800 hover:text-gray-900 transition-colors text-sm font-medium">
              Research
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-800 hover:text-gray-900"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-2 pb-4 space-y-2 bg-white border-t border-gray-100">
            <div className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</div>
            <Link
              href="/method"
              className="block px-3 py-2 text-gray-800 hover:bg-gray-50 rounded-md pl-6"
              onClick={() => setIsOpen(false)}
            >
              How it works
            </Link>
            <Link
              href="/use-cases"
              className="block px-3 py-2 text-gray-800 hover:bg-gray-50 rounded-md pl-6"
              onClick={() => setIsOpen(false)}
            >
              Customer Use cases
            </Link>
            <Link
              href="/research"
              className="block px-3 py-2 text-gray-800 hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Research
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
