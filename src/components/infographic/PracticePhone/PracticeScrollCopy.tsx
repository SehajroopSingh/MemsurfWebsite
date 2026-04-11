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
                className="flex-1 bg-app-surfaceElevated rounded-l-[2.5rem] rounded-r-[1.5rem] shadow-lg border border-app-border border-l-4 border-l-app-mint/55 p-6 flex flex-col justify-center w-full z-10 ring-1 ring-app-softBlue/15"
            >
                <div className="max-w-xl">
                    <p className="hidden md:block text-xs font-semibold uppercase tracking-[0.3em] text-app-mint mb-2">The Bar Is Low</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-app-text leading-tight mb-2">
                        Your Only Job is to Tap.
                    </h2>
                    <p className="text-sm md:text-base text-app-textMuted">
                        We prepped the lesson. We organized the quiz. If you can&apos;t manage this, we can&apos;t help you. (Kidding, we can).
                    </p>
                </div>
            </motion.div>

            {/* Card 2: Lesson View */}
            <motion.div
                style={{ opacity: copyStageTwoOpacity, y: copyStageTwoY, backgroundColor: 'transparent' }}
                className="flex-1 border-[6px] border-app-lavender/45 rounded-[2.5rem] shadow-lg p-6 flex flex-col justify-center w-full z-10 bg-gradient-to-br from-app-lavender/12 via-app-surface/70 to-app-softBlue/10 backdrop-blur-sm ring-2 ring-app-mint/20"
            >
                <div className="max-w-xl">
                    <p className="hidden md:block text-xs font-semibold uppercase tracking-[0.3em] text-app-blueBright mb-2">Spoon-Fed Wisdom</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-app-text leading-tight mb-2">
                        We Read It So You Don&apos;t Have To.
                    </h2>
                    <p className="text-sm md:text-base text-app-textMuted">
                        No planning. No &quot;strategy&quot;. Just sit down and let the knowledge wash over you. Maximum output, minimum effort.
                    </p>
                </div>
            </motion.div>

            {/* Card 3: Quiz Follow-up */}
            <motion.div
                style={{ opacity: copyStageThreeOpacity, y: copyStageThreeY }}
                className="flex-1 bg-app-surfaceElevated rounded-l-[2.5rem] rounded-r-[1.5rem] shadow-lg border border-app-border border-r-4 border-r-app-lavender/45 p-6 flex flex-col justify-center w-full z-10 ring-1 ring-app-lilac/20"
            >
                <div className="max-w-xl">
                    <p className="hidden md:block text-xs font-semibold uppercase tracking-[0.3em] text-app-lilac mb-2">The Ghost of Lessons Past</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-app-text leading-tight mb-2">
                        We Will Haunt You With Knowledge.
                    </h2>
                    <p className="text-sm md:text-base text-app-textMuted">
                        We bring back things you learned weeks ago, right before they slip into the void of forgetfulness. It&apos;s annoying, but it works.
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
