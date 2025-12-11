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
                className="flex-1 bg-[#8c648d] rounded-l-[2.5rem] rounded-r-[1.5rem] shadow-sm border border-white/50 p-6 flex flex-col justify-center w-full z-10"
            >
                <div className="max-w-xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300 mb-2">Daily reps</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">
                        Tap Daily Practice to prime.
                    </h2>
                    <p className="text-sm md:text-base text-blue-100/80">
                        See the button slide in—one tap gets you into the flow.
                    </p>
                </div>
            </motion.div>

            {/* Card 2: Lesson View */}
            <motion.div
                style={{ opacity: copyStageTwoOpacity, y: copyStageTwoY }}
                className="flex-1 bg-[#8c648d] rounded-l-[2.5rem] rounded-r-[1.5rem] shadow-sm border border-white/50 p-6 flex flex-col justify-center w-full z-10"
            >
                <div className="max-w-xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300 mb-2">Lesson view</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">
                        Lessons show up for new info.
                    </h2>
                    <p className="text-sm md:text-base text-indigo-100/80">
                        Next lesson slides in automatically so you keep absorbing.
                    </p>
                </div>
            </motion.div>

            {/* Card 3: Quiz Follow-up */}
            <motion.div
                style={{ opacity: copyStageThreeOpacity, y: copyStageThreeY }}
                className="flex-1 bg-[#8c648d] rounded-l-[2.5rem] rounded-r-[1.5rem] shadow-sm border border-white/50 p-6 flex flex-col justify-center w-full z-10"
            >
                <div className="max-w-xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8c648d]/70 mb-2">Quiz follow-up</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">
                        Quizzes for retention.
                    </h2>
                    <p className="text-sm md:text-base text-[#8c648d]/60">
                        Spaced quizzes target fresh material so it sticks.
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
