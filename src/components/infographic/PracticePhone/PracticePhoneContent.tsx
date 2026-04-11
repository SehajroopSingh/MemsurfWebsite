'use client'

import React from 'react'
import { AnimatePresence, motion, MotionValue } from 'framer-motion'
import PhoneScreen from '../PhoneScreen'

type QuizStage = 'trueFalse' | 'multiple' | 'matching' | 'fill' | 'ordering' | 'errorSpotting' | 'shortAnswer' | 'caseStudy' | 'sorting' | null

const QUIZ_LABELS: Record<string, string> = {
    trueFalse: 'True or False',
    multiple: 'Multiple Choice',
    matching: 'Match Pairs',
    fill: 'Fill in the Blank',
    ordering: 'Put in Order',
    errorSpotting: 'Find the Error',
    shortAnswer: 'Short Answer',
    caseStudy: 'Case Study',
    sorting: 'Sort into Buckets'
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
            <div className="absolute inset-0 bg-app-canvas">
                {/* Stage 1: daily practice entry is just the button */}
                <motion.div
                    style={{ opacity: baseScreenOpacity }}
                    className="absolute inset-0 flex items-center justify-center px-6 pt-16 pb-12 bg-app-canvas"
                >
                    <motion.div
                        style={{ scale: buttonScale, opacity: buttonOpacity }}
                        className="w-full max-w-[260px] rounded-[28px] border border-app-border bg-app-surface p-5 flex flex-col gap-3 shadow-sm"
                    >
                        <div className="h-2 w-16 bg-app-surfaceElevated rounded-full" />
                        <motion.div
                            style={{
                                scale: practiceButtonScale,
                                y: practiceButtonY,
                                boxShadow: practiceButtonBoxShadow
                            }}
                            className="h-10 rounded-2xl bg-gradient-to-r from-app-mint via-app-softBlue to-app-violet flex items-center justify-center cursor-pointer"
                        >
                            <span className="text-white text-sm font-semibold tracking-wide">Practice Now</span>
                        </motion.div>
                        <div className="flex gap-2">
                            <div className="h-2 w-1/2 bg-app-border rounded-full" />
                            <div className="h-2 w-1/3 bg-app-surfaceElevated rounded-full" />
                        </div>
                    </motion.div>
                </motion.div>

                {/* Stage 2: full-screen lesson view */}
                <motion.div
                    style={{ opacity: lessonOpacity, scale: lessonScale, x: lessonX }}
                    className="absolute inset-0 px-6 py-10 bg-app-canvas flex flex-col gap-8"
                >
                    <div className="flex items-center justify-between">
                        <div className="h-2 w-16 bg-app-blueDark rounded-full" />
                        <div className="flex gap-2">
                            <div className="h-2 w-10 bg-app-surfaceElevated rounded-full" />
                            <div className="h-2 w-8 bg-app-surfaceElevated rounded-full" />
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-8 text-app-textMuted">
                        {/* Static Header */}
                        <div className="text-center space-y-2 mt-4">
                            <p className="text-sm font-semibold tracking-[0.4em] text-app-softBlue uppercase">Lesson</p>
                            <p className="text-4xl font-bold text-white">Lesson 1</p>
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
                                                <div
                                                    key={`l1-${idx}`}
                                                    className="h-4 rounded-full bg-[var(--app-blue-bright)] opacity-90"
                                                    style={{ width: `${100 - idx * 10}%` }}
                                                />
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
                                            {[0, 1].map((_, idx) => (
                                                <div
                                                    key={`c1-${idx}`}
                                                    className={`h-24 rounded-3xl bg-app-surfaceElevated/90 border shadow-sm flex items-center justify-center ${
                                                        idx === 0 ? 'border-app-softBlue/30 ring-1 ring-app-softBlue/15' : 'border-app-mint/25 ring-1 ring-app-mint/10'
                                                    }`}
                                                >
                                                    <div className="h-2 w-1/2 rounded-full bg-[var(--app-text-muted)] opacity-85" />
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
                                        <div className="w-full max-w-[280px] h-32 rounded-3xl bg-app-surfaceElevated/90 border border-app-lavender/25 ring-1 ring-app-blueHi/20 p-4 space-y-3">
                                            <div className="h-2 w-1/3 rounded-full bg-[var(--app-soft-blue)] opacity-95" />
                                            <div className="h-2 w-full rounded-full bg-[var(--app-text-muted)] opacity-85" />
                                            <div className="h-2 w-5/6 rounded-full bg-[var(--app-text-muted)] opacity-75" />
                                            <div className="h-2 w-4/6 rounded-full bg-[var(--app-text-muted)] opacity-65" />
                                        </div>
                                        <div className="w-full max-w-[260px] space-y-3">
                                            <div className="h-4 w-full rounded-full bg-[var(--app-blue-highlight)] opacity-95" />
                                            <div className="h-4 w-3/4 rounded-full bg-[var(--app-blue-bright)] opacity-90" />
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
                                            <div className="mb-2 h-4 w-1/2 rounded-full bg-[var(--app-mint-bright)] opacity-95" />
                                            {[0, 1, 2].map((_, idx) => (
                                                <div key={`l3-${idx}`} className="h-3 w-full rounded-full bg-[var(--app-blue-bright)] opacity-88" />
                                            ))}
                                        </div>
                                        <div className="flex gap-3 w-full max-w-[280px]">
                                            <div className="flex-1 h-32 rounded-3xl bg-app-surfaceElevated/90 border border-app-softBlue/28 p-3 flex flex-col justify-end ring-1 ring-app-mint/12">
                                                <div className="mb-auto h-8 w-8 rounded-full border border-[var(--app-soft-blue)] bg-[var(--app-soft-blue)] opacity-30" />
                                                <div className="h-2 w-2/3 rounded-full bg-[var(--app-text-muted)] opacity-85" />
                                            </div>
                                            <div className="flex-1 h-32 rounded-3xl bg-app-surfaceElevated/90 border border-app-mint/28 p-3 flex flex-col justify-end ring-1 ring-app-lavender/12">
                                                <div className="mb-auto h-8 w-8 rounded-full border border-[var(--app-mint)] bg-[var(--app-mint)] opacity-25" />
                                                <div className="h-2 w-2/3 rounded-full bg-[var(--app-text-muted)] opacity-85" />
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
                                    backgroundColor: step === pill ? '#7196cf' : 'rgba(21, 42, 64, 0.85)',
                                    borderColor: step === pill ? '#5376ab' : 'rgba(31, 61, 92, 0.9)'
                                }}
                                className="h-2 rounded-full border"
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Stage 3: quiz follow-up */}
                <motion.div
                    style={{ opacity: quizOpacity, x: quizX }}
                    className="absolute inset-0 px-6 py-10 bg-app-canvas flex flex-col gap-6"
                >
                    <div className="flex items-center justify-between">
                        <div className="h-2 w-24 bg-app-border rounded-full" />
                        <div className="h-8 w-8 rounded-full bg-app-surface border border-app-border" />
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
                                    className="absolute inset-0 p-5 rounded-3xl bg-app-surface shadow-sm border border-app-border flex flex-col gap-4"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold tracking-wider text-app-lavender uppercase">
                                            {QUIZ_LABELS[lockedQuiz] || 'Quiz'}
                                        </span>
                                        <div className="h-1.5 w-12 rounded-full bg-[var(--app-soft-blue)] opacity-95" />
                                    </div>

                                    {lockedQuiz === 'trueFalse' && (
                                        <>
                                            <div className="h-2 w-1/3 rounded-full bg-[var(--app-soft-blue)] opacity-95" />
                                            <div className="space-y-2">
                                                <div className="h-2 w-full rounded-full bg-[var(--app-text-muted)] opacity-90" />
                                                <div className="h-2 w-2/3 rounded-full bg-[var(--app-text-muted)] opacity-80" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                                {[0, 1].map((opt) => (
                                                    <div key={opt} className="p-3 rounded-2xl bg-app-lavender/10 border border-app-lavender/25 flex items-center justify-between">
                                                        <div className="h-2 w-2/3 rounded-full bg-[var(--app-blue-bright)] opacity-95" />
                                                        <motion.div
                                                            key={`tf-blob-${opt}`}
                                                            initial={{ scale: 1, backgroundColor: 'rgba(140, 101, 198, 0.42)' }}
                                                            animate={
                                                                opt === 0
                                                                    ? {
                                                                        scale: [1, 0.92, 1.08, 1],
                                                                        backgroundColor: [
                                                                            'rgba(140, 101, 198, 0.42)',
                                                                            'rgba(140, 101, 198, 0.42)',
                                                                            'var(--app-mint)',
                                                                            'var(--app-mint)'
                                                                        ]
                                                                    }
                                                                    : { scale: 1, backgroundColor: 'rgba(31, 61, 92, 0.55)' }
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
                                            <div className="h-2 w-1/2 rounded-full bg-[var(--app-soft-blue)] opacity-95" />
                                            <div className="space-y-2 flex-1">
                                                {Array.from({ length: 3 }).map((_, idx) => (
                                                    <div key={`mc-${idx}`} className="p-3 rounded-2xl bg-app-lavender/10 border border-app-lavender/25 flex items-center gap-3">
                                                        <motion.div
                                                            initial={{ scale: 1, backgroundColor: 'rgba(140, 101, 198, 0.42)' }}
                                                            animate={
                                                                idx === 1
                                                                    ? {
                                                                        scale: [1, 0.9, 1.12, 1],
                                                                        backgroundColor: [
                                                                            'rgba(140, 101, 198, 0.42)',
                                                                            'rgba(140, 101, 198, 0.42)',
                                                                            'var(--app-lilac)',
                                                                            'var(--app-lilac)'
                                                                        ]
                                                                    }
                                                                    : { scale: 1, backgroundColor: 'rgba(140, 101, 198, 0.38)' }
                                                            }
                                                            transition={{ duration: 0.4, times: [0, 0.25, 0.55, 1], ease: 'easeOut' }}
                                                            className="w-6 h-6 rounded-full"
                                                        />
                                                        <div className="h-2 flex-1 rounded-full bg-[var(--app-text-muted)] opacity-88" />
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    {lockedQuiz === 'matching' && (
                                        <>
                                            <div className="h-2 w-1/3 rounded-full bg-[var(--app-soft-blue)] opacity-95" />
                                            <div className="grid grid-cols-2 gap-3 mt-2">
                                                {/* LEFT SIDE */}
                                                {[0, 1, 2].map((item) => (
                                                    <div
                                                        key={`match-l-${item}`}
                                                        className={`relative p-3 rounded-2xl h-12 flex items-center border transition-colors duration-300 ${item === 1 ? 'bg-app-lavender/20 border-app-lavender/35' : 'bg-app-lavender/10 border-app-lavender/25'}`}
                                                    >
                                                        <div className="relative z-[1] h-2 w-[72%] rounded-full bg-[var(--app-text-muted)] opacity-88" />
                                                        {item === 1 && (
                                                            <motion.div
                                                                layoutId="match-left-selection"
                                                                className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-app-mint"
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
                                                        className={`relative p-3 rounded-2xl h-12 flex items-center justify-end border transition-colors duration-300 ${item === 1 ? 'bg-app-lavender/20 border-app-lavender/35' : 'bg-app-lavender/10 border-app-lavender/25'}`}
                                                    >
                                                        <div className="relative z-[1] h-2 w-[65%] rounded-full bg-[var(--app-text-muted)] opacity-88" />
                                                        {item === 1 && (
                                                            <>
                                                                <motion.div
                                                                    initial={{ scale: 0.9, backgroundColor: 'rgba(140, 101, 198, 0.48)', opacity: 0 }}
                                                                    animate={{
                                                                        scale: [0.9, 0.98, 1.12, 1],
                                                                        opacity: [0, 0.6, 1, 1],
                                                                        backgroundColor: [
                                                                            'rgba(140, 101, 198, 0.48)',
                                                                            'rgba(140, 101, 198, 0.48)',
                                                                            'var(--app-mint)',
                                                                            'var(--app-mint)'
                                                                        ]
                                                                    }}
                                                                    transition={{ duration: 0.4, times: [0, 0.2, 0.55, 1], ease: 'easeOut' }}
                                                                    className="absolute inset-y-2 right-3 w-4 h-4 rounded-full z-10"
                                                                />
                                                                <motion.div
                                                                    layoutId="match-right-selection"
                                                                    className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-app-mint"
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
                                            <div className="h-2 w-1/4 rounded-full bg-[var(--app-soft-blue)] opacity-95" />
                                            {/* Text block with blank */}
                                            <div className="mt-4 p-4 rounded-2xl bg-app-lavender/10 border border-app-lavender/25 leading-relaxed relative">
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    <div className="h-2 w-12 rounded-full bg-[var(--app-text-muted)] opacity-88" />
                                                    <div className="h-2 w-16 rounded-full bg-[var(--app-text-muted)] opacity-85" />
                                                    <div className="h-2 w-8 rounded-full bg-[var(--app-text-muted)] opacity-82" />
                                                    {/* The Blank */}
                                                    <div className="relative h-8 w-24 border-b-2 border-app-border bg-app-surfaceElevated rounded-md mx-1 overflow-hidden flex items-center justify-center">
                                                        <motion.div
                                                            initial={{ y: 20, opacity: 0 }}
                                                            animate={{ y: 0, opacity: 1 }}
                                                            transition={{ delay: 0.5, duration: 0.4, type: "spring" }}
                                                            className="h-2 w-16 rounded-full bg-[var(--app-mint)]"
                                                        />
                                                    </div>
                                                    <div className="h-2 w-10 rounded-full bg-[var(--app-text-muted)] opacity-85" />
                                                    <div className="h-2 w-14 rounded-full bg-[var(--app-text-muted)] opacity-82" />
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-auto">
                                                {[0, 1, 2].map((pill) => (
                                                    <div key={`fb-pill-${pill}`} className="flex-1 h-8 rounded-xl bg-app-lavender/20 border border-app-lavender/35 flex items-center justify-center">
                                                        <div className="h-1.5 w-8 rounded-full bg-[var(--app-soft-blue)] opacity-95" />
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    {lockedQuiz === 'ordering' && (
                                        <>
                                            <div className="h-2 w-1/3 rounded-full bg-[var(--app-soft-blue)] opacity-95" />
                                            <div className="mt-2 flex flex-col gap-2">
                                                {[0, 1, 2, 3].map((item, i) => (
                                                    <motion.div
                                                        key={`order-${item}`}
                                                        className="p-3 rounded-2xl bg-app-lavender/10 border border-app-lavender/25 flex items-center gap-3"
                                                        initial={i === 1 ? { y: 45 } : i === 2 ? { y: -45 } : {}}
                                                        animate={i === 1 ? { y: 0 } : i === 2 ? { y: 0 } : {}}
                                                        transition={{ duration: 0.6, delay: 0.2, type: 'spring', bounce: 0.2 }}
                                                    >
                                                        <div className="flex flex-col gap-1">
                                                            <div className="h-1 w-1 rounded-full bg-[var(--app-mint)]" />
                                                            <div className="h-1 w-1 rounded-full bg-[var(--app-mint)]" />
                                                            <div className="h-1 w-1 rounded-full bg-[var(--app-mint)]" />
                                                        </div>
                                                        <div className="h-2 w-2/3 rounded-full bg-[var(--app-text-muted)] opacity-88" />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    {lockedQuiz === 'errorSpotting' && (
                                        <>
                                            <div className="h-2 w-1/2 rounded-full bg-[var(--app-soft-blue)] opacity-95" />
                                            <div className="mt-2 flex-1 space-y-3 rounded-2xl border border-app-lavender/25 bg-app-lavender/10 p-3">
                                                <div className="h-2 w-full rounded-full bg-[var(--app-text-muted)] opacity-88" />
                                                <div className="flex gap-2">
                                                    <div className="h-2 w-1/3 rounded-full bg-[var(--app-text-muted)] opacity-82" />
                                                    <motion.div
                                                        className="h-2 w-1/4 bg-rose-500/40 rounded-full"
                                                        initial={{ backgroundColor: 'rgba(140, 101, 198, 0.2)' }}
                                                        animate={{ backgroundColor: 'rgba(244, 63, 94, 0.55)', scale: [1, 1.1, 1] }}
                                                        transition={{ delay: 0.5, duration: 0.4 }}
                                                    />
                                                    <div className="h-2 w-1/4 rounded-full bg-[var(--app-text-muted)] opacity-78" />
                                                </div>
                                                <div className="h-2 w-3/4 rounded-full bg-[var(--app-text-muted)] opacity-82" />
                                                <div className="h-2 w-5/6 rounded-full bg-[var(--app-text-muted)] opacity-78" />
                                            </div>
                                            <div className="flex gap-2 justify-center mt-2">
                                                <div className="h-8 w-24 rounded-full bg-app-surface border border-rose-500/35 flex items-center justify-center">
                                                    <div className="h-1.5 w-12 bg-rose-400/50 rounded-full" />
                                                </div>
                                                <div className="h-8 w-24 rounded-full bg-app-surface border border-app-mint/40 flex items-center justify-center">
                                                    <div className="h-1.5 w-12 rounded-full bg-[var(--app-mint)] opacity-90" />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {lockedQuiz === 'shortAnswer' && (
                                        <>
                                            <div className="h-2 w-1/3 rounded-full bg-[var(--app-soft-blue)] opacity-95" />
                                            <div className="mt-1 space-y-2">
                                                <div className="h-2 w-full rounded-full bg-[var(--app-text-muted)] opacity-90" />
                                                <div className="h-2 w-3/4 rounded-full bg-[var(--app-text-muted)] opacity-85" />
                                            </div>
                                            <div className="flex-1 rounded-2xl bg-app-lavender/10 border border-app-lavender/25 p-4 mt-2 relative overflow-hidden">
                                                <div className="absolute left-4 top-4 h-4 w-[2px] animate-pulse bg-[var(--app-lavender)] opacity-80" />
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.8, duration: 0.5 }}
                                                    className="space-y-2"
                                                >
                                                    <div className="h-2 w-[92%] rounded-full bg-[var(--app-text-muted)] opacity-90" />
                                                    <div className="h-2 w-[83%] rounded-full bg-[var(--app-text-muted)] opacity-85" />
                                                    <div className="h-2 w-[36%] rounded-full bg-[var(--app-text-muted)] opacity-80" />
                                                </motion.div>
                                            </div>
                                            <div className="h-10 w-full rounded-2xl bg-app-lavender flex items-center justify-center mt-auto shadow-sm shadow-app-lavender/30">
                                                <div className="h-2 w-16 rounded-full bg-[var(--app-text)] opacity-25" />
                                            </div>
                                        </>
                                    )}
                                    {lockedQuiz === 'caseStudy' && (
                                        <>
                                            <div className="h-2 w-1/3 rounded-full bg-[var(--app-soft-blue)] opacity-95" />

                                            {/* Case Context Block */}
                                            <div className="relative mt-1 space-y-2 overflow-hidden rounded-2xl border border-app-border bg-app-softBlue/12 p-3">
                                                <div className="absolute left-0 top-0 h-full w-1 bg-[var(--app-soft-blue)] opacity-80" />
                                                <div className="h-1.5 w-[92%] rounded-full bg-[var(--app-blue-highlight)] opacity-95" />
                                                <div className="h-1.5 w-[83%] rounded-full bg-[var(--app-blue-bright)] opacity-90" />
                                                <div className="h-1.5 w-full rounded-full bg-[var(--app-blue-bright)] opacity-88" />
                                            </div>

                                            <div className="mt-2 space-y-2">
                                                <div className="h-2 w-full rounded-full bg-[var(--app-text-muted)] opacity-88" />
                                                <div className="h-2 w-3/4 rounded-full bg-[var(--app-text-muted)] opacity-82" />
                                            </div>

                                            <div className="grid grid-cols-1 gap-2 mt-auto">
                                                {[0, 1].map((opt) => (
                                                    <div key={`case-opt-${opt}`} className="p-3 rounded-2xl bg-app-lavender/10 border border-app-lavender/25 flex items-center gap-3">
                                                        <div className={`w-4 h-4 rounded-full border-2 ${opt === 0 ? 'border-app-lavender bg-app-lavender' : 'border-app-lavender/40'}`} />
                                                        <div className="h-2 w-2/3 rounded-full bg-[var(--app-text-muted)] opacity-88" />
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    {lockedQuiz === 'sorting' && (
                                        <>
                                            <div className="h-2 w-1/3 rounded-full bg-[var(--app-soft-blue)] opacity-95" />
                                            <div className="mt-2 flex flex-1 flex-col justify-between">
                                                {/* The Item being sorted */}
                                                <div className="flex-1 flex items-center justify-center relative">
                                                    <motion.div
                                                        key="sorting-item-1"
                                                        initial={{ scale: 0.8, opacity: 0, y: 0, x: 0 }}
                                                        animate={{
                                                            scale: [0.8, 1, 1, 0.6, 0.4],
                                                            opacity: [0, 1, 1, 0.8, 0],
                                                            x: [0, 0, 0, -50, -65],
                                                            y: [0, 0, 0, 45, 90]
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            times: [0, 0.2, 0.5, 0.8, 1],
                                                            repeat: Infinity,
                                                            ease: "easeInOut"
                                                        }}
                                                        className="w-24 h-12 rounded-xl bg-app-surface border border-app-border shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex flex-col gap-1.5 p-2.5 z-10"
                                                    >
                                                        <div className="h-1.5 w-full rounded-full bg-[var(--app-blue-bright)] opacity-95" />
                                                        <div className="h-1.5 w-2/3 rounded-full bg-[var(--app-soft-blue)] opacity-92" />
                                                    </motion.div>

                                                    <motion.div
                                                        key="sorting-item-2"
                                                        initial={{ scale: 0.8, opacity: 0, y: 0, x: 0 }}
                                                        animate={{
                                                            scale: [0.8, 1, 1, 0.6, 0.4],
                                                            opacity: [0, 1, 1, 0.8, 0],
                                                            x: [0, 0, 0, 50, 65],
                                                            y: [0, 0, 0, 45, 90]
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            delay: 1,
                                                            times: [0, 0.2, 0.5, 0.8, 1],
                                                            repeat: Infinity,
                                                            ease: "easeInOut"
                                                        }}
                                                        className="absolute w-24 h-12 rounded-xl bg-app-surface border border-app-border shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex flex-col gap-1.5 p-2.5 z-10"
                                                    >
                                                        <div className="h-1.5 w-full rounded-full bg-[var(--app-lilac)] opacity-92" />
                                                        <div className="h-1.5 w-1/2 rounded-full bg-[var(--app-lavender)] opacity-88" />
                                                        <div className="h-1.5 w-3/4 rounded-full bg-[var(--app-lavender)] opacity-85" />
                                                    </motion.div>
                                                </div>

                                                {/* Differentiated Buckets */}
                                                <div className="flex gap-4 mb-2">
                                                    {/* Bucket A: Causes */}
                                                    <div className="flex-1 h-24 rounded-t-[2rem] border-t-2 border-x-2 border-dashed border-app-softBlue/35 bg-app-softBlue/10 flex flex-col items-center justify-end pb-4 gap-2 relative overflow-hidden">
                                                        <div className="absolute top-2 flex gap-1">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-[var(--app-soft-blue)] opacity-85" />
                                                            <div className="h-1.5 w-4 rounded-full bg-[var(--app-soft-blue)] opacity-85" />
                                                        </div>
                                                        <div className="h-2 w-12 rounded-full bg-[var(--app-soft-blue)] opacity-80" />
                                                        <span className="text-[9px] font-black text-app-softBlue/50 uppercase tracking-widest">Causes</span>
                                                    </div>

                                                    {/* Bucket B: Effects */}
                                                    <div className="flex-1 h-24 rounded-t-[2rem] border-t-2 border-x-2 border-dashed border-app-violet/35 bg-app-violet/10 flex flex-col items-center justify-end pb-4 gap-2 relative overflow-hidden">
                                                        <div className="absolute top-2 flex flex-col gap-1">
                                                            <div className="h-1 w-6 rounded-full bg-[var(--app-violet)] opacity-85" />
                                                            <div className="h-1 w-4 rounded-full bg-[var(--app-violet)] opacity-85" />
                                                        </div>
                                                        <div className="h-2 w-12 rounded-full bg-[var(--app-lilac)] opacity-75" />
                                                        <span className="text-[9px] font-black text-app-lavender/60 uppercase tracking-widest">Effects</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="w-full grid grid-cols-3 gap-2">
                        {[0, 1, 2].map((pill) => (
                            <div key={`quiz-pill-${pill}`} className="h-3 rounded-full bg-[var(--app-lavender)] opacity-40" />
                        ))}
                    </div>
                </motion.div>
            </div>
        </PhoneScreen>
    )
}


