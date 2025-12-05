'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'

export default function IdgafCodedHome() {
    const [clicks, setClicks] = useState(0)
    const [chaos, setChaos] = useState(false)

    return (
        <main className={`min-h-screen font-sans ${chaos ? 'invert bg-white' : 'bg-[#1a1a1a] text-[#a0a0a0]'}`}>
            <Navigation />

            {/* Chaos Toggle */}
            <div className="fixed top-24 right-4 z-50">
                <button
                    onClick={() => setChaos(!chaos)}
                    className="bg-red-600 text-white px-4 py-2 text-xs uppercase hover:bg-red-700"
                >
                    {chaos ? 'Make it normal' : 'Make it worse'}
                </button>
            </div>

            {/* Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-4xl md:text-9xl font-bold mb-4 tracking-tighter text-white">
                    meh.surf
                </h1>
                <p className="text-xl md:text-2xl mb-12 max-w-xl text-center lowercase">
                    look. you have to learn this stuff eventually.
                    might as well do it here. or don't. i'm a website, not a cop.
                </p>

                <div className="flex flex-col gap-4 w-full max-w-xs">
                    <button className="w-full py-4 bg-white text-black font-bold hover:bg-gray-200 transition-colors lowercase">
                        Start i guess
                    </button>
                    <button className="w-full py-4 border border-[#333] text-[#666] hover:text-white hover:border-white transition-colors lowercase">
                        nah i'm good
                    </button>
                </div>
            </section>

            {/* Useless Button Section */}
            <section className="py-24 border-t border-[#333] text-center">
                <h2 className="text-2xl font-bold text-white mb-8 lowercase">The Procrastination Station</h2>
                <div className="inline-block p-12 border border-[#333] rounded-lg bg-[#222]">
                    <p className="mb-4 text-sm">Click this button to accomplish absolutely nothing.</p>
                    <button
                        onClick={() => setClicks(c => c + 1)}
                        className="w-32 h-32 rounded-full bg-[#333] hover:bg-[#444] active:scale-95 transition-all flex items-center justify-center text-2xl font-bold text-white shadow-[0_0_0_10px_#222]"
                    >
                        {clicks}
                    </button>
                    <p className="mt-4 text-xs text-[#555]">
                        {clicks === 0 ? "You haven't wasted any time yet." : `You have wasted ${clicks} clicks of time.`}
                    </p>
                </div>
            </section>

            {/* Features (Brutalist List) */}
            <section className="py-24 border-t border-[#333]">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-6xl font-black text-[#333] mb-12 uppercase">Stuff we do</h2>
                    <ul className="space-y-8">
                        {[
                            "we make quizzes so you don't have to.",
                            "we remind you to study so you don't fail.",
                            "we have a dark mode because your eyes hurt.",
                            "we don't track your data because we don't care."
                        ].map((item, i) => (
                            <li key={i} className="text-2xl md:text-4xl hover:text-white hover:pl-4 transition-all cursor-default border-b border-[#333] pb-4">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </main>
    )
}
