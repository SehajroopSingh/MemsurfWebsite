'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Heart } from 'lucide-react'

export default function EmpathyCTA() {
    return (
        <section className="py-24 bg-gradient-to-b from-app-violet/15 to-transparent relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 inline-block"
                >
                    <div className="p-4 bg-app-surfaceElevated rounded-full shadow-sm inline-flex items-center gap-2 text-app-lavender border border-app-border">
                        <Heart className="w-5 h-5 fill-current" />
                        <span className="font-medium">Be kind to your mind</span>
                    </div>
                </motion.div>

                <h2 className="text-4xl md:text-5xl font-bold text-app-text mb-6">
                    Start learning without the anxiety.
                </h2>
                <p className="text-xl text-app-textMuted mb-10 max-w-2xl mx-auto">
                    Join a community of learners who prioritize understanding over memorizing.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button className="px-8 py-4 bg-app-violet text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg flex items-center gap-2">
                        Begin Your Journey
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <button className="px-8 py-4 bg-app-surfaceElevated text-app-text border border-app-border rounded-xl font-bold text-lg hover:border-app-lavender hover:text-app-lavender transition-all">
                        Read Our Manifesto
                    </button>
                </div>
            </div>
        </section>
    )
}
