'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Linkedin, ArrowRight } from 'lucide-react'

export default function TeamPage() {
    return (
        <main className="min-h-screen text-white selection:bg-blue-500/30">
            <Navigation />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                            Built by learners, <br />
                            for learners.
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 leading-relaxed max-w-2xl">
                            Memsurf is on a mission to put your memory on autopilot. We're building the tools we wished we had.
                        </p>
                    </div>
                </div>
            </section>

            {/* Founder Profile */}
            <section className="py-24 border-t border-white/5 bg-[#050505]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">

                        {/* Image Column */}
                        <div className="col-span-1 md:col-span-5 relative group">
                            <div className="relative aspect-[10/9] w-full max-w-md mx-auto md:mr-auto overflow-hidden rounded-2xl bg-gray-900 border border-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                                <Image
                                    src="/sehajroop.png"
                                    alt="Sehajroop Singh"
                                    fill
                                    className="object-cover object-top scale-125 origin-top"
                                    priority
                                />

                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                                <div className="absolute bottom-6 left-6 right-6">
                                    <h3 className="text-2xl font-bold text-white mb-1">Sehajroop Singh</h3>
                                    <p className="text-blue-400 font-medium tracking-wide text-sm uppercase">Founder & CEO</p>
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -z-10 top-10 -right-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl opacity-50 animate-pulse" />
                            <div className="absolute -z-10 -bottom-10 -left-10 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '1s' }} />
                        </div>

                        {/* Content Column */}
                        <div className="col-span-1 md:col-span-7 space-y-8">
                            <div className="space-y-6">
                                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                    The Vision
                                </h2>

                                <div className="prose prose-lg prose-invert text-gray-400">
                                    <p>
                                        Hi, I'm Sehajroop. I founded Memsurf with a simple but ambitious goal: to fix the "leaky bucket" of human memory.
                                    </p>
                                    <p>
                                        We consume more information today than ever before, but we retain a fraction of it. Whether it's articles, podcasts, or technical documentation, most of that knowledge disappears within days.
                                    </p>
                                    <p>
                                        I believe that learning shouldn't be about endless consumption—it should be about mastery. Memsurf is the result of my obsession with cognitive science and AI, designed to be the "missing hard drive" for your brain.
                                    </p>
                                    <p>
                                        By combining intelligent processing with effortless spaced repetition, we're building a future where you don't just read information—you own it forever.
                                    </p>
                                </div>

                                <div className="pt-6">
                                    <Link
                                        href="https://www.linkedin.com/in/sehajroop-singh/"
                                        target="_blank"
                                        className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors group"
                                    >
                                        <Linkedin className="w-5 h-5 text-blue-400" />
                                        <span>Connect on LinkedIn</span>
                                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Join Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl font-semibold text-white mb-6">
                        Join us on this journey
                    </h2>
                    <p className="text-gray-400 mb-10 max-w-xl mx-auto">
                        We're just getting started. If you're passionate about the future of learning and human augmentation, we'd love to hear from you.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/careers"
                            className="px-8 py-3 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
                        >
                            View Careers
                        </Link>
                        <Link
                            href="mailto:contact@memsurf.app"
                            className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
