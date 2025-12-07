'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView, useTransform } from 'framer-motion'
import PracticePhoneContent from './PracticePhone/PracticePhoneContent'
import PracticeScrollCopy from './PracticePhone/PracticeScrollCopy'
import { useTimeProgress } from '../../hooks/useTimeProgress'

type QuizStage = 'trueFalse' | 'multiple' | 'matching' | 'fill' | 'ordering' | 'errorSpotting' | 'shortAnswer' | 'caseStudy' | null
const QUIZ_START_THRESHOLD = 0.47
const STAGES: Exclude<QuizStage, null>[] = ['trueFalse', 'multiple', 'shortAnswer', 'caseStudy', 'matching', 'fill', 'ordering', 'errorSpotting']

export default function PracticeScrollShowcase() {
    const containerRef = useRef<HTMLDivElement>(null)
    const inView = useInView(containerRef, { once: true, amount: 0.4 })

    // Animate over 20 seconds to allow for lesson reading
    const progress = useTimeProgress({
        trigger: inView,
        duration: 20000,
        delay: 200
    })

    // Intro Animations
    // 0.0 - 0.25: Intro & Button Click
    const copyStageOneOpacity = useTransform(progress, [0.08, 0.18], [1, 0])
    const copyStageOneY = useTransform(progress, [0.08, 0.18], [0, -30])

    const copyStageTwoOpacity = useTransform(progress, [0.18, 0.25, 0.28, 0.32], [0, 1, 1, 0])
    const copyStageTwoY = useTransform(progress, [0.18, 0.25, 0.28, 0.32], [30, 0, -50, -140])
    const copyStageTwoX = useTransform(progress, [0.18, 0.32], [30, 30])

    const lessonBulletOpacity = useTransform(progress, [0.22, 0.26], [0, 1])
    const lessonBulletY = useTransform(progress, [0.22, 0.26], [20, 0])

    // Stage Three: Starts just before quiz section
    const copyStageThreeOpacity = useTransform(progress, [0.58, 0.65], [0, 1])
    const copyStageThreeY = useTransform(progress, [0.58, 0.65], [40, 0])

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
    })

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
                    }, 1800) // Cycle every 1.8 seconds
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
        <section className="relative w-full bg-white z-50">
            <div
                ref={containerRef}
                className="relative min-h-[120vh] flex items-center"
            >
                <div className="sticky top-0 h-screen w-full flex items-center">
                    <div className="w-full px-4 pb-12">
                        <div className="max-w-6xl mx-auto grid items-center gap-12 md:grid-cols-[minmax(0,1fr)_360px]">
                            <PracticeScrollCopy
                                copyStageOneOpacity={copyStageOneOpacity}
                                copyStageOneY={copyStageOneY}
                                copyStageTwoOpacity={copyStageTwoOpacity}
                                copyStageTwoY={copyStageTwoY}
                                copyStageTwoX={copyStageTwoX}
                                lessonBulletOpacity={lessonBulletOpacity}
                                lessonBulletY={lessonBulletY}
                                copyStageThreeOpacity={copyStageThreeOpacity}
                                copyStageThreeY={copyStageThreeY}
                            />
                            <motion.div
                                style={{ opacity: phoneOpacity, y: phoneY }}
                                className="flex justify-center md:justify-end min-h-[620px]"
                            >
                                <div className="w-full max-w-[320px]">
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
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
