'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, X, Check } from 'lucide-react'

export default function MemoryGame() {
    const [sequence, setSequence] = useState<number[]>([])
    const [userSequence, setUserSequence] = useState<number[]>([])
    const [isPlaying, setIsPlaying] = useState(false)
    const [gameState, setGameState] = useState<'idle' | 'showing' | 'playing' | 'won' | 'lost'>('idle')
    const [level, setLevel] = useState(1)

    const colors = [
        'bg-red-500',
        'bg-blue-500',
        'bg-green-500',
        'bg-yellow-500'
    ]

    const startGame = () => {
        setSequence([])
        setUserSequence([])
        setLevel(1)
        setGameState('showing')
        addToSequence([])
    }

    const addToSequence = (currentSeq: number[]) => {
        const nextColor = Math.floor(Math.random() * 4)
        const newSeq = [...currentSeq, nextColor]
        setSequence(newSeq)
        showSequence(newSeq)
    }

    const showSequence = async (seq: number[]) => {
        setGameState('showing')
        setUserSequence([])

        for (let i = 0; i < seq.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 500))
            highlightButton(seq[i])
            await new Promise(resolve => setTimeout(resolve, 500))
        }

        setGameState('playing')
    }

    const highlightButton = (index: number) => {
        const btn = document.getElementById(`btn-${index}`)
        if (btn) {
            btn.classList.add('brightness-150', 'scale-110')
            setTimeout(() => {
                btn.classList.remove('brightness-150', 'scale-110')
            }, 300)
        }
    }

    const handleButtonClick = (index: number) => {
        if (gameState !== 'playing') return

        highlightButton(index)
        const newUserSeq = [...userSequence, index]
        setUserSequence(newUserSeq)

        // Check if correct so far
        if (newUserSeq[newUserSeq.length - 1] !== sequence[newUserSeq.length - 1]) {
            setGameState('lost')
            return
        }

        // Check if level complete
        if (newUserSeq.length === sequence.length) {
            if (level >= 5) {
                setGameState('won')
            } else {
                setLevel(l => l + 1)
                setTimeout(() => addToSequence(sequence), 1000)
            }
        }
    }

    return (
        <div className="w-full max-w-md mx-auto bg-gray-900/80 backdrop-blur-md border border-gray-800 p-6 rounded-xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-mono text-gray-400 uppercase">Memory Test_v1.0</span>
                </div>
                <div className="text-sm font-mono text-gray-400">
                    Level: <span className="text-white">{level}/5</span>
                </div>
            </div>

            <div className="relative aspect-square mb-6">
                <div className="grid grid-cols-2 gap-4 h-full">
                    {colors.map((color, index) => (
                        <button
                            key={index}
                            id={`btn-${index}`}
                            onClick={() => handleButtonClick(index)}
                            disabled={gameState !== 'playing'}
                            className={`${color} rounded-lg transition-all duration-200 opacity-80 hover:opacity-100 disabled:cursor-not-allowed`}
                        />
                    ))}
                </div>

                <AnimatePresence>
                    {gameState === 'idle' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg"
                        >
                            <button
                                onClick={startGame}
                                className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                            >
                                Test Your Brain
                            </button>
                        </motion.div>
                    )}

                    {gameState === 'lost' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90 backdrop-blur-sm rounded-lg text-center p-4"
                        >
                            <X className="w-12 h-12 text-white mb-2" />
                            <h3 className="text-xl font-bold text-white mb-2">FAILED</h3>
                            <p className="text-white/80 mb-4 text-sm">See? You need us. Your memory is trash.</p>
                            <button
                                onClick={startGame}
                                className="px-4 py-2 bg-white text-red-900 font-bold uppercase text-sm hover:scale-105 transition-transform"
                            >
                                Try Again (If You Dare)
                            </button>
                        </motion.div>
                    )}

                    {gameState === 'won' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-green-900/90 backdrop-blur-sm rounded-lg text-center p-4"
                        >
                            <Check className="w-12 h-12 text-white mb-2" />
                            <h3 className="text-xl font-bold text-white mb-2">NOT BAD</h3>
                            <p className="text-white/80 mb-4 text-sm">Okay, you have a brain. Now fill it with something useful.</p>
                            <button
                                onClick={startGame}
                                className="px-4 py-2 bg-white text-green-900 font-bold uppercase text-sm hover:scale-105 transition-transform"
                            >
                                Play Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="text-center">
                <p className="text-xs text-gray-500 font-mono">
                    {gameState === 'showing' ? 'WATCH THE PATTERN...' :
                        gameState === 'playing' ? 'REPEAT THE PATTERN' :
                            'PROVE YOU ARE NOT AN NPC'}
                </p>
            </div>
        </div>
    )
}
