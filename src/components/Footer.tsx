'use client'

import React from 'react'
import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'
import { useAmplitude } from '@/hooks/useAmplitude'

const footerLinks = {
  product: [
    { name: 'Features', href: '/#features' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Testimonials', href: '/#testimonials' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Team', href: '/team' },
    { name: 'Blog', href: '/blog' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms-of-service' },
    { name: 'Cookie Policy', href: '/cookie-policy' },
  ],
}

const socialLinks = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:support@memsurf.app', label: 'Email' },
]

export default function Footer() {
  const { track } = useAmplitude()

  const trackFooterNav = (label: string, href: string, section: string) => {
    track('navigation_link_clicked', {
      label,
      href,
      location: 'footer',
      menu_variant: section,
    })
  }

  const trackSocialClick = (platform: string, href: string) => {
    track('social_link_clicked', {
      platform,
      href,
      location: 'footer',
    })
  }

  return (
    <footer className="border-t border-gray-100/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-3 gap-4 md:gap-12 lg:gap-24 mb-16 justify-items-center max-w-4xl mx-auto">

          {/* Product */}
          <div className="col-span-1 text-center">
            <h3 className="text-gray-900 font-semibold mb-2 md:mb-6 tracking-tight text-sm md:text-base">Product</h3>
            <ul className="space-y-1 md:space-y-4">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-purple-600 transition-colors text-base md:text-sm font-medium"
                    onClick={() => trackFooterNav(link.name.toLowerCase(), link.href, 'product')}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1 text-center">
            <h3 className="text-gray-900 font-semibold mb-2 md:mb-6 tracking-tight text-sm md:text-base">Company</h3>
            <ul className="space-y-1 md:space-y-4">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-purple-600 transition-colors text-base md:text-sm font-medium"
                    onClick={() => trackFooterNav(link.name.toLowerCase(), link.href, 'company')}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1 text-center">
            <h3 className="text-gray-900 font-semibold mb-2 md:mb-6 tracking-tight text-sm md:text-base">Legal</h3>
            <ul className="space-y-1 md:space-y-4">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-purple-600 transition-colors text-base md:text-sm font-medium"
                    onClick={() => trackFooterNav(link.name.toLowerCase(), link.href, 'legal')}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-8">
          {/* Memsurf Branding and Meet the Founder */}
          <div className="flex flex-col items-center mb-8">
            <Link
              href="/"
              className="inline-block text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 tracking-tight"
              onClick={() => trackFooterNav('logo', '/', 'brand')}
            >
              Memsurf
            </Link>
            <Link
              href="/team"
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
              onClick={() => trackFooterNav('meet the founder', '/team', 'brand')}
            >
              Meet the Founder
            </Link>
          </div>


          {/* Copyright and Built with */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 Memsurf. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm flex items-center gap-1">
              Built with <span className="text-red-500 animate-pulse">❤️</span> for learners everywhere
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
