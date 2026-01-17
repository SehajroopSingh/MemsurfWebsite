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
                className="flex-1 bg-[#8c648d] rounded-l-[2.5rem] rounded-r-[1.5rem] shadow-lg border border-white/50 p-6 flex flex-col justify-center w-full z-10"
            >
                <div className="max-w-xl">
                    <p className="hidden md:block text-xs font-semibold uppercase tracking-[0.3em] text-blue-300 mb-2">The Bar Is Low</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">
                        Your Only Job is to Tap.
                    </h2>
                    <p className="text-sm md:text-base text-blue-100/80">
                        We prepped the lesson. We organized the quiz. If you can&apos;t manage this, we can&apos;t help you. (Kidding, we can).
                    </p>
                </div>
            </motion.div>

            {/* Card 2: Lesson View */}
            <motion.div
                style={{ opacity: copyStageTwoOpacity, y: copyStageTwoY, backgroundColor: 'transparent' }}
                className="flex-1 border-[6px] border-[#8c648d] rounded-[2.5rem] shadow-lg p-6 flex flex-col justify-center w-full z-10"
            >
                <div className="max-w-xl">
                    <p className="hidden md:block text-xs font-semibold uppercase tracking-[0.3em] text-[#8c648d] mb-2">Spoon-Fed Wisdom</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#8c648d] leading-tight mb-2">
                        We Read It So You Don&apos;t Have To.
                    </h2>
                    <p className="text-sm md:text-base text-gray-700">
                        No planning. No &quot;strategy&quot;. Just sit down and let the knowledge wash over you. Maximum output, minimum effort.
                    </p>
                </div>
            </motion.div>

            {/* Card 3: Quiz Follow-up */}
            <motion.div
                style={{ opacity: copyStageThreeOpacity, y: copyStageThreeY }}
                className="flex-1 bg-[#8c648d] rounded-l-[2.5rem] rounded-r-[1.5rem] shadow-lg border border-white/50 p-6 flex flex-col justify-center w-full z-10"
            >
                <div className="max-w-xl">
                    <p className="hidden md:block text-xs font-semibold uppercase tracking-[0.3em] text-purple-200 mb-2">The Ghost of Lessons Past</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">
                        We Will Haunt You With Knowledge.
                    </h2>
                    <p className="text-sm md:text-base text-purple-100">
                        We bring back things you learned weeks ago, right before they slip into the void of forgetfulness. It&apos;s annoying, but it works.
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
