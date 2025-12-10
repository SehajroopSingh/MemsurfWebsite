'use client'

import React from 'react'
import { AnimatePresence, motion, MotionValue } from 'framer-motion'
import PhoneScreen from '../PhoneScreen'

type QuizStage = 'trueFalse' | 'multiple' | 'matching' | 'fill' | 'ordering' | 'errorSpotting' | 'shortAnswer' | 'caseStudy' | null

const QUIZ_LABELS: Record<string, string> = {
    trueFalse: 'True or False',
    multiple: 'Multiple Choice',
    matching: 'Match Pairs',
    fill: 'Fill in the Blank',
    ordering: 'Put in Order',
    errorSpotting: 'Find the Error',
    shortAnswer: 'Short Answer',
    caseStudy: 'Case Study'
}

type PracticePhoneContentProps = {
    baseScreenOpacity: MotionValue<number>
    buttonScale: MotionValue<number>
    buttonOpacity: MotionValue<number>
    practiceButtonScale: MotionValue<number>
    practiceButtonY: MotionValue<number>
    practiceButtonBoxShadow: MotionValue<string>
    lessonOpacity: MotionValue<number>
    lessonScale: MotionValue<number>
    lessonX: MotionValue<number>
    lessonStep: MotionValue<number>
    quizOpacity: MotionValue<number>
    quizX: MotionValue<number>
    lockedQuiz: QuizStage
}

