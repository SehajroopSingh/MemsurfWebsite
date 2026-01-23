'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface JoinCommunityProps {
  delay?: number
  className?: string
  centered?: boolean
}

export default function JoinCommunity({ delay = 0.4, className = '', centered = false }: JoinCommunityProps) {
  const justifyClass = centered ? 'justify-center' : 'justify-center lg:justify-start'
  
  return (
    <motion.div
      className={`relative w-full max-w-7xl mx-auto px-4 sm:px-4 z-20 flex flex-row items-center ${justifyClass} gap-4 sm:gap-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
    >
      <p className="text-2xl sm:text-base text-gray-700 font-medium whitespace-nowrap">
        Join our community
      </p>
      <a
        href="https://discord.gg/memsurf"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-xl sm:text-base text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium whitespace-nowrap border-2 border-black rounded-3xl pl-2 pr-4 py-2 sm:pl-1 sm:pr-3 sm:py-1.5"
        aria-label="Join our Discord community"
      >
        <img
          src="/logos/189-1890026_discord-discord-logo-black-png.png.png"
          alt="Discord"
          className="object-contain w-10 h-10 sm:w-8 sm:h-8"
        />
        Discord
      </a>
    </motion.div>
  )
}

