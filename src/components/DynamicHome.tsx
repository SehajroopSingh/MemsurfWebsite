'use client'

import { motion } from 'framer-motion'
import { PersonaType } from './PersonaQuiz'
import { Brain, Trophy, Compass, Sparkles, Microscope, Shield, RefreshCw } from 'lucide-react'
import Navigation from '@/components/Navigation'

interface DynamicHomeProps {
    persona: PersonaType
    onReset: () => void
}

const personaConfig = {
    architect: {
        theme: 'bg-slate-50 text-slate-900 font-sans',
        accent: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700 text-white',
        icon: Brain,
        headline: 'Your bookmarks are a graveyard.',
        subhead: 'Saving isn\'t learning. Build a library in your head, not your browser. Memorize the system, not just the data.',
        features: [
            { title: 'Internalize The Web', desc: 'Don\'t just bookmark the article. Download it to your brain.' },
            { title: 'Mental Indexing', desc: 'Recall that random fact instantly, without searching.' },
            { title: 'Systematic Retention', desc: 'Turn chaos into a structured memory palace.' }
        ],
        cta: 'Build Your Mind'
    },
    berserker: {
        theme: 'bg-red-950 text-red-50 font-mono',
        accent: 'text-red-500',
        button: 'bg-red-600 hover:bg-red-500 text-black font-black uppercase',
        icon: Trophy,
        headline: 'Be a walking encyclopedia.',
        subhead: 'Google is too slow. When you\'re in an argument, you need the facts NOW. Weaponize your recall.',
        features: [
            { title: 'Instant Recall', desc: 'Pull up stats faster than they can unlock their phone.' },
            { title: 'Debate Domination', desc: 'Memorize the logic, the fallacies, and the evidence.' },
            { title: 'Intellectual Flex', desc: 'Knowing things is a power move.' }
        ],
        cta: 'Start Training'
    },
    wanderer: {
        theme: 'bg-amber-50 text-amber-900 font-serif',
        accent: 'text-amber-600',
        button: 'bg-amber-600 hover:bg-amber-700 text-white rounded-full',
        icon: Compass,
        headline: 'Actually remember the rabbit hole.',
        subhead: 'You read about ancient Sumerian taxation at 3 AM. Why did you forget it by noon? Keep the cool garbage.',
        features: [
            { title: 'Trivia God', desc: 'Be the person who knows weird stuff at parties.' },
            { title: 'Rabbit Hole Retention', desc: 'Don\'t let the late-night deep dives go to waste.' },
            { title: 'Curiosity Capture', desc: 'Turn "huh, that\'s cool" into "I know this forever."' }
        ],
        cta: 'Keep The Trash'
    },
    alchemist: {
        theme: 'bg-rose-50 text-rose-900 font-serif italic',
        accent: 'text-rose-500',
        button: 'bg-rose-400 hover:bg-rose-500 text-white rounded-xl shadow-lg',
        icon: Sparkles,
        headline: 'Internalize the aesthetic.',
        subhead: 'Don\'t just pin the poem. Memorize it. Let the vibes become part of your DNA.',
        features: [
            { title: 'Poetry & Lyrics', desc: 'Carry the art with you, everywhere.' },
            { title: 'Vibe Integration', desc: 'Make the mood board a part of your mind.' },
            { title: 'Beautiful Data', desc: 'Memorizing things is a form of self-care.' }
        ],
        cta: 'Absorb The Vibe'
    },
    skeptic: {
        theme: 'bg-gray-100 text-gray-900 font-mono',
        accent: 'text-gray-600',
        button: 'bg-black hover:bg-gray-800 text-white border border-gray-300',
        icon: Microscope,
        headline: 'Your brain has a write error.',
        subhead: 'You are reading data but failing to save it to the hard drive. Fix your retention algorithm.',
        features: [
            { title: 'Write to Long-Term', desc: 'Move data from RAM to SSD efficiently.' },
            { title: 'Source Code', desc: 'Memorize the citations, not just the headlines.' },
            { title: 'Lossless Compression', desc: 'Retain 100% of what matters.' }
        ],
        cta: 'Patch Your Brain'
    },
    survivor: {
        theme: 'bg-indigo-50 text-indigo-900 font-sans',
        accent: 'text-indigo-500',
        button: 'bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl',
        icon: Shield,
        headline: 'Never check the recipe again.',
        subhead: 'Stop touching your phone with egg hands. Stop panicking when the WiFi goes down. Just know it.',
        features: [
            { title: 'Offline Mode', desc: 'Your brain works without a signal. Use it.' },
            { title: 'Crisis Aversion', desc: 'Memorize the passwords, the codes, the birthdays.' },
            { title: 'Competence', desc: 'It feels good to just know what to do.' }
        ],
        cta: 'Download to Brain'
    }
}

export default function DynamicHome({ persona, onReset }: DynamicHomeProps) {
    const config = personaConfig[persona]
    const Icon = config.icon

    return (
        <main className={`min-h-screen transition-colors duration-500 ${config.theme}`}>
            <Navigation />

            <div className="fixed top-24 right-4 z-50">
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm border border-current rounded-full text-xs font-bold hover:bg-white transition-all"
                >
                    <RefreshCw className="w-3 h-3" />
                    Retake Quiz
                </button>
            </div>

            <section className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`inline-flex p-4 rounded-full mb-8 ${config.accent} bg-current/10`}
                    >
                        <Icon className="w-8 h-8" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
                    >
                        {config.headline}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl opacity-80 mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        {config.subhead}
                    </motion.p>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`px-8 py-4 text-lg font-bold transition-all transform hover:scale-105 ${config.button}`}
                    >
                        {config.cta}
                    </motion.button>
                </div>
            </section>

            <section className="py-24 px-4 bg-current/5">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {config.features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-current/10"
                            >
                                <h3 className={`text-xl font-bold mb-3 ${config.accent}`}>{feature.title}</h3>
                                <p className="opacity-80">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    )
}
