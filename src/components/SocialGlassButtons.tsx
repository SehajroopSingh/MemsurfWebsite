'use client'

import { Linkedin, Mail } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

type SocialGlassButtonsProps = {
  className?: string
}

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const socialIconClassName = 'relative z-10 w-8 h-8 sm:w-12 sm:h-12 md:w-8 md:h-8 transition-transform duration-300 group-hover:scale-110'

const socialLinks = [
  {
    label: 'Discord',
    href: 'https://discord.gg/vV2YgzXArg',
    external: true,
    isPill: true,
    icon: (
      <img
        src="/logos/189-1890026_discord-discord-logo-black-png.png.png"
        alt=""
        className="relative z-10 h-8 w-8 object-contain invert transition-transform duration-300 group-hover:scale-110 sm:h-10 sm:w-10"
      />
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/memsurf/',
    external: true,
    isPill: false,
    icon: <Linkedin className={socialIconClassName} />,
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@memsurf',
    external: true,
    isPill: false,
    icon: <TikTokIcon className={socialIconClassName} />,
  },
  {
    label: 'X',
    href: 'https://x.com/memsurf',
    external: true,
    isPill: false,
    icon: <XIcon className={socialIconClassName} />,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/memsurfai/',
    external: true,
    isPill: false,
    icon: <InstagramIcon className={socialIconClassName} />,
  },
  {
    label: 'Email',
    href: 'mailto:contact@memsurf.com',
    external: false,
    isPill: false,
    icon: <Mail className={socialIconClassName} />,
  },
]

export default function SocialGlassButtons({ className = '' }: SocialGlassButtonsProps) {
  const shouldReduceMotion = useReducedMotion()

  const socialContainerVariants = shouldReduceMotion
    ? undefined
    : {
        hidden: {},
        visible: {
          transition: {
            delayChildren: 0.05,
            staggerChildren: 0.08,
          },
        },
      }

  const socialButtonVariants = shouldReduceMotion
    ? undefined
    : {
        hidden: (index: number) => ({
          opacity: 0,
          x: index === 0 ? -14 : -42,
          scale: 0.72,
          filter: 'blur(8px)',
        }),
        visible: {
          opacity: 1,
          x: 0,
          scale: 1,
          filter: 'blur(0px)',
          transition: {
            type: 'spring',
            stiffness: 480,
            damping: 25,
            mass: 0.75,
          },
        },
      }

  return (
    <motion.div
      className={`flex flex-row gap-2 sm:gap-4 md:gap-5 justify-start items-center w-full max-w-7xl px-4 sm:px-4 flex-wrap ${className}`}
      initial={shouldReduceMotion ? false : 'hidden'}
      whileInView={shouldReduceMotion ? undefined : 'visible'}
      viewport={{ once: true, amount: 0.45 }}
      variants={socialContainerVariants}
    >
      {socialLinks.map((link, index) => (
        <motion.a
          key={link.label}
          href={link.href}
          target={link.external ? '_blank' : undefined}
          rel={link.external ? 'noopener noreferrer' : undefined}
          aria-label={link.label}
          custom={index}
          variants={socialButtonVariants}
          whileHover={shouldReduceMotion ? undefined : { y: -5, scale: 1.06 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 520, damping: 20 }}
          className={`group relative flex h-16 overflow-hidden rounded-full border border-white/25 bg-white/[0.10] text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.34),0_18px_42px_rgba(2,8,24,0.34)] backdrop-blur-2xl items-center justify-center transition-colors duration-300 hover:border-app-mint/70 hover:bg-white/[0.16] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-mint/75 focus-visible:ring-offset-2 focus-visible:ring-offset-app-canvas ${
            link.isPill
              ? 'flex-[1.45] gap-2 px-4 sm:flex-none sm:h-20 sm:min-w-[10.5rem] sm:px-6 md:h-20'
              : 'flex-1 w-auto sm:flex-none sm:w-20 sm:h-20 md:w-20 md:h-20'
          }`}
        >
          <span className="pointer-events-none absolute inset-px rounded-full bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.42),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.16),transparent_62%)] opacity-75 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="pointer-events-none absolute -left-12 top-0 h-full w-10 rotate-12 bg-white/25 blur-sm transition-transform duration-700 group-hover:translate-x-40" />
          <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/15" />
          {link.icon}
          {link.isPill && (
            <span className="relative z-10 hidden text-sm font-semibold tracking-normal text-white sm:inline">
              Discord
            </span>
          )}
        </motion.a>
      ))}
    </motion.div>
  )
}
