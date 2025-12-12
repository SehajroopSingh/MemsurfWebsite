import React from 'react'
import { motion, useTransform, MotionValue } from 'framer-motion'
import { FileText } from 'lucide-react'

// REMOVED TIME-BASED CONSTANTS - We now use scroll progress thresholds (0.0 to 1.0)
// Timings are now percentages of the scroll range allocated to this screen.

type ProcessingScreenProps = {
    progress: MotionValue<number>
}

export default function ProcessingScreen({ progress }: ProcessingScreenProps) {
    // --- HELPER TRANSFORMS ---
    // We map the incoming 0..1 progress to specific animation phases.

    // 1. LABELS
    // Extracting: 0.05 -> 0.25
    const labelDepthOpacity = useTransform(progress, [0.05, 0.1, 0.2, 0.25], [0, 1, 1, 0])
    const labelDepthY = useTransform(progress, [0.05, 0.1, 0.2, 0.25], [-10, 0, 0, -10])

    // Lesson Plan: 0.35 -> 0.65
    const labelLessonOpacity = useTransform(progress, [0.35, 0.4, 0.6, 0.65], [0, 1, 1, 0])
    const labelLessonY = useTransform(progress, [0.35, 0.4, 0.6, 0.65], [-10, 0, 0, -10])

    // Generating Quizzes: 0.70 -> 0.95
    const labelQuizOpacity = useTransform(progress, [0.70, 0.75, 0.95], [0, 1, 1])
    const labelQuizY = useTransform(progress, [0.70, 0.75, 0.95], [-10, 0, 0])


    // 2. PHASE 1: RAW CONTENT (0.0 -> 0.25)
    // Enters, scales up, then morphs/fades out
    const rawContentOpacity = useTransform(progress, [0.0, 0.2, 0.25], [1, 1, 0])
    // Hold static 0.8 until 0.1, then scale up to 1
    const rawContentScale = useTransform(progress, [0.0, 0.1, 0.2, 0.25], [0.8, 0.8, 1, 0.2])


    // 3. PHASE 2: UNIFIED MORPH (0.20 -> 0.35)
    // The "Blob" that appears before splitting
    const unifiedOpacity = useTransform(progress, [0.20, 0.25, 0.35, 0.40], [0, 1, 1, 0])
    const unifiedY = useTransform(progress, [0.20, 0.25, 0.35, 0.40], [12, 0, 0, -8])
    const unifiedScale = useTransform(progress, [0.20, 0.25, 0.35, 0.40], [0.96, 1, 1, 0.98])

    // Unified lines growing
    const getUnifiedLineStats = (i: number) => {
        // Staggered start between 0.20 and 0.30
        const start = 0.20 + (i * 0.015)
        const end = start + 0.05
        return { start, end }
    }


    // 4. PHASE 3: SPLIT & CARDS (0.35 -> 1.0)
    // The main splitting animation

    // Position Separation (0.35 -> 0.50)
    const SPLIT_START_OFFSET = 12
    const SPLIT_GAP = 140

    const splitGroupOpacity = useTransform(progress, [0.35, 0.40], [0, 1])

    // Top Group moves up
    const topGroupY = useTransform(progress, [0.35, 0.50], [-SPLIT_START_OFFSET, -SPLIT_GAP])
    // Bottom Group moves down
    const bottomGroupY = useTransform(progress, [0.35, 0.50], [SPLIT_START_OFFSET, SPLIT_GAP])

    // Card Appearance (Box Shadow/bg) (0.50 -> 0.60)
    const cardBgOpacity = useTransform(progress, [0.50, 0.60], [0, 1])
    const cardBorderColor = useTransform(progress, [0.50, 0.60], ["transparent", "#e5e7eb"])
    const cardShadow = useTransform(progress, [0.50, 0.60], ["none", "0 4px 6px -1px rgba(0, 0, 0, 0.1)"])

    // Header Expansion (0.55 -> 0.65)
    const headerHeight = useTransform(progress, [0.55, 0.65], [0, 28]) // approximate pixel height for auto
    const headerOpacity = useTransform(progress, [0.55, 0.60], [0, 1])
    const headerMb = useTransform(progress, [0.55, 0.65], [0, 8])

    // Content Lines (0.60 -> 0.75)
    // Staggered appearance of the "text" lines inside the cards

    // Extra Details at bottom of card (0.75 -> 0.85)
    const detailsHeight = useTransform(progress, [0.75, 0.85], [0, 20])
    const detailsOpacity = useTransform(progress, [0.75, 0.80], [0, 1])


    // 5. PHASE 4: QUIZZES (0.80 -> 1.0)
    const QUIZ_START_THRESHOLD = 0.80

    return (
        <div className="absolute inset-0 bg-white flex flex-col items-center justify-center overflow-hidden">
            {/* BACKGROUND PATTERN */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

            {/* DYNAMIC LABELS */}
            <div className="absolute top-12 w-full flex justify-center z-50 px-4">
                {/* Label 1: Extraction */}
                <motion.p
                    style={{ opacity: labelDepthOpacity, y: labelDepthY }}
                    className="absolute text-xs font-bold text-blue-600 bg-blue-50/90 backdrop-blur px-4 py-2 rounded-full border border-blue-100 shadow-sm text-center"
                >
                    Extracting content...
                </motion.p>

                {/* Label 2: Lessons */}
                <motion.p
                    style={{ opacity: labelLessonOpacity, y: labelLessonY }}
                    className="text-xs font-bold text-indigo-600 bg-indigo-50/90 backdrop-blur px-4 py-2 rounded-full border border-indigo-100 shadow-sm absolute"
                >
                    Creating Lesson Plan
                </motion.p>

                {/* Label 3: Quizzes */}
                <motion.p
                    style={{ opacity: labelQuizOpacity, y: labelQuizY }}
                    className="text-xs font-bold text-[#8c648d] bg-[#8c648d]/10 backdrop-blur px-4 py-2 rounded-full border border-[#8c648d]/30 shadow-sm absolute"
                >
                    Generating quizzes
                </motion.p>
            </div>

            {/* ANIMATION CONTAINER */}
            <div className="relative w-full h-full flex items-center justify-center">
                {/* PHASE 1: RAW CONTENT (Enters -> Morphs to Strip) */}
                <motion.div
                    style={{ opacity: rawContentOpacity, scale: rawContentScale }}
                    className="absolute flex flex-col items-start justify-start p-4 bg-white rounded-xl shadow-lg border border-gray-200 z-30 w-[205px]"
                >
                    <div className="flex items-center gap-3 mb-3 w-full">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <FileText size={20} />
                        </div>
                        <div>
                            <div className="h-2 w-24 bg-gray-200 rounded-full mb-1" />
                            <div className="h-2 w-16 bg-gray-100 rounded-full" />
                        </div>
                    </div>
                    <div className="space-y-2 w-full">
                        <div className="h-2 w-full bg-gray-100 rounded-full" />
                        <div className="h-2 w-full bg-gray-100 rounded-full" />
                        <div className="h-2 w-3/4 bg-gray-100 rounded-full" />
                    </div>
                </motion.div>


                {/* UNIFIED CONTENT -> LESSON TRANSFORMATION */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">

                    {/* Unified blob before split */}
                    <motion.div
                        style={{ opacity: unifiedOpacity, y: unifiedY, scale: unifiedScale }}
                        className="absolute z-10 flex flex-col items-start gap-1.5 w-[215px] sm:w-[243px]"
                    >
                        {Array.from({ length: 7 }).map((_, i) => {
                            const { start, end } = getUnifiedLineStats(i);
                            // eslint-disable-next-line react-hooks/rules-of-hooks
                            const width = useTransform(progress, [start, end], ["0%", i % 3 === 0 ? "100%" : i % 3 === 1 ? "92%" : "85%"]);
                            // eslint-disable-next-line react-hooks/rules-of-hooks
                            const op = useTransform(progress, [start, end], [0, 1]);

                            return (
                                <motion.div
                                    key={`combined-${i}`}
                                    style={{ opacity: op, width }}
                                    className={`h-1.5 rounded-full ${i % 3 === 0 ? "bg-blue-300 h-2" : "bg-blue-200"}`}
                                />
                            )
                        })}
                    </motion.div>

                    {/* LESSON 1 GROUP (TOP) */}
                    <motion.div
                        style={{ y: topGroupY, opacity: splitGroupOpacity }}
                        className="absolute z-20 flex flex-col items-start gap-1.5 w-[215px] sm:w-[243px]"
                    >
                        {/* THE CARD CONTAINER (Fades in AROUND content) */}
                        <motion.div
                            className="absolute -inset-4 rounded-2xl z-[-1]"
                            style={{
                                backgroundColor: useTransform(cardBgOpacity, o => `rgba(255,255,255,${o})`),
                                boxShadow: cardShadow,
                                borderColor: cardBorderColor,
                                borderWidth: 1,
                                borderStyle: 'solid'
                            }}
                        />

                        {/* HEADER (Expands Card) */}
                        <motion.div
                            style={{ opacity: headerOpacity, height: headerHeight, marginBottom: headerMb }}
                            className="flex items-center gap-2 overflow-hidden w-full"
                        >
                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px] shrink-0">1</div>
                            <div className="h-1.5 w-16 bg-blue-50 rounded-full" />
                        </motion.div>

                        {/* ORIGINAL LINES (The "Content") */}
                        <div className="flex flex-col gap-1.5 w-full pl-2">
                            {Array.from({ length: 6 }).map((_, i) => {
                                // eslint-disable-next-line react-hooks/rules-of-hooks
                                const width = useTransform(progress, [0.60 + (i * 0.02), 0.65 + (i * 0.02)], ["0%", i === 0 || i === 3 ? "100%" : "85%"])
                                // eslint-disable-next-line react-hooks/rules-of-hooks
                                const op = useTransform(progress, [0.60 + (i * 0.02), 0.65 + (i * 0.02)], [0, 1])

                                return (
                                    <React.Fragment key={`top-${i}`}>
                                        <motion.div
                                            style={{ opacity: op, width }}
                                            className={`h-1.5 rounded-full ${i === 0 || i === 3 ? "bg-blue-300 h-2" : "bg-blue-200"}`}
                                        />
                                        {i === 2 && (
                                            <motion.div
                                                className="flex gap-2 justify-start pl-1"
                                                style={{
                                                    opacity: useTransform(progress, [QUIZ_START_THRESHOLD, QUIZ_START_THRESHOLD + 0.05], [0, 1]),
                                                    scale: useTransform(progress, [QUIZ_START_THRESHOLD, QUIZ_START_THRESHOLD + 0.05], [0.5, 1])
                                                }}
                                            >
                                                {[1, 2].map((q, qIndex) => {
                                                    // eslint-disable-next-line react-hooks/rules-of-hooks
                                                    const s = useTransform(progress, [QUIZ_START_THRESHOLD + (qIndex * 0.03), QUIZ_START_THRESHOLD + 0.05 + (qIndex * 0.03)], [0, 1])
                                                    return (
                                                        <motion.div
                                                            key={`top-row1-${q}`}
                                                            style={{ scale: s }}
                                                            className="w-5 h-5 bg-[#8c648d]/20 text-[#8c648d] rounded-full flex items-center justify-center text-[9px] font-bold border border-[#8c648d]/30"
                                                        >
                                                            ?
                                                        </motion.div>
                                                    )
                                                })}
                                            </motion.div>
                                        )}
                                        {i === 4 && (
                                            <motion.div
                                                className="flex gap-2 justify-end pr-1"
                                                style={{
                                                    opacity: useTransform(progress, [QUIZ_START_THRESHOLD + 0.05, QUIZ_START_THRESHOLD + 0.1], [0, 1]),
                                                    scale: useTransform(progress, [QUIZ_START_THRESHOLD + 0.05, QUIZ_START_THRESHOLD + 0.1], [0.5, 1])
                                                }}
                                            >
                                                {[1, 2, 3].map((q, qIndex) => {
                                                    // eslint-disable-next-line react-hooks/rules-of-hooks
                                                    const s = useTransform(progress, [QUIZ_START_THRESHOLD + 0.05 + (qIndex * 0.03), QUIZ_START_THRESHOLD + 0.1 + (qIndex * 0.03)], [0, 1])
                                                    return (
                                                        <motion.div
                                                            key={`top-row2-${q}`}
                                                            style={{ scale: s }}
                                                            className="w-5 h-5 bg-[#8c648d]/20 text-[#8c648d] rounded-full flex items-center justify-center text-[9px] font-bold border border-[#8c648d]/30"
                                                        >
                                                            ?
                                                        </motion.div>
                                                    )
                                                })}
                                            </motion.div>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </div>

                        {/* EXTRA DETAILS (Expands Card) */}
                        <motion.div
                            style={{ opacity: detailsOpacity, height: detailsHeight }}
                            className="w-full flex flex-col gap-1.5 pl-2 overflow-hidden"
                        >
                            <div className="h-1.5 w-[90%] bg-blue-100/80 rounded-full" />
                            <div className="h-1.5 w-[75%] bg-blue-100/80 rounded-full" />
                        </motion.div>
                    </motion.div>


                    {/* LESSON 2 GROUP (BOTTOM) */}
                    <motion.div
                        style={{ y: bottomGroupY, opacity: splitGroupOpacity }}
                        className="absolute z-20 flex flex-col items-start gap-1.5 w-[215px] sm:w-[243px]"
                    >
                        {/* THE CARD CONTAINER */}
                        <motion.div
                            className="absolute -inset-4 rounded-2xl z-[-1]"
                            style={{
                                backgroundColor: useTransform(cardBgOpacity, o => `rgba(255,255,255,${o})`),
                                boxShadow: cardShadow,
                                borderColor: cardBorderColor,
                                borderWidth: 1,
                                borderStyle: 'solid'
                            }}
                        />

                        {/* HEADER */}
                        <motion.div
                            style={{ opacity: headerOpacity, height: headerHeight, marginBottom: headerMb }}
                            className="flex items-center gap-2 overflow-hidden w-full"
                        >
                            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[10px] shrink-0">2</div>
                            <div className="h-1.5 w-16 bg-indigo-50 rounded-full" />
                        </motion.div>

                        {/* ORIGINAL LINES */}
                        <div className="flex flex-col gap-1.5 w-full pl-2">
                            {Array.from({ length: 6 }).map((_, i) => {
                                // eslint-disable-next-line react-hooks/rules-of-hooks
                                const width = useTransform(progress, [0.60 + (i * 0.02), 0.65 + (i * 0.02)], ["0%", i === 0 || i === 3 ? "100%" : "85%"])
                                // eslint-disable-next-line react-hooks/rules-of-hooks
                                const op = useTransform(progress, [0.60 + (i * 0.02), 0.65 + (i * 0.02)], [0, 1])

                                return (
                                    <React.Fragment key={`bottom-${i}`}>
                                        <motion.div
                                            style={{ opacity: op, width }}
                                            className={`h-1.5 rounded-full ${i === 0 || i === 3 ? "bg-indigo-300 h-2" : "bg-indigo-200"}`}
                                        />
                                        {i === 2 && (
                                            <motion.div
                                                className="flex gap-2 justify-end pr-1"
                                                style={{
                                                    opacity: useTransform(progress, [QUIZ_START_THRESHOLD + 0.12, QUIZ_START_THRESHOLD + 0.17], [0, 1]),
                                                    scale: useTransform(progress, [QUIZ_START_THRESHOLD + 0.12, QUIZ_START_THRESHOLD + 0.17], [0.5, 1])
                                                }}
                                            >
                                                {[1, 2].map((q, qIndex) => {
                                                    // eslint-disable-next-line react-hooks/rules-of-hooks
                                                    const s = useTransform(progress, [QUIZ_START_THRESHOLD + 0.12 + (qIndex * 0.03), QUIZ_START_THRESHOLD + 0.17 + (qIndex * 0.03)], [0, 1])
                                                    return (
                                                        <motion.div
                                                            key={`bottom-row1-${q}`}
                                                            style={{ scale: s }}
                                                            className="w-5 h-5 bg-[#8c648d]/20 text-[#8c648d] rounded-full flex items-center justify-center text-[9px] font-bold border border-[#8c648d]/30"
                                                        >
                                                            ?
                                                        </motion.div>
                                                    )
                                                })}
                                            </motion.div>
                                        )}
                                        {i === 4 && (
                                            <motion.div
                                                className="flex gap-2 justify-start pl-1"
                                                style={{
                                                    opacity: useTransform(progress, [QUIZ_START_THRESHOLD + 0.15, QUIZ_START_THRESHOLD + 0.20], [0, 1]),
                                                    scale: useTransform(progress, [QUIZ_START_THRESHOLD + 0.15, QUIZ_START_THRESHOLD + 0.20], [0.5, 1])
                                                }}
                                            >
                                                {[1, 2, 3].map((q, qIndex) => {
                                                    // eslint-disable-next-line react-hooks/rules-of-hooks
                                                    const s = useTransform(progress, [QUIZ_START_THRESHOLD + 0.15 + (qIndex * 0.03), QUIZ_START_THRESHOLD + 0.20 + (qIndex * 0.03)], [0, 1])
                                                    return (
                                                        <motion.div
                                                            key={`bottom-row2-${q}`}
                                                            style={{ scale: s }}
                                                            className="w-5 h-5 bg-[#8c648d]/20 text-[#8c648d] rounded-full flex items-center justify-center text-[9px] font-bold border border-[#8c648d]/30"
                                                        >
                                                            ?
                                                        </motion.div>
                                                    )
                                                })}
                                            </motion.div>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </div>

                        {/* EXTRA DETAILS */}
                        <motion.div
                            style={{ opacity: detailsOpacity, height: detailsHeight }}
                            className="w-full flex flex-col gap-1.5 pl-2 overflow-hidden"
                        >
                            <div className="h-1.5 w-[90%] bg-indigo-100/80 rounded-full" />
                            <div className="h-1.5 w-[75%] bg-indigo-100/80 rounded-full" />
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </div>
    )
}
