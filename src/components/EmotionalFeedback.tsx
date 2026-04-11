'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, Heart } from 'lucide-react'

export default function EmotionalFeedback() {
    const [isOpen, setIsOpen] = useState(false)
    const [feedback, setFeedback] = useState('')
    const [sent, setSent] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSent(true)
        setTimeout(() => {
            setIsOpen(false)
            setSent(false)
            setFeedback('')
        }, 3000)
    }

    return (
        <section className="py-12 bg-app-surface/50 border-t border-app-border">
            <div className="max-w-3xl mx-auto px-4 text-center">
                <div className="mb-8">
                    <Heart className="w-8 h-8 text-red-500 mx-auto mb-4 animate-pulse" />
                    <h3 className="text-2xl font-bold text-app-text mb-2">
                        We're listening. (Actually.)
                    </h3>
                    <p className="text-app-textMuted">
                        Think this is trash? Feel stupid? Feel like a genius? Tell us. We cry easily but we fix things fast.
                        We built this because we were struggling too.
                    </p>
                </div>

                {!isOpen ? (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-app-surfaceElevated border border-app-border rounded-lg text-app-textMuted hover:border-app-softBlue hover:text-app-mint transition-all shadow-sm hover:shadow-md"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Talk to the Humans Behind the AI
                    </button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-app-surfaceElevated p-6 rounded-xl shadow-lg border border-app-border text-left"
                    >
                        {!sent ? (
                            <form onSubmit={handleSubmit}>
                                <label className="block text-sm font-medium text-app-textMuted mb-2">
                                    What's on your mind?
                                </label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className="w-full h-32 p-3 border border-app-border rounded-lg focus:ring-2 focus:ring-app-softBlue focus:border-transparent resize-none mb-4 text-app-text bg-app-surface"
                                    placeholder="Be honest. We can take it."
                                    required
                                />
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="px-4 py-2 text-app-textMuted hover:text-app-text"
                                    >
                                        Nevermind
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-2 px-6 py-2 bg-app-softBlue text-white rounded-lg hover:opacity-90 transition-opacity"
                                    >
                                        <Send className="w-4 h-4" />
                                        Send It
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-app-mint/20 text-app-mint rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Heart className="w-6 h-6 fill-current" />
                                </div>
                                <h4 className="text-xl font-bold text-app-text mb-2">Message Received.</h4>
                                <p className="text-app-textMuted">
                                    Thanks for being real with us. We're reading it right now.
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </section>
    )
}
