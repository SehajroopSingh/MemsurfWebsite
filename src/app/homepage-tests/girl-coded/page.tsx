'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Star, Heart, Cloud, Moon, Sun } from 'lucide-react'
import Navigation from '@/components/Navigation'

export default function GirlCodedHome() {
    const [manifestation, setManifestation] = useState('')
    const [sparkles, setSparkles] = useState<{ id: number, x: number, y: number }[]>([])

    const addSparkle = (e: React.MouseEvent) => {
        const newSparkle = {
            id: Date.now(),
            x: e.clientX,
            y: e.clientY
        }
        setSparkles(prev => [...prev, newSparkle])
        setTimeout(() => {
            setSparkles(prev => prev.filter(s => s.id !== newSparkle.id))
        }, 1000)
    }

    return (
        <main className="min-h-screen bg-[#fff0f5] text-[#8b5a8b] font-serif selection:bg-pink-200" onClick={addSparkle}>
            <Navigation />

            {/* Floating Sparkles */}
            {sparkles.map(s => (
                <motion.div
                    key={s.id}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0, y: -20 }}
                    className="fixed pointer-events-none text-pink-400 z-50"
                    style={{ left: s.x, top: s.y }}
                >
                    <Sparkles className="w-6 h-6" />
                </motion.div>
            ))}

            {/* Hero Section */}
            <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-pink-100 to-[#fff0f5]"></div>
                {/* Decorative Clouds */}
                <motion.div animate={{ x: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute top-20 left-20 text-white opacity-50"><Cloud className="w-32 h-32" /></motion.div>
                <motion.div animate={{ x: [0, -30, 0] }} transition={{ repeat: Infinity, duration: 7 }} className="absolute top-40 right-20 text-white opacity-60"><Cloud className="w-24 h-24" /></motion.div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-white rounded-full shadow-sm mb-8 text-pink-400"
                    >
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium tracking-wide uppercase">Romanticize Your Life</span>
                        <Star className="w-4 h-4 fill-current" />
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl font-medium mb-8 tracking-tight text-[#d48c9e]">
                        The Academic<br />
                        <span className="italic font-light text-[#b06e80]">Dreamscape</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-[#8b5a8b] mb-12 max-w-2xl mx-auto leading-relaxed">
                        Studying isn't a chore. It's a ritual.
                        Light a candle, grab your iced coffee, and let us handle the heavy lifting.
                    </p>

                    <div className="flex justify-center gap-6">
                        <button className="px-8 py-4 bg-[#d48c9e] text-white rounded-2xl font-medium text-lg hover:bg-[#c27b8d] hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-2">
                            <Heart className="w-5 h-5 fill-current" />
                            Start Manifesting Grades
                        </button>
                    </div>
                </div>
            </section>

            {/* Manifestation Station */}
            <section className="py-24 bg-white/50 backdrop-blur-sm">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-medium mb-8 text-[#d48c9e]">Manifestation Station</h2>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-pink-100">
                        <p className="mb-4 text-[#8b5a8b]">What are we achieving today, bestie?</p>
                        <input
                            type="text"
                            value={manifestation}
                            onChange={(e) => setManifestation(e.target.value)}
                            placeholder="I am getting an A on my bio exam..."
                            className="w-full text-center text-2xl border-b-2 border-pink-200 focus:border-pink-400 outline-none py-2 text-[#8b5a8b] placeholder:text-pink-200 font-serif bg-transparent"
                        />
                        {manifestation && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-6 text-pink-400 flex justify-center items-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                <span>It is already yours.</span>
                                <Sparkles className="w-5 h-5" />
                            </motion.div>
                        )}
                    </div>
                </div>
            </section>

            {/* Mood Board (Features) */}
            <section className="py-24">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Aesthetic Notes', desc: 'We organize the chaos so your brain stays pretty.', icon: Sun },
                            { title: 'Cozy Reviews', desc: 'Spaced repetition that feels like a warm hug.', icon: Heart },
                            { title: 'Dreamy Data', desc: 'Analytics that validate your journey.', icon: Moon }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="bg-white p-8 rounded-[2rem] shadow-sm border border-pink-50 text-center group hover:shadow-md transition-all"
                            >
                                <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6 text-pink-300 group-hover:bg-pink-100 group-hover:text-pink-400 transition-colors">
                                    <item.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-medium mb-3 text-[#d48c9e]">{item.title}</h3>
                                <p className="text-[#8b5a8b] leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    )
}
