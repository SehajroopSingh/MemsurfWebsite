'use client'

import { motion, MotionValue } from 'framer-motion'

type PracticeScrollCopyProps = {
    copyStageOneOpacity: MotionValue<number>
    copyStageOneY: MotionValue<number>
    copyStageTwoOpacity: MotionValue<number>
    copyStageTwoY: MotionValue<number>
    copyStageThreeOpacity: MotionValue<number>
    copyStageThreeY: MotionValue<number>
}

export default function PracticeScrollCopy({
    copyStageOneOpacity,
    copyStageOneY,
    copyStageTwoOpacity,
    copyStageTwoY,
    copyStageThreeOpacity,
    copyStageThreeY
}: PracticeScrollCopyProps) {
    return (
        <div className="relative h-[540px] flex flex-col gap-4 w-full">
            {/* Card 1: Daily Practice */}
            <motion.div
                style={{ opacity: copyStageOneOpacity, y: copyStageOneY }}
                className="flex-1 bg-app-surface rounded-[2.5rem] shadow-[0_16px_48px_rgba(0,0,0,0.08)] border border-app-border p-6 flex flex-col justify-center w-full z-10"
            >
                <div className="mx-auto max-w-xl text-center md:mx-0 md:text-left">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-app-textMuted mb-2">Built Around Your Rhythm</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-app-text leading-tight mb-2">
                        The Right Practice, Right Now.
                    </h2>
                    <p className="text-sm md:text-base text-app-textMuted">
                        Your next lesson or quiz is already waiting, so a few spare minutes can turn into focused practice without deciding what to do next.
                    </p>
                </div>
            </motion.div>

            {/* Card 2: Lesson View */}
            <motion.div
                style={{ opacity: copyStageTwoOpacity, y: copyStageTwoY }}
                className="flex-1 border border-app-border rounded-[2.5rem] shadow-[0_16px_48px_rgba(0,0,0,0.08)] p-6 flex flex-col justify-center w-full z-10 bg-app-surface"
            >
                <div className="mx-auto max-w-xl text-center md:mx-0 md:text-left">
                    <p className="hidden md:block text-xs font-semibold uppercase tracking-[0.3em] text-app-textMuted mb-2">Focused Lessons</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-app-text leading-tight mb-2">
                        Learn What Matters.
                    </h2>
                    <p className="text-sm md:text-base text-app-textMuted">
                        Your agent turns your material into short lessons around the ideas most worth understanding, so you can make progress without digging through everything yourself.
                    </p>
                </div>
            </motion.div>

            {/* Card 3: Quiz Follow-up */}
            <motion.div
                style={{ opacity: copyStageThreeOpacity, y: copyStageThreeY }}
                className="flex-1 bg-app-surface rounded-[2.5rem] shadow-[0_16px_48px_rgba(0,0,0,0.08)] border border-app-border p-6 flex flex-col justify-center w-full z-10"
            >
                <div className="mx-auto max-w-xl text-center md:mx-0 md:text-left">
                    <p className="hidden md:block text-xs font-semibold uppercase tracking-[0.3em] text-app-textMuted mb-2">Adaptive Quizzes</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-app-text leading-tight mb-2">
                        Harder When You&apos;re Ready.
                    </h2>
                    <p className="text-sm md:text-base text-app-textMuted">
                        Questions start simple, then get more advanced as your answers improve, helping you build from recall to real understanding.
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
