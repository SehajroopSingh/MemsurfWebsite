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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Memsurf
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {!isAuthenticated ? (
              <>
                <div className="relative group">
                  <button className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors py-2">
                    Product
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute top-full left-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1">
                      <Link href="/method" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                        How it works
                      </Link>
                    </div>
                  </div>
                </div>

                <Link href="/research" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Research
                </Link>
                <Link href="/homepage-tests" className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Tests</span>
                  Homepage Tests
                </Link>
                <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
                <Link href="/practice" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Practice
                </Link>
                <Link href="/capture/new" className="text-gray-700 hover:text-blue-600 transition-colors">
                  New Capture
                </Link>
                <div className="flex items-center gap-2 px-4 py-2 text-gray-700">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-700 hover:text-red-600 transition-colors flex items-center gap-2"
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
              className="text-gray-700 hover:text-blue-600"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-2 pb-4 space-y-2 bg-white border-t border-gray-200">
            {!isAuthenticated ? (
              <>
                <div className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</div>
                <Link
                  href="/method"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md pl-6 border-l-2 border-transparent hover:border-blue-500"
                  onClick={() => setIsOpen(false)}
                >
                  How it works
                </Link>
                <Link
                  href="/research"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Research
                </Link>
                <Link
                  href="/homepage-tests"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="inline-flex items-center gap-2">
                    Homepage Tests
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">New</span>
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/practice"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Practice
                </Link>
                <Link
                  href="/capture/new"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  New Capture
                </Link>
                <div className="px-3 py-2 text-gray-700 flex items-center gap-2">
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
