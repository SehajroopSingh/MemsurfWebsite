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
    { name: 'Terms of Use (EULA)', href: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/' },
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
    <footer className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 backdrop-blur-sm">
      <div className="py-16 lg:py-20">
        {/* Bottom Bar */}
        <div className="border-t border-app-border pt-8">
          <div className="flex flex-col items-stretch gap-10 text-left lg:flex-row lg:items-start lg:justify-between">
            {/* Left Side: MemSurf Branding */}
            <div className="flex flex-col items-start">
              <Link
                href="/"
                className="mb-6 inline-flex items-center gap-3"
                onClick={() => trackFooterNav('logo', '/', 'brand')}
              >
                <img
                  src="/memsurf-logo.svg"
                  alt=""
                  className="h-9 w-9"
                />
                <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-app-softBlue via-app-lavender to-app-lilac bg-clip-text text-transparent">
                  MemSurf
                </span>
              </Link>
              {/* Copyright */}
              <p className="text-app-textMuted/80 text-sm">
                © 2025 MemSurf. All rights reserved.
              </p>
            </div>

            {/* Right Side: Two Columns */}
            <div className="grid w-full max-w-md grid-cols-2 justify-items-center self-center gap-10 sm:gap-16 lg:w-auto lg:max-w-none lg:justify-items-start lg:self-auto lg:gap-24">
              {/* Company */}
              <div className="text-center lg:text-left">
                <ul className="space-y-3">
                  {footerLinks.company.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="text-base font-semibold text-app-textMuted/90 hover:text-app-lavenderHi transition-colors lg:text-sm lg:font-medium"
                        onClick={() => trackFooterNav(link.name.toLowerCase(), link.href, 'company')}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div className="text-center lg:text-left">
                <ul className="space-y-3">
                  {footerLinks.legal.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="text-base font-semibold text-app-textMuted/90 hover:text-app-lavenderHi transition-colors lg:text-sm lg:font-medium"
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
