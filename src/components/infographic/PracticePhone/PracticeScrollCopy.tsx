'use client'

import { motion, MotionValue } from 'framer-motion'

type PracticeScrollCopyProps = {
    copyStageOneOpacity: MotionValue<number>
    copyStageOneY: MotionValue<number>
    copyStageTwoOpacity: MotionValue<number>
    copyStageTwoY: MotionValue<number>
    copyStageTwoX: MotionValue<number>
    lessonBulletOpacity: MotionValue<number>
    lessonBulletY: MotionValue<number>
    copyStageThreeOpacity: MotionValue<number>
    copyStageThreeY: MotionValue<number>
}

export default function PracticeScrollCopy({
    copyStageOneOpacity,
    copyStageOneY,
    copyStageTwoOpacity,
    copyStageTwoY,
    copyStageTwoX,
    lessonBulletOpacity,
    lessonBulletY,
    copyStageThreeOpacity,
    copyStageThreeY
}: PracticeScrollCopyProps) {
    return (
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
    )
}

