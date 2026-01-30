'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useAmplitude } from '@/hooks/useAmplitude'

interface JoinCommunityProps {
  delay?: number
  className?: string
  centered?: boolean
  location?: string
  textColor?: string
  invertIcon?: boolean
}

export default function JoinCommunity({ delay = 0.4, className = '', centered = false, location = 'unknown', title = 'Join our community', textColor = 'text-gray-700', invertIcon = false }: JoinCommunityProps & { title?: string, textColor?: string, invertIcon?: boolean }) {
  const { track } = useAmplitude()
  const justifyClass = centered ? 'justify-center' : 'justify-center lg:justify-start'

  const handleDiscordClick = () => {
    track('discord_link_clicked', {
      location,
      discord_url: 'https://discord.gg/vV2YgzXArg'
    })
  }

  return (
    <motion.div
      className={`relative w-full max-w-7xl mx-auto px-4 sm:px-4 z-20 flex flex-row items-center ${justifyClass} gap-4 sm:gap-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
    >
      <p className={`text-2xl sm:text-base font-medium whitespace-nowrap ${textColor}`}>
        {title}
      </p>
      <a
        href="https://discord.gg/vV2YgzXArg"
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleDiscordClick}
        className={`inline-flex items-center gap-2 text-xl sm:text-base ${textColor} hover:opacity-80 transition-all duration-200 font-medium whitespace-nowrap border-2 border-current rounded-full sm:rounded-3xl pl-2 pr-4 py-2 sm:pl-1 sm:pr-3 sm:py-1.5`}
        aria-label="Join our Discord community"
      >
        <div className="overflow-hidden h-10 w-12 sm:h-8 sm:w-10 flex items-center justify-center">
          <img
            src="/logos/189-1890026_discord-discord-logo-black-png.png.png"
            alt="Discord"
            className={`object-contain w-full h-full scale-125 ${invertIcon ? 'invert' : ''}`}
          />
        </div>
        Discord
      </a>
    </motion.div>
  )
}

