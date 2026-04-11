'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export type PersonaType = 'architect' | 'berserker' | 'wanderer' | 'alchemist' | 'skeptic' | 'survivor'

interface PersonaQuizProps {
    onComplete: (persona: PersonaType) => void
}

const questions = [
    {
        id: 1,
        text: "What is currently rotting in your open tabs?",
        options: [
            { text: "A perfectly categorized research project.", type: 'architect' },
            { text: "Arguments I plan to win later.", type: 'berserker' },
            { text: "Three Wikipedia rabbit holes and a conspiracy theory.", type: 'wanderer' },
            { text: "Pinterest boards and aesthetic mood inspo.", type: 'alchemist' },
            { text: "Peer-reviewed studies on optimal sleep cycles.", type: 'skeptic' },
            { text: "Anxiety-inducing news and a recipe I'll never make.", type: 'survivor' }
        ]
    },
    {
        id: 2,
        text: "Why do you screenshot things?",
        options: [
            { text: "To file it into my second brain.", type: 'architect' },
            { text: "To use as evidence in a future debate.", type: 'berserker' },
            { text: "Because it's funny/weird/cursed.", type: 'wanderer' },
            { text: "It fits my vibe.", type: 'alchemist' },
            { text: "It contains data I might need.", type: 'skeptic' },
            { text: "I'm afraid I'll forget it exists.", type: 'survivor' }
        ]
    },
    {
        id: 3,
        text: "Your brain is...",
        options: [
            { text: "A filing cabinet that needs sorting.", type: 'architect' },
            { text: "A weapon.", type: 'berserker' },
            { text: "A browser with 500 tabs open.", type: 'wanderer' },
            { text: "A curated art gallery.", type: 'alchemist' },
            { text: "A hard drive with bad sectors.", type: 'skeptic' },
            { text: "A screaming void.", type: 'survivor' }
        ]
    }
]

export default function PersonaQuiz({ onComplete }: PersonaQuizProps) {
    const [step, setStep] = useState(0)
    const [scores, setScores] = useState<Record<string, number>>({})

    const handleAnswer = (type: string) => {
        const newScores = { ...scores, [type]: (scores[type] || 0) + 1 }
        setScores(newScores)

        if (step < questions.length - 1) {
            setStep(step + 1)
        } else {
            // Determine winner
            const winner = Object.entries(newScores).reduce((a, b) => a[1] > b[1] ? a : b)[0] as PersonaType
            onComplete(winner)
        }
    }

    const currentQuestion = questions[step]

    return (
        <div className="min-h-screen flex items-center justify-center bg-app-canvas p-4">
            <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl w-full bg-app-surfaceElevated rounded-3xl shadow-xl p-8 md:p-12 border border-app-border"
            >
                <div className="mb-8">
                    <span className="text-sm font-bold text-app-softBlue tracking-wider uppercase">
                        Vibe Check {step + 1}/{questions.length}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-app-text mt-2">
                        {currentQuestion.text}
                    </h2>
                </div>

                <div className="grid gap-4">
                    {currentQuestion.options.map((option, i) => (
                        <button
                            key={i}
                            onClick={() => handleAnswer(option.type)}
                            className="text-left p-6 rounded-xl border-2 border-app-border hover:border-app-softBlue hover:bg-app-surface transition-all group flex items-center justify-between"
                        >
                            <span className="text-lg font-medium text-app-textMuted group-hover:text-app-text">
                                {option.text}
                            </span>
                            <ArrowRight className="w-5 h-5 text-app-border group-hover:text-app-softBlue opacity-0 group-hover:opacity-100 transition-all" />
                        </button>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
