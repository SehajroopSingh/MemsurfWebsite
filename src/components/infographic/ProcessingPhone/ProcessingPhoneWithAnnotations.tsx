import { motion, useTransform, MotionValue } from 'framer-motion'
import PhoneScreen from '../PhoneScreen'
import ProcessingScreen from '../ProcessingScreen'

type ProcessingPhoneWithAnnotationsProps = {
    progress: MotionValue<number>
}

export default function ProcessingPhoneWithAnnotations({ progress }: ProcessingPhoneWithAnnotationsProps) {
    // Annotation Timings
    // 1. Extract: 0.05 -> 0.15 (Fade in)
    const bullet1Opacity = useTransform(progress, [0.05, 0.15], [0, 1])
    const bullet1Y = useTransform(progress, [0.05, 0.15], [10, 0])

    const connector1Opacity = useTransform(progress, [0.15, 0.20], [0, 1])
    const connector1Y = useTransform(progress, [0.15, 0.20], [4, 0])

    // 2. Build Lesson: 0.35 -> 0.45
    const bullet2Opacity = useTransform(progress, [0.35, 0.45], [0, 1])
    const bullet2Y = useTransform(progress, [0.35, 0.45], [10, 0])

    const connector2Opacity = useTransform(progress, [0.45, 0.50], [0, 1])
    const connector2Y = useTransform(progress, [0.45, 0.50], [4, 0])

    // 3. Generate Quizzes: 0.70 -> 0.80
    const bullet3Opacity = useTransform(progress, [0.70, 0.80], [0, 1])
    const bullet3Y = useTransform(progress, [0.70, 0.80], [10, 0])

    return (
        <div className="relative flex items-center w-full z-30">
            <div className="flex-shrink-0 relative w-[280px]">
                <PhoneScreen>
                    <ProcessingScreen progress={progress} />
                </PhoneScreen>
            </div>

            {/* Processing annotations anchored outside the phone */}
            <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-[calc(280px+1rem)] z-40 flex flex-col gap-2 items-start max-w-[260px] text-gray-800 text-sm sm:text-base leading-relaxed">

                {/* Bullet 1 */}
                <motion.div
                    className="relative text-left"
                    style={{ opacity: bullet1Opacity, y: bullet1Y }}
                >
                    <span className="absolute right-full top-[16px] mr-4 w-16 h-px bg-white/60" />
                    <span className="absolute right-full top-[16px] mr-[4.75rem] w-2 h-2 rounded-full bg-white" />
                    <p className="font-semibold text-lg sm:text-xl uppercase tracking-wide text-white">Extract relevant content</p>
                    <p className="leading-relaxed mt-1 text-white/70 text-sm sm:text-base">
                        The agent analyzes raw input, extracting key insights based on depth and context to identify what matters.
                    </p>
                </motion.div>

                <motion.div
                    style={{ opacity: connector1Opacity, y: connector1Y }}
                    className="flex flex-col items-center self-stretch"
                >
                    <div className="w-[1px] h-6 bg-white/40" />
                    <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-t-white/40 border-l-transparent border-r-transparent" />
                </motion.div>

                {/* Bullet 2 */}
                <motion.div
                    className="relative text-left"
                    style={{ opacity: bullet2Opacity, y: bullet2Y }}
                >
                    <span className="absolute right-full top-[16px] mr-4 w-16 h-px bg-white/60" />
                    <span className="absolute right-full top-[16px] mr-[4.75rem] w-2 h-2 rounded-full bg-white" />
                    <p className="font-semibold text-lg sm:text-xl uppercase tracking-wide text-white">Build lesson plan and modules</p>
                    <p className="leading-relaxed mt-1 text-white/70 text-sm sm:text-base">
                        It organizes this content into a structured lesson plan, breaking complex topics into clear, digestible modules.
                    </p>
                </motion.div>

                <motion.div
                    style={{ opacity: connector2Opacity, y: connector2Y }}
                    className="flex flex-col items-center self-stretch"
                >
                    <div className="w-[1px] h-6 bg-white/40" />
                    <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-t-white/40 border-l-transparent border-r-transparent" />
                </motion.div>

                {/* Bullet 3 */}
                <motion.div
                    className="relative text-left"
                    style={{ opacity: bullet3Opacity, y: bullet3Y }}
                >
                    <span className="absolute right-full top-[16px] mr-4 w-16 h-px bg-white/60" />
                    <span className="absolute right-full top-[16px] mr-[4.75rem] w-2 h-2 rounded-full bg-white" />
                    <p className="font-semibold text-lg sm:text-xl uppercase tracking-wide text-white">Generate quizzes</p>
                    <p className="leading-relaxed mt-1 text-white/70 text-sm sm:text-base">
                        Finally, it generates targeted quizzes to test your understanding and reinforce the learning objectives.
                    </p>
                </motion.div>
            </div>
        </div>
    )
}




