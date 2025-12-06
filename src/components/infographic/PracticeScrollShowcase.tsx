'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import PhoneScreen from './PhoneScreen'

type QuizStage = 'trueFalse' | 'multiple' | 'matching' | 'fill' | null
const STAGES: Exclude<QuizStage, null>[] = ['trueFalse', 'multiple', 'matching', 'fill']
const QUIZ_START_THRESHOLD = 0.72

export default function PracticeScrollShowcase() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end']
    })

    const copyStageOneOpacity = useTransform(scrollYProgress, [0.2, 0.45], [1, 0])
    const copyStageOneY = useTransform(scrollYProgress, [0.2, 0.45], [0, -30])
    const copyStageTwoOpacity = useTransform(scrollYProgress, [0.45, 0.6, 0.68, 0.74], [0, 1, 1, 0])
    const copyStageTwoY = useTransform(scrollYProgress, [0.45, 0.6, 0.68, 0.74], [30, 0, -50, -140])
    const copyStageTwoX = useTransform(scrollYProgress, [0.45, 0.74], [30, 30])
    const lessonBulletOpacity = useTransform(scrollYProgress, [0.58, 0.66], [0, 1])
    const lessonBulletY = useTransform(scrollYProgress, [0.58, 0.66], [20, 0])
    const copyStageThreeOpacity = useTransform(scrollYProgress, [0.68, 0.82], [0, 1])
    const copyStageThreeY = useTransform(scrollYProgress, [0.68, 0.82], [40, 0])

    const phoneOpacity = useTransform(scrollYProgress, [0.08, 0.18], [0, 1])
    const phoneY = useTransform(scrollYProgress, [0.08, 0.18], [100, 0])
    const buttonScale = useTransform(scrollYProgress, [0.28, 0.38, 0.42, 0.48], [1, 1, 0.95, 0.88])
    const practiceButtonScale = useTransform(scrollYProgress, [0.36, 0.40, 0.44], [1, 0.92, 1])
    const practiceButtonY = useTransform(scrollYProgress, [0.36, 0.40, 0.44], [0, 3, 0])
    const practiceButtonShadowIntensity = useTransform(scrollYProgress, [0.36, 0.40, 0.44], [1, 0.3, 1])
    const practiceButtonBoxShadow = useTransform(practiceButtonShadowIntensity, (v) => 
        `0 ${4 * v}px ${8 * v}px -2px rgba(59, 130, 246, ${0.25 * v}), 0 ${2 * v}px ${4 * v}px -2px rgba(59, 130, 246, ${0.1 * v})`
    )
    const buttonOpacity = useTransform(scrollYProgress, [0.45, 0.52], [1, 0])
    const baseScreenOpacity = useTransform(scrollYProgress, [0.48, 0.55], [1, 0])
    const lessonOpacity = useTransform(scrollYProgress, [0.52, 0.68], [0, 1])
    const lessonScale = useTransform(scrollYProgress, [0.52, 0.68], [0.8, 1])
    const lessonX = useTransform(scrollYProgress, [0.66, QUIZ_START_THRESHOLD], [0, -420])
    const quizOpacity = useTransform(scrollYProgress, [QUIZ_START_THRESHOLD, 0.78], [0, 1])
    const quizX = useTransform(scrollYProgress, [QUIZ_START_THRESHOLD, 0.78], [140, 0])
    
    // Faster base hold time, will be adjusted by scroll velocity
    const BASE_HOLD_MS = 500
    const MIN_HOLD_MS = 200
    
    const stageOrder = STAGES.reduce<Record<Exclude<QuizStage, null>, number>>((acc, stage, idx) => {
        acc[stage] = idx
        return acc
    }, {} as Record<Exclude<QuizStage, null>, number>)
    const [lockedQuiz, setLockedQuiz] = useState<QuizStage>(null)
    const [quizSequenceStarted, setQuizSequenceStarted] = useState(false)
    const [quizSequenceComplete, setQuizSequenceComplete] = useState(false)
    const lockedQuizRef = useRef<QuizStage>(null)
    const holdUntilRef = useRef<number>(0)
    const lastScrollTimeRef = useRef<number>(Date.now())
    const lastScrollValueRef = useRef<number>(0)
    const scrollVelocityRef = useRef<number>(0)
    const desiredQuizRef = useRef<QuizStage>(null)

    useEffect(() => {
        lockedQuizRef.current = lockedQuiz
    }, [lockedQuiz])

    useEffect(() => {
        const unsubscribe = scrollYProgress.on('change', (v) => {
            // Track scroll velocity
            const now = Date.now()
            const timeDelta = now - lastScrollTimeRef.current
            const scrollDelta = Math.abs(v - lastScrollValueRef.current)
            
            if (timeDelta > 0) {
                // Calculate velocity (scroll units per ms)
                scrollVelocityRef.current = scrollDelta / timeDelta
            }
            
            lastScrollTimeRef.current = now
            lastScrollValueRef.current = v
            
            // Kick off the quiz sequence once we cross the threshold
            if (!quizSequenceStarted && v >= QUIZ_START_THRESHOLD) {
                setQuizSequenceStarted(true)
                setQuizSequenceComplete(false)
                desiredQuizRef.current = 'fill'
                return
            }

            // While sequence is running, always drive toward final quiz
            if (quizSequenceStarted && !quizSequenceComplete) {
                desiredQuizRef.current = 'fill'
                return
            }

            // After completion, stay on fill if past threshold, otherwise reset if scrolled back
            if (v >= QUIZ_START_THRESHOLD) {
                desiredQuizRef.current = 'fill'
            } else {
                desiredQuizRef.current = null
                // Reset sequence if scrolled back before threshold
                if (quizSequenceComplete) {
                    setQuizSequenceStarted(false)
                    setQuizSequenceComplete(false)
                }
            }
        })

        return () => unsubscribe()
    }, [scrollYProgress, quizSequenceStarted, quizSequenceComplete])

    useEffect(() => {
        const getHoldTime = () => {
            // Faster scrolling = shorter hold time
            const velocity = scrollVelocityRef.current
            if (velocity > 0.0005) {
                return MIN_HOLD_MS
            } else if (velocity > 0.0002) {
                return Math.max(MIN_HOLD_MS, BASE_HOLD_MS * 0.5)
            }
            return BASE_HOLD_MS
        }
        
        const applyStage = (stage: QuizStage) => {
            setLockedQuiz(stage)
            lockedQuizRef.current = stage
            const holdTime = getHoldTime()
            holdUntilRef.current = Date.now() + holdTime
            if (stage === 'fill') {
                setTimeout(() => setQuizSequenceComplete(true), holdTime)
            }
        }

        let raf: number
        const step = () => {
            const desired = desiredQuizRef.current
            const current = lockedQuizRef.current
            const now = Date.now()

            if (desired !== current) {
                if (desired === null) {
                    applyStage(null)
                } else {
                    const desiredIndex = stageOrder[desired]
                    const currentIndex = current === null ? -1 : stageOrder[current]

                    // Always start from the first quiz if we enter mid-way
                    if (current === null) {
                        applyStage(STAGES[0])
                    } else if (desiredIndex < currentIndex) {
                        // Going backwards - jump directly
                        applyStage(desired)
                    } else if (now >= holdUntilRef.current) {
                        // Progress to next stage
                        const nextIndex = Math.min(desiredIndex, currentIndex + 1)
                        applyStage(STAGES[nextIndex])
                    }
                }
            }

            raf = requestAnimationFrame(step)
        }

        raf = requestAnimationFrame(step)
        return () => cancelAnimationFrame(raf)
    }, [stageOrder])

    return (
        <section className="relative w-full bg-white">
            <div ref={containerRef} className="relative h-[520vh] md:h-[600vh]">
                <div className="sticky top-0 h-screen flex items-center">
                    <div className="w-full px-4 pb-12">
                        <div className="max-w-6xl mx-auto grid items-center gap-12 md:grid-cols-[minmax(0,1fr)_360px]">
                            <div className="relative min-h-[360px]">
                                <motion.div
                                    style={{ opacity: copyStageOneOpacity, y: copyStageOneY }}
                                    className="space-y-4 text-left"
                                >
                                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600/80">Daily reps</p>
                                    <h2 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                                        Tap Daily Practice to prime the next rep.
                                    </h2>
                                    <p className="text-base md:text-lg text-gray-500 max-w-xl">
                                        See the button slide in as soon as you arrive—one tap gets you into the flow without hunting for what to review.
                                    </p>
                                </motion.div>
                                <motion.div
                                    style={{ opacity: copyStageTwoOpacity, y: copyStageTwoY, x: copyStageTwoX }}
                                    className="space-y-4 text-left absolute inset-0 flex flex-col justify-center md:max-w-lg z-10"
                                >
                                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600/80">Lesson view</p>
                                    <h2 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                                        Lessons will show up for new information.
                                    </h2>
                                    <p className="text-base md:text-lg text-gray-500 max-w-xl">
                                        When the button completes, we slide in the next lesson automatically so you keep absorbing without breaking focus.
                                    </p>
                                </motion.div>
                                <motion.div
                                    style={{ opacity: lessonBulletOpacity, y: lessonBulletY }}
                                    className="absolute -bottom-24 left-0 w-full flex flex-wrap gap-4 z-30"
                                >
                                    <div className="flex-1 min-w-[220px] max-w-sm p-4 border border-indigo-200 rounded-2xl bg-indigo-50/80 backdrop-blur text-sm text-indigo-900 font-semibold">
                                        • Lessons will show up for new information.
                                    </div>
                                </motion.div>
                                <motion.div
                                    style={{ opacity: copyStageThreeOpacity, y: copyStageThreeY }}
                                    className="space-y-4 text-left absolute inset-0 flex flex-col justify-center z-20"
                                >
                                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-600/80">Quiz follow-up</p>
                                    <h2 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                                        Do follow up quizzes on new learnt information for maximal retention.
                                    </h2>
                                    <p className="text-base md:text-lg text-gray-500 max-w-xl">
                                        As soon as you wrap the lesson, we bring in spaced quizzes targeting the fresh material so it sticks.
                                    </p>
                                </motion.div>
                            </div>
                            <motion.div
                                style={{ opacity: phoneOpacity, y: phoneY }}
                                className="flex justify-center md:justify-end min-h-[620px]"
                            >
                                <div className="w-full max-w-[320px]">
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
                                                <div className="flex-1 flex flex-col items-center justify-center gap-8 text-blue-800">
                                                    <div className="text-center space-y-2">
                                                        <p className="text-sm font-semibold tracking-[0.4em] text-blue-400 uppercase">Lesson</p>
                                                        <p className="text-4xl font-bold text-blue-700">Lesson 1</p>
                                                    </div>
                                                    <div className="w-full max-w-[260px] space-y-3">
                                                        {[0, 1, 2, 3].map((_, idx) => (
                                                            <div key={`lesson-line-${idx}`} className="h-4 rounded-full bg-blue-100/80" />
                                                        ))}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
                                                        {[0, 1, 2, 3].map((_, idx) => (
                                                            <div key={`lesson-card-${idx}`} className="h-20 rounded-3xl bg-white/80 border border-blue-100 flex items-center justify-center shadow-sm">
                                                                <div className="h-2 w-1/2 bg-blue-100 rounded-full" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="w-full max-w-[280px] grid grid-cols-3 gap-3 mx-auto">
                                                    {[0, 1, 2].map((pill) => (
                                                        <div key={`lesson-pill-${pill}`} className="h-10 rounded-2xl bg-white/70 border border-blue-100" />
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
                                                                {lockedQuiz === 'trueFalse' && (
                                                                    <>
                                                                        <div className="h-2 w-1/3 bg-purple-200 rounded-full" />
                                                                        <div className="space-y-2">
                                                                            <div className="h-2 rounded-full bg-purple-100 w-full" />
                                                                            <div className="h-2 rounded-full bg-purple-100 w-2/3" />
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-3 mt-2">
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
                                                                        <div className="space-y-2">
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
                                                                        <div className="grid grid-cols-2 gap-3">
                                                                            {[0, 1, 2].map((item) => (
                                                                                <div key={`match-l-${item}`} className="p-3 rounded-2xl bg-purple-50 border border-purple-100 h-12" />
                                                                            ))}
                                                                            {[0, 1, 2].map((item) => (
                                                                                <div
                                                                                    key={`match-r-${item}`}
                                                                                    className={`relative p-3 rounded-2xl h-12 ${
                                                                                        item === 1 ? 'bg-emerald-50 border border-emerald-200' : 'bg-purple-50 border border-purple-100'
                                                                                    }`}
                                                                                >
                                                                                    {item === 1 && (
                                                                                        <motion.div
                                                                                            initial={{ scale: 0.9, backgroundColor: '#bbf7d0', opacity: 0 }}
                                                                                            animate={{
                                                                                                scale: [0.9, 0.98, 1.12, 1],
                                                                                                opacity: [0, 0.6, 1, 1],
                                                                                                backgroundColor: ['#bbf7d0', '#bbf7d0', '#34d399', '#34d399']
                                                                                            }}
                                                                                            transition={{ duration: 0.4, times: [0, 0.2, 0.55, 1], ease: 'easeOut' }}
                                                                                            className="absolute inset-y-2 right-3 w-4 h-4 rounded-full"
                                                                                        />
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {lockedQuiz === 'fill' && (
                                                                    <>
                                                                        <div className="h-2 w-1/4 bg-purple-200 rounded-full" />
                                                                        <div className="h-2 bg-purple-100 rounded-full w-full" />
                                                                        <div className="relative h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center px-4">
                                                                            <div className="h-2 w-2/3 bg-purple-200 rounded-full" />
                                                                            <motion.div
                                                                                initial={{ scale: 0.9, backgroundColor: '#e9d5ff', opacity: 0 }}
                                                                                animate={{
                                                                                    scale: [0.9, 0.95, 1.1, 1],
                                                                                    opacity: [0, 0.5, 1, 1],
                                                                                    backgroundColor: ['#e9d5ff', '#e9d5ff', '#34d399', '#34d399']
                                                                                }}
                                                                                transition={{ duration: 0.4, times: [0, 0.2, 0.55, 1], ease: 'easeOut' }}
                                                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
                                                                            />
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            {[0, 1, 2].map((pill) => (
                                                                                <div key={`fb-pill-${pill}`} className="flex-1 h-2 rounded-full bg-purple-100" />
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
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
