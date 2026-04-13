'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Linkedin, ArrowRight } from 'lucide-react'

const founderPanelClass = [
    'flex flex-col items-center gap-6',
    'rounded-[2.5rem] border border-app-lavender/35',
    'bg-gradient-to-br from-app-lavender/22 via-app-surfaceElevated/95 to-app-softBlue/18',
    'p-5 sm:p-6 md:p-8 shadow-lg ring-1 ring-app-mint/10',
].join(' ')

const founderImageClass = [
    'relative aspect-square w-56 sm:w-64 overflow-hidden rounded-full',
    'border-[6px] border-white bg-white shadow-md',
].join(' ')

const founderNameClass = 'text-2xl font-bold text-app-text'

export default function TeamPage() {
    return (
        <main className="min-h-screen bg-transparent text-app-text selection:bg-app-softBlue/30">
            <Navigation />

            <section className="relative pt-28 pb-16 bg-gradient-to-b from-app-surface/80 via-transparent to-transparent">
                <div className="absolute inset-x-0 -top-32 h-64 bg-[radial-gradient(circle_at_top,_rgba(83,118,171,0.22),_transparent_55%)] pointer-events-none" />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <p className="text-sm font-semibold text-app-softBlue uppercase tracking-[0.2em] mb-4">
                        Meet the founders
                    </p>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-app-text">
                        Built by learners,
                        <br />
                        for learners.
                    </h1>
                    <p className="text-xl text-app-textMuted max-w-2xl mx-auto">
                        MemSurf is on a mission to put your memory on autopilot. We are building the tools we wished we had.
                    </p>
                </div>
            </section>

            <section className="py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
                        <div className={founderPanelClass}>
                            <div className={founderImageClass}>
                                <Image
                                    src="/team-sehaj.jpg"
                                    alt="Sehajroop Singh"
                                    fill
                                    className="object-cover object-top scale-105"
                                    sizes="(min-width: 1024px) 256px, 224px"
                                    priority
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="text-center">
                                    <h3 className={founderNameClass}>Sehaj Singh</h3>
                                    <p className="text-app-softBlue font-semibold uppercase tracking-[0.14em] text-xs mt-1">
                                        Founder & CEO
                                    </p>
                                </div>

                                <div className="prose prose-lg prose-invert max-w-none space-y-4 text-app-textMuted">
                                    <p>
                                        Hi, I’m Sehajroop, founder and CEO of MemSurf, and a lifelong learner with a mild intolerance for forgetting things I know I’ve already learned.
                                    </p>
                                    <p>
                                        I’ve worked across hospital environments, med tech, AI, and educational VR/XR. From volunteering in clinical settings as a pre med to building learning technology, one problem kept showing up everywhere. Human memory is a leaky bucket. We consume more information than ever and lose most of it within days, not because we are careless, but because our tools were not built for how memory actually works.
                                    </p>
                                    <p>
                                        I don’t think learning should be about endless consumption. It should be about mastery, being able to recall, connect, and actually use what you have learned when it matters. MemSurf grew out of an obsession with cognitive science and AI and a belief that memory, while fragile, is highly trainable. With the right reinforcement, what would normally fade can become durable. By combining intelligent processing with effortless spaced repetition, MemSurf provides a timely jolt of reinforcement for memories on the verge of fading, helping knowledge stay accessible when it matters.
                                    </p>
                                    <p>
                                        If this problem resonates with you, we are probably thinking about the same things. I would love to hear how you learn, forget, and try again.
                                    </p>
                                </div>

                                <div className="flex justify-center">
                                    <Link
                                        href="https://www.linkedin.com/in/sehajroop-singh/"
                                        target="_blank"
                                        className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-app-softBlue text-white font-semibold shadow-sm hover:opacity-90 transition-opacity"
                                    >
                                        <Linkedin className="w-5 h-5" />
                                        <span>Connect on LinkedIn</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className={founderPanelClass}>
                            <div className={founderImageClass}>
                                <Image
                                    src="/Alessia.jpg"
                                    alt="Alessia Canuto"
                                    fill
                                    className="object-cover object-center scale-105"
                                    sizes="(min-width: 1024px) 256px, 224px"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="text-center">
                                    <h3 className={founderNameClass}>Alessia Canuto</h3>
                                    <p className="text-app-softBlue font-semibold uppercase tracking-[0.14em] text-xs mt-1">
                                        Co-founder & COO
                                    </p>
                                </div>

                                <div className="prose prose-lg prose-invert max-w-none space-y-4 text-app-textMuted">
                                    <p>Hi, I'm Alessia, co-founder and COO of MemSurf.</p>
                                    <p>
                                        I've spent most of my career in consulting, policy, and strategy roles, trying to understand why so many systems do not work the way they are supposed to, and why the people who need them most usually get the short end of the stick.
                                    </p>
                                    <p>
                                        I care deeply about access: to education, opportunity, and the tools that help us actually move forward in our lives. Growth should not be a luxury product.
                                    </p>
                                    <p>
                                        At some point, it clicked that most people do not lack motivation or ambition, they lack time and structure. Good intentions are everywhere. Follow-through is hard. That realization is what led me to team up with Sehaj to build MemSurf: something that takes some of the mental load off and helps people make progress without having to rearrange their entire lives.
                                    </p>
                                    <p>
                                        My background is in behavioral science, economics, and public policy, and I've written a lot about cognitive biases, education reform, and access to opportunity. But more than anything, I'm focused on building things that are actually useful, not just theoretically elegant.
                                    </p>
                                    <p>
                                        Feel free to send me an email, DM me on social, or reach out just to say hi. Tell me what you are trying to learn, build, or get unstuck on--I'm always up for a chat :)
                                    </p>
                                </div>

                                <div className="flex justify-center">
                                    <Link
                                        href="https://www.linkedin.com/in/alessia-canuto-451a84226"
                                        target="_blank"
                                        className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-app-softBlue text-white font-semibold shadow-sm hover:opacity-90 transition-opacity"
                                    >
                                        <Linkedin className="w-5 h-5" />
                                        <span>Connect on LinkedIn</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 border-t border-app-border">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-semibold tracking-tight text-app-text">Get in touch</h2>
                    <p className="text-lg text-app-textMuted mb-8">
                        Have questions about MemSurf or want to collaborate? We would love to hear from you.
                    </p>
                    <div className="flex justify-center">
                        <Link
                            href="mailto:contact@memsurf.com"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-app-softBlue text-white font-semibold shadow-sm hover:opacity-90 transition-opacity"
                        >
                            <span>Email us</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
