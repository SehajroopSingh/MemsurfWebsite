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
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link
              href="/"
              className="inline-block text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 tracking-tight"
              onClick={() => trackFooterNav('logo', '/', 'brand')}
            >
              Memsurf
            </Link>
            <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-sm">
              AI-powered learning platform that transforms content into interactive quizzes and helps you master knowledge with spaced repetition.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    onClick={() => trackSocialClick(social.label.toLowerCase(), social.href)}
                    className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-all duration-200 border border-gray-100"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Product */}
          <div className="col-span-1">
            <h3 className="text-gray-900 font-semibold mb-6 tracking-tight">Product</h3>
            <ul className="space-y-4">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-purple-600 transition-colors text-sm font-medium"
                    onClick={() => trackFooterNav(link.name.toLowerCase(), link.href, 'product')}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h3 className="text-gray-900 font-semibold mb-6 tracking-tight">Company</h3>
            <ul className="space-y-4">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-purple-600 transition-colors text-sm font-medium"
                    onClick={() => trackFooterNav(link.name.toLowerCase(), link.href, 'company')}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-gray-900 font-semibold mb-6 tracking-tight">Legal</h3>
            <ul className="space-y-4">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-purple-600 transition-colors text-sm font-medium"
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
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2025 Memsurf. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm flex items-center gap-1">
            Built with <span className="text-red-500 animate-pulse">❤️</span> for learners everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}
