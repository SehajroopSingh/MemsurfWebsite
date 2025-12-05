'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sword, Shield, Zap, Trophy, Target, Crosshair } from 'lucide-react'
import Navigation from '@/components/Navigation'

export default function BoyCodedHome() {
    const [powerLevel, setPowerLevel] = useState(9000)
    const [questProgress, setQuestProgress] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY
            setPowerLevel(9000 + Math.floor(scrolled / 10))
            setQuestProgress(Math.min(100, (scrolled / (document.body.scrollHeight - window.innerHeight)) * 100))
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <main className="min-h-screen bg-black text-green-500 font-mono selection:bg-green-500 selection:text-black">
            <Navigation />

            {/* HUD Overlay */}
            <div className="fixed top-20 right-4 z-50 bg-black/80 border border-green-500 p-4 rounded-none backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 animate-pulse" />
                    <span className="text-xl font-bold">PWR: {powerLevel}</span>
                </div>
                <div className="w-32 h-2 bg-green-900">
                    <div className="h-full bg-green-500 transition-all duration-100" style={{ width: `${questProgress}%` }}></div>
                </div>
                <div className="text-xs mt-1 text-green-400">QUEST PROGRESS</div>
            </div>

            {/* Hero Section */}
            <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzM0YjQ1NjY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3OCZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/xT9IgusfDcqpPFzjdS/giphy.gif')] opacity-10 bg-cover bg-center"></div>
                <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block border border-green-500 px-4 py-1 mb-6 bg-green-500/10"
                    >
                        SYSTEM STATUS: ONLINE
                    </motion.div>
                    <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter uppercase glitch-text">
                        Dominate<br />The Arena
                    </h1>
                    <p className="text-xl md:text-2xl text-green-400/80 mb-12 max-w-3xl mx-auto">
                        Your brain is the hardware. We provide the aimbot.
                        Min-max your study stats and crush the competition.
                    </p>
                    <button className="px-10 py-5 bg-green-600 text-black font-black text-xl hover:bg-green-500 hover:scale-105 transition-all uppercase tracking-widest clip-path-polygon">
                        Initialize Sequence
                    </button>
                </div>
            </section>

            {/* Quest Log (Features) */}
            <section className="py-24 border-t border-green-900 bg-black/50">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-4xl font-bold mb-12 flex items-center gap-4">
                        <Target className="w-8 h-8" />
                        ACTIVE QUESTS
                    </h2>
                    <div className="grid gap-6">
                        {[
                            { icon: Sword, title: 'Quest: Eliminate Weakness', desc: 'Identify knowledge gaps and destroy them with precision algorithms.' },
                            { icon: Shield, title: 'Quest: Fortify Memory', desc: 'Spaced repetition shields your brain from the debuff of forgetting.' },
                            { icon: Crosshair, title: 'Quest: Sniper Focus', desc: 'Quick capture tools to lock onto information instantly.' },
                            { icon: Trophy, title: 'Quest: Leaderboard Domination', desc: 'Track your XP and outrank your former self.' }
                        ].map((quest, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: -50, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-6 p-6 border border-green-900 bg-green-900/10 hover:bg-green-900/20 hover:border-green-500 transition-all cursor-crosshair group"
                            >
                                <quest.icon className="w-8 h-8 text-green-600 group-hover:text-green-400" />
                                <div>
                                    <h3 className="text-xl font-bold mb-1 group-hover:text-green-300">{quest.title}</h3>
                                    <p className="text-green-500/60">{quest.desc}</p>
                                </div>
                                <div className="ml-auto text-sm border border-green-800 px-2 py-1 text-green-700 group-hover:text-green-400 group-hover:border-green-500">
                                    REWARD: +500 XP
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Boss Fight (CTA) */}
            <section className="py-32 text-center relative">
                <div className="absolute inset-0 bg-green-900/10"></div>
                <div className="relative z-10">
                    <h2 className="text-5xl font-black mb-8 text-white">BOSS FIGHT: FINAL EXAMS</h2>
                    <p className="text-2xl text-green-400 mb-12">Are you equipped to win? Or will you get wrecked?</p>
                    <div className="flex justify-center gap-8">
                        <button className="px-12 py-6 bg-green-600 text-black font-bold text-2xl hover:bg-green-500 hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-all uppercase">
                            Equip Legendary Gear
                        </button>
                    </div>
                </div>
            </section>
        </main>
    )
}
