'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView, useTransform } from 'framer-motion'
import PracticePhoneContent from './PracticePhone/PracticePhoneContent'
import PracticeScrollCopy from './PracticePhone/PracticeScrollCopy'
import { useTimeProgress } from '../../hooks/useTimeProgress'

type QuizStage = 'trueFalse' | 'multiple' | 'matching' | 'fill' | 'ordering' | 'errorSpotting' | 'shortAnswer' | 'caseStudy' | 'sorting' | null
const QUIZ_START_THRESHOLD = 0.47
const STAGES: Exclude<QuizStage, null>[] = ['trueFalse', 'multiple', 'shortAnswer', 'caseStudy', 'matching', 'fill', 'ordering', 'errorSpotting', 'sorting']

export default function PracticeScrollShowcase() {
    const containerRef = useRef<HTMLDivElement>(null)
    const inView = useInView(containerRef, { once: true, amount: 0.2 })

    // Animate over 20 seconds to allow for lesson reading
    const progress = useTimeProgress({
        trigger: inView,
        duration: 20000,
        delay: 200
    })

    // Intro Animations
    // Intro Animations
    // Stage One: 0.02 - 0.08
    const copyStageOneOpacity = useTransform(progress, [0.02, 0.08], [0, 1])
    const copyStageOneY = useTransform(progress, [0.02, 0.08], [30, 0])

    // Stage Two: 0.18 - 0.25 (Persists)
    const copyStageTwoOpacity = useTransform(progress, [0.18, 0.25], [0, 1])
    const copyStageTwoY = useTransform(progress, [0.18, 0.25], [30, 0])

    // Stage Three: 0.58 - 0.65 (Persists)
    const copyStageThreeOpacity = useTransform(progress, [0.58, 0.65], [0, 1])
    const copyStageThreeY = useTransform(progress, [0.58, 0.65], [30, 0])

    const phoneOpacity = useTransform(progress, [0.02, 0.08], [0, 1])
    const phoneY = useTransform(progress, [0.02, 0.08], [100, 0])

    // Buttons & Interaction: 0.10 -> 0.22
    const buttonScale = useTransform(progress, [0.10, 0.16, 0.18, 0.22], [1, 1, 0.95, 0.88])
    const practiceButtonScale = useTransform(progress, [0.14, 0.16, 0.18], [1, 0.92, 1])
    const practiceButtonY = useTransform(progress, [0.14, 0.16, 0.18], [0, 3, 0])
    const practiceButtonShadowIntensity = useTransform(progress, [0.14, 0.16, 0.18], [1, 0.3, 1])
    const practiceButtonBoxShadow = useTransform(practiceButtonShadowIntensity, (v) =>
        `0 ${4 * v}px ${8 * v}px -2px rgba(59, 130, 246, ${0.25 * v}), 0 ${2 * v}px ${4 * v}px -2px rgba(59, 130, 246, ${0.1 * v})`
    )

    // Transitions: Button Exit
    const buttonOpacity = useTransform(progress, [0.22, 0.25], [1, 0])
    const baseScreenOpacity = useTransform(progress, [0.24, 0.26], [1, 0])

    // Lesson Entry: 0.25
    const lessonOpacity = useTransform(progress, [0.25, 0.30], [0, 1])
    const lessonScale = useTransform(progress, [0.25, 0.30], [0.8, 1])

    // Lesson Duration 0.25 -> 0.55
    // Step 0: 0.25 - 0.35
    // Step 1: 0.35 - 0.45
    // Step 2: 0.45 - 0.55
    const lessonStep = useTransform(progress, (v) => {
        if (v < 0.35) return 0
        if (v < 0.45) return 1
        return 2
    }) as unknown as import('framer-motion').MotionValue<number>

    // Exit lesson, enter quiz: 0.55 -> 0.60
    const lessonX = useTransform(progress, [0.55, 0.60], [0, -420])

    // Quiz Entry: Starts at 0.60
    const quizOpacity = useTransform(progress, [0.60, 0.68], [0, 1])
    const quizX = useTransform(progress, [0.60, 0.68], [140, 0])

    const [lockedQuiz, setLockedQuiz] = useState<QuizStage>(null)

    // Endless quiz cycling
    useEffect(() => {
        let interval: NodeJS.Timeout

        const checkProgress = () => {
            const v = progress.get()
            // Quizzes start at 0.60 now
            if (v >= 0.60) {
                if (!interval) {
                    interval = setInterval(() => {
                        setLockedQuiz(prev => {
                            if (!prev) return 'trueFalse'
                            const currentIndex = STAGES.indexOf(prev as any)
                            const nextIndex = (currentIndex + 1) % STAGES.length
                            return STAGES[nextIndex]
                        })
                    }, 2500) // Cycle every 2.5 seconds (balanced pacing)
                }
            } else {
                if (interval) clearInterval(interval)
                setLockedQuiz(null)
            }
        }

        const unsubscribe = progress.on('change', checkProgress)
        return () => {
            unsubscribe()
            if (interval) clearInterval(interval)
        }
    }, [progress])

    // Increase height enough to scroll past but not be huge
    return (
        <section id="practice-section" className="relative z-40 w-full h-fit pt-10 md:pt-14 lg:-mt-24 lg:pt-0">
            <div
                ref={containerRef}
                className="relative flex h-fit w-full items-center lg:min-h-[100vh]"
            >
                <div className="relative flex h-fit w-full items-center justify-center py-6 sm:py-8 lg:sticky lg:top-0 lg:h-screen lg:py-0">
                    <motion.div
                        className="relative z-30 mt-0 flex h-fit w-full min-w-0 max-w-7xl flex-col items-center justify-center gap-4 overflow-visible px-4 sm:gap-6 sm:px-6 md:mt-24 lg:mt-0 lg:px-8"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="mb-4 max-w-full text-center text-3xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-app-lilac via-app-mintBright to-app-blueBright drop-shadow-sm sm:whitespace-nowrap">
                            Daily Reinforcement
                        </h2>

                        <div className="relative mx-auto grid h-fit w-full max-w-[680px] grid-cols-1 items-center gap-12 md:max-w-6xl md:grid-cols-[minmax(0,1fr)_280px] md:gap-8 lg:gap-10 xl:max-w-7xl">

                            {/* Text Content (Left) */}
                            <div className="relative z-10 row-start-1 h-fit w-full min-w-0 md:col-start-1 md:col-end-2">
                                <PracticeScrollCopy
                                    copyStageOneOpacity={copyStageOneOpacity}
                                    copyStageOneY={copyStageOneY}
                                    copyStageTwoOpacity={copyStageTwoOpacity}
                                    copyStageTwoY={copyStageTwoY}
                                    copyStageThreeOpacity={copyStageThreeOpacity}
                                    copyStageThreeY={copyStageThreeY}
                                />
                            </div>

                            {/* Phone Content (Right) */}
                            <div className="relative z-20 row-start-2 mt-6 flex h-fit w-full justify-center md:col-start-2 md:col-end-3 md:row-start-1 md:mt-0 md:justify-end">
                                <motion.div
                                    style={{ opacity: phoneOpacity, y: phoneY }}
                                    className="flex h-fit min-h-[540px] w-full max-w-[280px] justify-center"
                                >
                                    <PracticePhoneContent
                                        baseScreenOpacity={baseScreenOpacity}
                                        buttonScale={buttonScale}
                                        buttonOpacity={buttonOpacity}
                                        practiceButtonScale={practiceButtonScale}
                                        practiceButtonY={practiceButtonY}
                                        practiceButtonBoxShadow={practiceButtonBoxShadow}
                                        lessonOpacity={lessonOpacity}
                                        lessonScale={lessonScale}
                                        lessonX={lessonX}
                                        lessonStep={lessonStep}
                                        quizOpacity={quizOpacity}
                                        quizX={quizX}
                                        lockedQuiz={lockedQuiz}
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
