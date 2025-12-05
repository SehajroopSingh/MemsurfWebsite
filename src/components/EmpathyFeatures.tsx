'use client'

import { motion } from 'framer-motion'
import { Brain, Zap, Calendar, TrendingUp } from 'lucide-react'

const features = [
    {
        icon: Brain,
        title: 'Cognitive Offloading',
        description: 'We hold the information so you don\'t have to carry the mental load.',
        color: 'bg-blue-100 text-blue-600',
    },
    {
        icon: Zap,
        title: 'Gentle Pacing',
        description: 'Learn at your own rhythm. No streaks to lose, no shame to feel.',
        color: 'bg-purple-100 text-purple-600',
    },
    {
        icon: Calendar,
        title: 'Science-Backed Review',
        description: 'We schedule reviews when they are most effective, not when they are most stressful.',
        color: 'bg-green-100 text-green-600',
    },
    {
        icon: TrendingUp,
        title: 'Growth, Not Grades',
        description: 'Focus on your personal progress. You are not a number.',
        color: 'bg-orange-100 text-orange-600',
    },
]

export default function EmpathyFeatures() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Designed for Human Beings
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
                                className="p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100"
                            >
                                <div className={`inline-flex p-4 rounded-xl ${feature.color} mb-6`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
