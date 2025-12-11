'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Menu, X, LogOut, User, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, logout, user } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
    setIsOpen(false)
  }

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
            {!isAuthenticated ? (
              <>
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
                <Link href="/homepage-tests" className="text-gray-800 hover:text-gray-900 transition-colors text-sm font-medium">
                  Homepage Tests
                </Link>
                <Link href="/login" className="text-gray-800 hover:text-gray-900 transition-colors text-sm font-medium">
                  Sign In
                </Link>
                <Link href="/register" className="ml-2 px-5 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-all text-sm font-medium">
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="text-gray-800 hover:text-gray-900 transition-colors text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/practice" className="text-gray-800 hover:text-gray-900 transition-colors text-sm font-medium">
                  Practice
                </Link>
                <Link href="/capture/new" className="text-gray-800 hover:text-gray-900 transition-colors text-sm font-medium">
                  New Capture
                </Link>
                <div className="flex items-center gap-2 px-4 py-2 text-gray-800">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-800 hover:text-red-600 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
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
            {!isAuthenticated ? (
              <>
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
                <Link
                  href="/homepage-tests"
                  className="block px-3 py-2 text-gray-800 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Homepage Tests
                </Link>
                <Link
                  href="/login"
                  className="block px-3 py-2 text-gray-800 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-gray-800 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/practice"
                  className="block px-3 py-2 text-gray-800 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Practice
                </Link>
                <Link
                  href="/capture/new"
                  className="block px-3 py-2 text-gray-800 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  New Capture
                </Link>
                <div className="px-3 py-2 text-gray-800 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
