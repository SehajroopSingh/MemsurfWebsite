'use client'

import React from 'react'
import { motion } from 'framer-motion'
import WorkflowAnimation from './infographic/WorkflowAnimation'
import AppleLogoIcon from './AppleLogoIcon'

type HeroProps = {
    isRevealed?: boolean
    mountHeavyAssets?: boolean
    onPhoneReady?: () => void
    onCollageReady?: () => void
    onCollageLoadProgress?: (loaded: number, total: number) => void
}

export default function Hero({
    isRevealed = true,
    mountHeavyAssets = true,
}: HeroProps) {
    return (
        <section className="relative overflow-hidden bg-app-canvas pt-28 sm:pt-32">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col items-center justify-center px-4 pb-16 sm:px-6 lg:px-8">
                <motion.div
                    className="mx-auto flex max-w-4xl flex-col items-center text-center"
                    initial={{ opacity: 0, y: 18 }}
                    animate={isRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                >
                    <h1 className="text-5xl font-bold leading-tight tracking-normal text-app-text sm:text-6xl lg:text-7xl">
                        Remember anything you learn
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-app-textMuted sm:text-xl">
                        MemSurf turns notes, links, videos, and ideas into scheduled practice that keeps showing up at the right time.
                    </p>

                    <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                        <a
                            href="/download?src=website"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-[var(--app-action)] px-8 text-base font-bold text-[var(--app-action-text)] shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <AppleLogoIcon className="h-5 w-5" />
                            Download for iPhone
                        </a>
                        <a
                            href="#how-it-works"
                            className="inline-flex h-14 items-center justify-center rounded-full border border-app-border bg-app-surface px-8 text-base font-bold text-app-text transition-colors hover:bg-app-surfaceElevated"
                        >
                            See how it works
                        </a>
                    </div>
                </motion.div>
            </div>

            {mountHeavyAssets ? (
                <WorkflowAnimation />
            ) : null}
        </section>
    )
}
