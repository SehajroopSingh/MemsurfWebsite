'use client'

import React from 'react'
import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'
import { useAmplitude } from '@/hooks/useAmplitude'

const footerLinks = {
  company: [
    { name: 'Blog', href: '/blog' },
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
  { icon: Mail, href: 'mailto:contact@memsurf.com', label: 'Email' },
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
    <footer className="border-t border-app-border/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        {/* Bottom Bar */}
        <div className="border-t border-app-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            {/* Left Side: MemSurf Branding and Meet the Team */}
            <div className="flex flex-col">
              <Link
                href="/"
                className="inline-block text-2xl font-bold bg-gradient-to-r from-app-softBlue via-app-lavender to-app-lilac bg-clip-text text-transparent mb-4 tracking-tight"
                onClick={() => trackFooterNav('logo', '/', 'brand')}
              >
                MemSurf
              </Link>
              <Link
                href="/team"
                className="text-app-textMuted hover:text-app-blueBright transition-colors text-sm font-medium mb-6"
                onClick={() => trackFooterNav('meet the team', '/team', 'brand')}
              >
                Meet the Team
              </Link>
              {/* Copyright */}
              <p className="text-app-textMuted/80 text-sm">
                © 2025 MemSurf. All rights reserved.
              </p>
            </div>

            {/* Right Side: Two Columns */}
            <div className="grid grid-cols-2 gap-8 md:gap-12 lg:gap-24">
              {/* Company */}
              <div className="text-left">
                <ul className="space-y-3">
                  {footerLinks.company.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="text-app-textMuted/80 hover:text-app-lavenderHi transition-colors text-sm font-medium"
                        onClick={() => trackFooterNav(link.name.toLowerCase(), link.href, 'company')}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div className="text-left">
                <ul className="space-y-3">
                  {footerLinks.legal.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="text-app-textMuted/80 hover:text-app-lavenderHi transition-colors text-sm font-medium"
                        onClick={() => trackFooterNav(link.name.toLowerCase(), link.href, 'legal')}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
