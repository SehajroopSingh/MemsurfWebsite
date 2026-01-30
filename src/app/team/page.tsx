'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Linkedin, ArrowRight } from 'lucide-react'

export default function TeamPage() {
    return (
        <main className="min-h-screen bg-white text-gray-900 selection:bg-blue-100">
            <Navigation />

            <section className="relative pt-28 pb-16 bg-gradient-to-b from-blue-50/60 via-white to-white">
                <div className="absolute inset-x-0 -top-32 h-64 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_55%)] pointer-events-none" />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <p className="text-sm font-semibold text-blue-600 uppercase tracking-[0.2em] mb-4">
                        Meet the founders
                    </p>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                        Built by learners,
                        <br />
                        for learners.
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl">
                        Memsurf is on a mission to put your memory on autopilot. We are building the tools we wished we had.
                    </p>
                </div>
            </section>

            <section className="py-16 border-t border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
                    <div className="space-y-4 max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                            The people behind the product
                        </h2>
                        <p className="text-lg text-gray-600">
                            Two founders obsessed with making follow-through easier for every learner.
                        </p>
                    </div>

                    <div className="grid gap-12">
                        <div className="grid md:grid-cols-5 gap-10 items-start">
                            <div className="md:col-span-2">
                                <div className="relative aspect-[10/9] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-white">
                                    <Image
                                        src="/sehajroop.png"
                                        alt="Sehajroop Singh"
                                        fill
                                        className="object-cover object-top"
                                        sizes="(min-width: 1024px) 480px, (min-width: 768px) 50vw, 100vw"
                                        priority
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-3 space-y-4">
                                <div>
                                    <h3 className="text-2xl font-bold">Sehajroop Singh</h3>
                                    <p className="text-blue-600 font-semibold uppercase tracking-[0.14em] text-xs mt-1">
                                        Founder & CEO
                                    </p>
                                </div>

                                <div className="prose prose-lg text-gray-700">
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

                                <div>
                                    <Link
                                        href="https://www.linkedin.com/in/sehajroop-singh/"
                                        target="_blank"
                                        className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-700 transition-colors"
                                    >
                                        <Linkedin className="w-5 h-5" />
                                        <span>Connect on LinkedIn</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-5 gap-10 items-start">
                            <div className="md:col-span-2">
                                <div className="relative aspect-[10/9] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-white">
                                    <Image
                                        src="/Alessia.jpg"
                                        alt="Alessia"
                                        fill
                                        className="object-cover object-center"
                                        sizes="(min-width: 1024px) 480px, (min-width: 768px) 50vw, 100vw"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-3 space-y-4">
                                <div>
                                    <h3 className="text-2xl font-bold">Alessia</h3>
                                    <p className="text-blue-600 font-semibold uppercase tracking-[0.14em] text-xs mt-1">
                                        Co-founder & COO
                                    </p>
                                </div>

                                <div className="prose prose-lg text-gray-700">
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
                                        Feel free to send me an email, DM me on social, or reach out just to say hi. Tell me what you are trying to learn, build, or get unstuck on, I'm always up for a chat :)
                                    </p>
                                </div>

                                <div>
                                    <Link
                                        href="https://www.linkedin.com/in/alessia-canuto-451a84226"
                                        target="_blank"
                                        className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-700 transition-colors"
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

            <section className="py-16 bg-gray-50 border-t border-gray-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-semibold tracking-tight">Get in touch</h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Have questions about Memsurf or want to collaborate? We would love to hear from you.
                    </p>
                    <div className="flex justify-center">
                        <Link
                            href="mailto:contact@memsurf.com"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-700 transition-colors"
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