export default function PracticePhoneContent({
    baseScreenOpacity,
    buttonScale,
    buttonOpacity,
    practiceButtonScale,
    practiceButtonY,
    practiceButtonBoxShadow,
    lessonOpacity,
    lessonScale,
    lessonX,
    lessonStep,
    quizOpacity,
    quizX,
    lockedQuiz
}: PracticePhoneContentProps) {
    // Derive step index for rendering
    const [step, setStep] = React.useState(0)
    React.useEffect(() => {
        return lessonStep.on('change', (v) => setStep(Math.round(v)))
    }, [lessonStep])

    return (
        <PhoneScreen>
            <div className="absolute inset-0 bg-white">
                {/* Stage 1: daily practice entry is just the button */}
                <motion.div
                    style={{ opacity: baseScreenOpacity }}
                    className="absolute inset-0 flex items-center justify-center px-6 pt-16 pb-12 bg-gradient-to-b from-white via-gray-50 to-gray-100"
                >
                    <motion.div
                        style={{ scale: buttonScale, opacity: buttonOpacity }}
                        className="w-full max-w-[260px] rounded-[28px] border border-gray-100 bg-gray-50 p-5 flex flex-col gap-3 shadow-sm"
                    >
                        <div className="h-2 w-16 bg-gray-200 rounded-full" />
                        <motion.div
                            style={{
                                scale: practiceButtonScale,
                                y: practiceButtonY,
                                boxShadow: practiceButtonBoxShadow
                            }}
                            className="h-10 rounded-2xl bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 flex items-center justify-center cursor-pointer"
                        >
                            <span className="text-white text-sm font-semibold tracking-wide">Practice Now</span>
                        </motion.div>
                        <div className="flex gap-2">
                            <div className="h-2 w-1/2 bg-gray-200 rounded-full" />
                            <div className="h-2 w-1/3 bg-gray-100 rounded-full" />
                        </div>
                    </motion.div>
                </motion.div>

                {/* Stage 2: full-screen lesson view */}
                <motion.div
                    style={{ opacity: lessonOpacity, scale: lessonScale, x: lessonX }}
                    className="absolute inset-0 px-6 py-10 bg-gradient-to-br from-white via-blue-50 to-blue-100 flex flex-col gap-8"
                >
                    <div className="flex items-center justify-between">
                        <div className="h-2 w-16 bg-blue-200 rounded-full" />
                        <div className="flex gap-2">
                            <div className="h-2 w-10 bg-blue-100 rounded-full" />
                            <div className="h-2 w-8 bg-blue-100 rounded-full" />
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-8 text-blue-800">
                        {/* Static Header */}
                        <div className="text-center space-y-2 mt-4">
                            <p className="text-sm font-semibold tracking-[0.4em] text-blue-400 uppercase">Lesson</p>
                            <p className="text-4xl font-bold text-blue-700">Lesson 1</p>
                        </div>

                        {/* Dynamic Content */}
                        <div className="relative w-full flex-1 overflow-hidden">
                            <AnimatePresence mode="wait">
                                {step === 0 && (
                                    <motion.div
                                        key="step0"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0 flex flex-col items-center gap-6"
                                    >
                                        <div className="w-full max-w-[260px] space-y-3">
                                            {[0, 1, 2, 3].map((_, idx) => (
                                                <div key={`l1-${idx}`} className="h-4 rounded-full bg-blue-100/80" style={{ width: `${100 - idx * 10}%` }} />
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
                                            {[0, 1].map((_, idx) => (
                                                <div key={`c1-${idx}`} className="h-24 rounded-3xl bg-white/80 border border-blue-100 flex items-center justify-center shadow-sm">
                                                    <div className="h-2 w-1/2 bg-blue-100 rounded-full" />
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0 flex flex-col items-center gap-6"
                                    >
                                        <div className="w-full max-w-[280px] h-32 rounded-3xl bg-blue-50 border border-blue-100 p-4 space-y-3">
                                            <div className="h-2 w-1/3 bg-blue-200 rounded-full" />
                                            <div className="h-2 w-full bg-blue-100 rounded-full" />
                                            <div className="h-2 w-5/6 bg-blue-100 rounded-full" />
                                            <div className="h-2 w-4/6 bg-blue-100 rounded-full" />
                                        </div>
                                        <div className="w-full max-w-[260px] space-y-3">
                                            <div className="h-4 rounded-full bg-blue-100/80 w-full" />
                                            <div className="h-4 rounded-full bg-blue-100/80 w-3/4" />
                                        </div>
                                    </motion.div>
                                )}
                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0 flex flex-col items-center gap-6"
                                    >
                                        <div className="w-full max-w-[260px] space-y-3 text-center flex flex-col items-center">
                                            <div className="h-4 rounded-full bg-blue-200 w-1/2 mb-2" />
                                            {[0, 1, 2].map((_, idx) => (
                                                <div key={`l3-${idx}`} className="h-3 rounded-full bg-blue-100/80 w-full" />
                                            ))}
                                        </div>
                                        <div className="flex gap-3 w-full max-w-[280px]">
                                            <div className="flex-1 h-32 rounded-3xl bg-white/80 border border-blue-100 p-3 flex flex-col justify-end">
                                                <div className="h-8 w-8 rounded-full bg-blue-50 mb-auto" />
                                                <div className="h-2 w-2/3 bg-blue-100 rounded-full" />
                                            </div>
                                            <div className="flex-1 h-32 rounded-3xl bg-white/80 border border-blue-100 p-3 flex flex-col justify-end">
                                                <div className="h-8 w-8 rounded-full bg-blue-50 mb-auto" />
                                                <div className="h-2 w-2/3 bg-blue-100 rounded-full" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    <div className="w-full max-w-[280px] grid grid-cols-3 gap-3 mx-auto">
                        {[0, 1, 2].map((pill) => (
                            <motion.div
                                key={`lesson-pill-${pill}`}
                                animate={{
                                    backgroundColor: step === pill ? '#60a5fa' : '#ffffffb3',
                                    borderColor: step === pill ? '#3b82f6' : '#dbeafe'
                                }}
                                className="h-2 rounded-full border"
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Stage 3: quiz follow-up */}
                <motion.div
                    style={{ opacity: quizOpacity, x: quizX }}
                    className="absolute inset-0 px-6 py-10 bg-gradient-to-br from-white via-purple-50 to-indigo-50 flex flex-col gap-6"
                >
                    <div className="flex items-center justify-between">
                        <div className="h-2 w-24 bg-purple-200 rounded-full" />
                        <div className="h-8 w-8 rounded-full bg-white/70 border border-purple-100" />
                    </div>
                    <div className="relative flex-1 mt-2 overflow-hidden">
                        <AnimatePresence mode="wait">
                            {lockedQuiz && (
                                <motion.div
                                    key={lockedQuiz}
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                    className="absolute inset-0 p-5 rounded-3xl bg-white shadow-sm border border-purple-100 flex flex-col gap-4"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold tracking-wider text-purple-400 uppercase">
                                            {QUIZ_LABELS[lockedQuiz] || 'Quiz'}
                                        </span>
                                        <div className="h-1.5 w-12 bg-purple-100 rounded-full" />
                                    </div>

                                    {lockedQuiz === 'trueFalse' && (
                                        <>
                                            <div className="h-2 w-1/3 bg-purple-200 rounded-full" />
                                            <div className="space-y-2">
                                                <div className="h-2 rounded-full bg-purple-100 w-full" />
                                                <div className="h-2 rounded-full bg-purple-100 w-2/3" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                                {[0, 1].map((opt) => (
                                                    <div key={opt} className="p-3 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-between">
                                                        <div className="h-2 w-2/3 bg-purple-200 rounded-full" />
                                                        <motion.div
                                                            key={`tf-blob-${opt}`}
                                                            initial={{ scale: 1, backgroundColor: '#e9d5ff' }}
                                                            animate={
                                                                opt === 0
                                                                    ? {
                                                                        scale: [1, 0.92, 1.08, 1],
                                                                        backgroundColor: ['#e9d5ff', '#e9d5ff', '#34d399', '#34d399']
                                                                    }
                                                                    : { scale: 1, backgroundColor: '#fecdd3' }
                                                            }
                                                            transition={{ duration: 0.4, times: [0, 0.25, 0.55, 1], ease: 'easeOut' }}
                                                            className="w-4 h-4 rounded-full"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    {lockedQuiz === 'multiple' && (
                                        <>
                                            <div className="h-2 w-1/2 bg-purple-200 rounded-full" />
                                            <div className="space-y-2 flex-1">
                                                {Array.from({ length: 3 }).map((_, idx) => (
                                                    <div key={`mc-${idx}`} className="p-3 rounded-2xl bg-purple-50 border border-purple-100 flex items-center gap-3">
                                                        <motion.div
                                                            initial={{ scale: 1, backgroundColor: '#e9d5ff' }}
                                                            animate={
                                                                idx === 1
                                                                    ? {
                                                                        scale: [1, 0.9, 1.12, 1],
                                                                        backgroundColor: ['#e9d5ff', '#e9d5ff', '#fb7185', '#fb7185']
                                                                    }
                                                                    : { scale: 1, backgroundColor: '#e9d5ff' }
                                                            }
                                                            transition={{ duration: 0.4, times: [0, 0.25, 0.55, 1], ease: 'easeOut' }}
                                                            className="w-6 h-6 rounded-full"
                                                        />
                                                        <div className="flex-1 h-2 bg-purple-200 rounded-full" />
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    {lockedQuiz === 'matching' && (
                                        <>
                                            <div className="h-2 w-1/3 bg-purple-200 rounded-full" />
                                            <div className="grid grid-cols-2 gap-3 mt-2">
                                                {/* LEFT SIDE */}
                                                {[0, 1, 2].map((item) => (
                                                    <div
                                                        key={`match-l-${item}`}
                                                        className={`relative p-3 rounded-2xl h-12 flex items-center transition-colors duration-300 ${item === 1 ? 'bg-purple-100 border-purple-200' : 'bg-purple-50 border-purple-100'}`}
                                                    >
                                                        {item === 1 && (
                                                            <motion.div
                                                                layoutId="match-left-selection"
                                                                className="absolute inset-0 rounded-2xl border-2 border-emerald-400"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: [0, 1, 1, 0] }}
                                                                transition={{ duration: 1.5, times: [0, 0.2, 0.8, 1], repeat: Infinity, repeatDelay: 1 }}
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                                {/* RIGHT SIDE */}
                                                {[0, 1, 2].map((item) => (
                                                    <div
                                                        key={`match-r-${item}`}
                                                        className={`relative p-3 rounded-2xl h-12 flex items-center justify-end transition-colors duration-300 ${item === 1 ? 'bg-purple-100 border-purple-200' : 'bg-purple-50 border-purple-100'}`}
                                                    >
                                                        {item === 1 && (
                                                            <>
                                                                <motion.div
                                                                    initial={{ scale: 0.9, backgroundColor: '#d8b4fe', opacity: 0 }}
                                                                    animate={{
                                                                        scale: [0.9, 0.98, 1.12, 1],
                                                                        opacity: [0, 0.6, 1, 1],
                                                                        backgroundColor: ['#d8b4fe', '#d8b4fe', '#34d399', '#34d399']
                                                                    }}
                                                                    transition={{ duration: 0.4, times: [0, 0.2, 0.55, 1], ease: 'easeOut' }}
                                                                    className="absolute inset-y-2 right-3 w-4 h-4 rounded-full z-10"
                                                                />
                                                                <motion.div
                                                                    layoutId="match-right-selection"
                                                                    className="absolute inset-0 rounded-2xl border-2 border-emerald-400"
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: [0, 1, 1, 0] }}
                                                                    transition={{ duration: 1.5, times: [0, 0.2, 0.8, 1], repeat: Infinity, repeatDelay: 1 }}
                                                                />
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    {lockedQuiz === 'fill' && (
                                        <>
                                            <div className="h-2 w-1/4 bg-purple-200 rounded-full" />
                                            {/* Text block with blank */}
                                            <div className="mt-4 p-4 rounded-2xl bg-purple-50 border border-purple-100 leading-relaxed relative">
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    <div className="h-2 w-12 bg-purple-200 rounded-full" />
                                                    <div className="h-2 w-16 bg-purple-200 rounded-full" />
                                                    <div className="h-2 w-8 bg-purple-200 rounded-full" />
                                                    {/* The Blank */}
                                                    <div className="relative h-8 w-24 border-b-2 border-purple-300 bg-white/50 rounded-md mx-1 overflow-hidden flex items-center justify-center">
                                                        <motion.div
                                                            initial={{ y: 20, opacity: 0 }}
                                                            animate={{ y: 0, opacity: 1 }}
                                                            transition={{ delay: 0.5, duration: 0.4, type: "spring" }}
                                                            className="h-2 w-16 bg-emerald-400 rounded-full"
                                                        />
                                                    </div>
                                                    <div className="h-2 w-10 bg-purple-200 rounded-full" />
                                                    <div className="h-2 w-14 bg-purple-200 rounded-full" />
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-auto">
                                                {[0, 1, 2].map((pill) => (
                                                    <div key={`fb-pill-${pill}`} className="flex-1 h-8 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center">
                                                        <div className="h-1.5 w-8 bg-purple-300/50 rounded-full" />
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    {lockedQuiz === 'ordering' && (
                                        <>
                                            <div className="h-2 w-1/3 bg-purple-200 rounded-full" />
                                            <div className="flex flex-col gap-2 mt-2">
                                                {[0, 1, 2, 3].map((item, i) => (
                                                    <motion.div
                                                        key={`order-${item}`}
                                                        className="p-3 rounded-2xl bg-purple-50 border border-purple-100 flex items-center gap-3"
                                                        initial={i === 1 ? { y: 45 } : i === 2 ? { y: -45 } : {}}
                                                        animate={i === 1 ? { y: 0 } : i === 2 ? { y: 0 } : {}}
                                                        transition={{ duration: 0.6, delay: 0.2, type: 'spring', bounce: 0.2 }}
                                                    >
                                                        <div className="flex flex-col gap-1">
                                                            <div className="w-1 h-1 bg-purple-200 rounded-full" />
                                                            <div className="w-1 h-1 bg-purple-200 rounded-full" />
                                                            <div className="w-1 h-1 bg-purple-200 rounded-full" />
                                                        </div>
                                                        <div className="h-2 w-2/3 bg-purple-200 rounded-full" />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    {lockedQuiz === 'errorSpotting' && (
                                        <>
                                            <div className="h-2 w-1/2 bg-purple-200 rounded-full" />
                                            <div className="flex-1 p-3 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3 mt-2">
                                                <div className="h-2 w-full bg-purple-100 rounded-full" />
                                                <div className="flex gap-2">
                                                    <div className="h-2 w-1/3 bg-purple-100 rounded-full" />
                                                    <motion.div
                                                        className="h-2 w-1/4 bg-red-200 rounded-full"
                                                        initial={{ backgroundColor: '#f3e8ff' }}
                                                        animate={{ backgroundColor: '#fecaca', scale: [1, 1.1, 1] }}
                                                        transition={{ delay: 0.5, duration: 0.4 }}
                                                    />
                                                    <div className="h-2 w-1/4 bg-purple-100 rounded-full" />
                                                </div>
                                                <div className="h-2 w-3/4 bg-purple-100 rounded-full" />
                                                <div className="h-2 w-5/6 bg-purple-100 rounded-full" />
                                            </div>
                                            <div className="flex gap-2 justify-center mt-2">
                                                <div className="h-8 w-24 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                                                    <div className="h-1.5 w-12 bg-red-200 rounded-full" />
                                                </div>
                                                <div className="h-8 w-24 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
                                                    <div className="h-1.5 w-12 bg-green-200 rounded-full" />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {lockedQuiz === 'shortAnswer' && (
                                        <>
                                            <div className="h-2 w-1/3 bg-purple-200 rounded-full" />
                                            <div className="space-y-2 mt-1">
                                                <div className="h-2 w-full bg-purple-100 rounded-full" />
                                                <div className="h-2 w-3/4 bg-purple-100 rounded-full" />
                                            </div>
                                            <div className="flex-1 rounded-2xl bg-purple-50 border border-purple-100 p-4 mt-2 relative overflow-hidden">
                                                <div className="absolute top-4 left-4 h-4 w-[2px] bg-purple-300 animate-pulse" />
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.8, duration: 0.5 }}
                                                    className="space-y-2"
                                                >
                                                    <div className="h-2 w-11/12 bg-gray-400 rounded-full" />
                                                    <div className="h-2 w-10/12 bg-gray-400 rounded-full" />
                                                    <div className="h-2 w-4/12 bg-gray-400 rounded-full" />
                                                </motion.div>
                                            </div>
                                            <div className="h-10 w-full rounded-2xl bg-purple-600 flex items-center justify-center mt-auto shadow-sm shadow-purple-200">
                                                <div className="h-2 w-16 bg-white/40 rounded-full" />
                                            </div>
                                        </>
                                    )}
                                    {lockedQuiz === 'caseStudy' && (
                                        <>
                                            <div className="h-2 w-1/3 bg-purple-200 rounded-full" />

                                            {/* Case Context Block */}
                                            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 space-y-2 mt-1 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-300" />
                                                <div className="h-1.5 w-11/12 bg-blue-200 rounded-full" />
                                                <div className="h-1.5 w-10/12 bg-blue-200 rounded-full" />
                                                <div className="h-1.5 w-full bg-blue-200 rounded-full" />
                                            </div>

                                            <div className="space-y-2 mt-2">
                                                <div className="h-2 w-full bg-purple-100 rounded-full" />
                                                <div className="h-2 w-3/4 bg-purple-100 rounded-full" />
                                            </div>

                                            <div className="grid grid-cols-1 gap-2 mt-auto">
                                                {[0, 1].map((opt) => (
                                                    <div key={`case-opt-${opt}`} className="p-3 rounded-2xl bg-purple-50 border border-purple-100 flex items-center gap-3">
                                                        <div className={`w-4 h-4 rounded-full border-2 ${opt === 0 ? 'border-purple-400 bg-purple-400' : 'border-purple-200'}`} />
                                                        <div className="h-2 w-2/3 bg-purple-200 rounded-full" />
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="w-full grid grid-cols-3 gap-2">
                        {[0, 1, 2].map((pill) => (
                            <div key={`quiz-pill-${pill}`} className="h-3 rounded-full bg-purple-100" />
                        ))}
                    </div>
                </motion.div>
            </div>
        </PhoneScreen>
    )
}


