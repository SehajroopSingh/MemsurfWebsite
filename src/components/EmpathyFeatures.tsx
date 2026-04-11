'use client'

import { motion } from 'framer-motion'
import { Brain, Zap, Calendar, TrendingUp } from 'lucide-react'

const features = [
    {
        icon: Brain,
        title: 'Cognitive Offloading',
        description: 'We hold the information so you don\'t have to carry the mental load.',
        color: 'bg-app-softBlue/20 text-app-softBlue',
    },
    {
        icon: Zap,
        title: 'Gentle Pacing',
        description: 'Learn at your own rhythm. No streaks to lose, no shame to feel.',
        color: 'bg-app-violet/20 text-app-lavender',
    },
    {
        icon: Calendar,
        title: 'Science-Backed Review',
        description: 'We schedule reviews when they are most effective, not when they are most stressful.',
        color: 'bg-app-mint/20 text-app-mint',
    },
    {
        icon: TrendingUp,
        title: 'Growth, Not Grades',
        description: 'Focus on your personal progress. You are not a number.',
        color: 'bg-app-lilac/20 text-app-lilac',
    },
]

export default function EmpathyFeatures() {
    return (
        <section className="py-24 bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-app-text mb-4">
                        Designed for Human Beings
                    </h2>
                    <p className="text-xl text-app-textMuted max-w-2xl mx-auto">
                        Technology should adapt to you, not the other way around.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="p-8 bg-app-surfaceElevated rounded-2xl hover:bg-app-surface hover:shadow-xl transition-all duration-300 border border-app-border hover:border-app-softBlue/40"
                            >
                                <div className={`inline-flex p-4 rounded-xl ${feature.color} mb-6`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-app-text mb-3">{feature.title}</h3>
                                <p className="text-app-textMuted leading-relaxed">{feature.description}</p>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
