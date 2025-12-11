'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import Image from 'next/image'

interface Institution {
  name: string
  key: string // Used for filename
  alt: string
  cdnUrl: string // CDN fallback URL
}

// List of all possible institutions with CDN fallbacks
const allInstitutions: Institution[] = [
  { name: 'UCLA', key: 'ucla', alt: 'UCLA Logo', cdnUrl: 'https://logo.clearbit.com/ucla.edu' },
  { name: 'UC Berkeley', key: 'uc-berkeley', alt: 'UC Berkeley Logo', cdnUrl: 'https://logo.clearbit.com/berkeley.edu' },
  { name: 'Stanford', key: 'stanford', alt: 'Stanford Logo', cdnUrl: 'https://logo.clearbit.com/stanford.edu' },
  { name: 'MIT', key: 'mit', alt: 'MIT Logo', cdnUrl: 'https://logo.clearbit.com/mit.edu' },
  { name: 'Harvard', key: 'harvard', alt: 'Harvard Logo', cdnUrl: 'https://logo.clearbit.com/harvard.edu' },
  { name: 'Yale', key: 'yale', alt: 'Yale Logo', cdnUrl: 'https://logo.clearbit.com/yale.edu' },
  { name: 'Princeton', key: 'princeton', alt: 'Princeton Logo', cdnUrl: 'https://logo.clearbit.com/princeton.edu' },
  { name: 'Airbnb', key: 'airbnb', alt: 'Airbnb Logo', cdnUrl: 'https://logo.clearbit.com/airbnb.com' },
  { name: 'Google', key: 'google', alt: 'Google Logo', cdnUrl: 'https://logo.clearbit.com/google.com' },
  { name: 'Tinder', key: 'tinder', alt: 'Tinder Logo', cdnUrl: 'https://www.tinderpressroom.com/wp-content/uploads/2018/09/Tinder_Logo_Red.png' },
  { name: 'Apple', key: 'apple', alt: 'Apple Logo', cdnUrl: 'https://logo.clearbit.com/apple.com' },
  { name: 'Microsoft', key: 'microsoft', alt: 'Microsoft Logo', cdnUrl: 'https://logo.clearbit.com/microsoft.com' },
  { name: 'Meta', key: 'meta', alt: 'Meta Logo', cdnUrl: 'https://logo.clearbit.com/meta.com' },
  { name: 'Netflix', key: 'netflix', alt: 'Netflix Logo', cdnUrl: 'https://logo.clearbit.com/netflix.com' },
  { name: 'Amazon', key: 'amazon', alt: 'Amazon Logo', cdnUrl: 'https://logo.clearbit.com/amazon.com' },
]

// Helper function to get logo path (tries formats in order)
const getLogoPath = (key: string): string => {
  // Default to png, but Image component will try to load it
  // The useEffect check will have already verified the file exists
  return `/logos/${key}.png`
}

export default function InstitutionScroll() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [availableInstitutions, setAvailableInstitutions] = useState<Institution[]>([])
  const [logoPaths, setLogoPaths] = useState<Map<string, string>>(new Map())
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set())
  const x = useMotionValue(0)

  // Check which logos are available locally, fallback to CDN
  useEffect(() => {
    const checkLogos = async () => {
      const formats = ['svg', 'png', 'jpg', 'jpeg']
      const pathsMap = new Map<string, string>()
      const available: Institution[] = []

      const checkPromises = allInstitutions.map(async (institution) => {
        // First check for local logo files
        for (const format of formats) {
          const path = `/logos/${institution.key}.${format}`
          try {
            const response = await fetch(path, { method: 'HEAD' })
            if (response.ok) {
              pathsMap.set(institution.key, path)
              return institution
            }
          } catch {
            // Continue to next format
          }
        }

        // If no local logo found, use CDN fallback
        pathsMap.set(institution.key, institution.cdnUrl)
        return institution
      })

      const results = await Promise.all(checkPromises)
      results.forEach((inst) => {
        if (inst) available.push(inst)
      })

      setLogoPaths(pathsMap)
      setAvailableInstitutions(available)
    }

    checkLogos()
  }, [])

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.scrollWidth / 3 // Divide by 3 since we have 3 copies
        setContainerWidth(width)
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [availableInstitutions])

  useEffect(() => {
    if (containerWidth > 0 && availableInstitutions.length > 0) {
      const controls = animate(x, -containerWidth, {
        duration: 30,
        repeat: Infinity,
        ease: 'linear',
      })
      return controls.stop
    }
  }, [containerWidth, x, availableInstitutions])

  const handleImageError = (key: string, institution: Institution) => {
    setFailedLogos((prev) => new Set(prev).add(key))
    // Try CDN fallback if local logo failed
    const currentPath = logoPaths.get(key)
    if (currentPath && currentPath.startsWith('/logos/')) {
      // Local logo failed, try CDN
      setLogoPaths((prev) => {
        const newMap = new Map(prev)
        newMap.set(key, institution.cdnUrl)
        return newMap
      })
      setFailedLogos((prev) => {
        const newSet = new Set(prev)
        newSet.delete(key) // Remove from failed so it can retry with CDN
        return newSet
      })
    } else {
      // CDN also failed, remove from display
      setAvailableInstitutions((prev) => prev.filter((inst) => inst.key !== key))
    }
  }

  // Duplicate the array multiple times for seamless infinite scroll
  const duplicatedInstitutions = [...availableInstitutions, ...availableInstitutions, ...availableInstitutions]

  return (
    <section className="py-10 md:py-6 bg-white border-y border-gray-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
            Trusted by learners from
          </p>
        </div>

        <div className="relative overflow-hidden">
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

          <div className="flex overflow-hidden">
            <motion.div
              ref={containerRef}
              style={{ x }}
              className="flex gap-12 md:gap-16 flex-shrink-0 items-center"
            >
              {duplicatedInstitutions.length > 0 ? (
                duplicatedInstitutions
                  .map((institution, index) => {
                    const logoPath = logoPaths.get(institution.key) || institution.cdnUrl

                    return (
                      <div
                        key={`${institution.key}-${index}`}
                        className="group flex-shrink-0 flex flex-col items-center justify-center cursor-default"
                      >
                        <div className="relative w-24 h-12 md:w-32 md:h-16 flex items-center justify-center opacity-40 grayscale transition-all duration-300 hover:grayscale-0 hover:opacity-100">
                          <Image
                            src={logoPath}
                            alt={institution.alt}
                            width={120}
                            height={60}
                            className="object-contain max-w-full max-h-full"
                            unoptimized
                            onError={() => handleImageError(institution.key, institution)}
                          />
                        </div>
                      </div>
                    )
                  })
              ) : (
                <div className="flex-shrink-0 px-4 text-center text-gray-500">
                  <p className="text-sm">Loading institutions...</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

