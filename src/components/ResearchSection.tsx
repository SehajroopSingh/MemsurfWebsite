'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, BookOpen, Brain, Clock, Zap } from 'lucide-react'

const researchTopics = [
    {
        id: 'forgetting',
        icon: Brain,
        title: 'Why You Forget (The Forgetting Curve)',
        summary: 'Your brain is designed to delete information. It\'s a feature, not a bug.',
        content: 'Hermann Ebbinghaus discovered that you lose ~50% of new information within an hour. Your brain is aggressively optimizing for efficiency by deleting "useless" data. We just trick it into thinking this data is survival-critical.'
    },
    {
        id: 'spaced-repetition',
        icon: Clock,
        title: 'The Algorithm of Love (Spaced Repetition)',
        summary: 'We interrupt your forgetting process at the exact moment of failure.',
        content: 'By reviewing information just as you\'re about to forget it, you strengthen the neural pathway. It\'s like lifting weights: if it\'s too light (reviewing too soon), you get no gains. If it\'s too heavy (reviewing too late), you fail. We find the sweet spot.'
    },
    {
        id: 'active-recall',
        icon: Zap,
        title: 'Active Recall vs. Passive Reading',
        summary: 'Reading is easy. Remembering is hard. We choose hard.',
        content: 'When you read, you recognize. When you quiz, you recall. Recognition is a weak signal; recall is a strong one. We force you to pull information out of your brain, which signals to your hippocampus: "KEEP THIS."'
    }
]

export default function ResearchSection() {
    const [openId, setOpenId] = useState<string | null>(null)

    return (
        <section className="py-24 bg-white text-black">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full mb-6">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-wide">The Science</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                        We don't think you're stupid.<br />
                        <span className="text-gray-500">We know your hardware is outdated.</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Your brain hasn't had a firmware update in 50,000 years. It wasn't built for the Information Age. Here's how we patch it.
                    </p>
                </div>

                <div className="space-y-4">
                    {researchTopics.map((topic) => {
                        const Icon = topic.icon
                        const isOpen = openId === topic.id

                        return (
                            <motion.div
                                key={topic.id}
                                initial={false}
                                className={`border rounded-xl overflow-hidden transition-colors duration-300 ${isOpen ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                            >
                                <button
                                    onClick={() => setOpenId(isOpen ? null : topic.id)}
                                    className="w-full flex items-center justify-between p-6 text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg ${isOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className={`text-lg font-bold ${isOpen ? 'text-blue-900' : 'text-gray-900'}`}>
                                                {topic.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {topic.summary}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="px-6 pb-6 pt-0 pl-[5.5rem]">
                                                <p className="text-gray-700 leading-relaxed">
                                                    {topic.content}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
