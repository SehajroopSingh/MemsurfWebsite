import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText } from 'lucide-react'

const COMBINED_DELAY = 1.2
const COMBINED_DURATION = 4.0
const SPLIT_DELAY = COMBINED_DELAY + 3.0
const SPLIT_DURATION = 4.2
const SPLIT_GAP = 140
const SPLIT_START_OFFSET = 12
const CARD_DELAY = SPLIT_DELAY + 1.6
const CARD_SETTLE_DELAY = SPLIT_DELAY + SPLIT_DURATION
const QUESTIONS_START_DELAY = CARD_SETTLE_DELAY + 0.5
const QUESTION_ROW_STAGGER = 0.18
const BULLET_ONE_DELAY = 0.6
const BULLET_TWO_DELAY = SPLIT_DELAY + 0.4
const BULLET_THREE_DELAY = QUESTIONS_START_DELAY

export const PROCESSING_TIMINGS = {
    COMBINED_DELAY,
    COMBINED_DURATION,
    SPLIT_DELAY,
    SPLIT_DURATION,
    SPLIT_GAP,
    SPLIT_START_OFFSET,
    CARD_DELAY,
    CARD_SETTLE_DELAY,
    QUESTIONS_START_DELAY,
    QUESTION_ROW_STAGGER,
    BULLET_ONE_DELAY,
    BULLET_TWO_DELAY,
    BULLET_THREE_DELAY,
}

export default function ProcessingScreen() {
    return (
        <div className="absolute inset-0 bg-white flex flex-col items-center justify-center overflow-hidden">
            {/* BACKGROUND PATTERN */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

            {/* DYNAMIC LABELS */}
            <div className="absolute top-12 w-full flex justify-center z-50 px-4">
                <AnimatePresence mode="wait">
                    {/* Label 1: Extraction */}
                    <motion.p
                        key="label-depth"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: [0, 1, 1, 0], y: [-10, 0, 0, -10] }}
                        transition={{ duration: 4, times: [0, 0.1, 0.9, 1], delay: 0.5 }}
                        className="text-xs font-bold text-blue-600 bg-blue-50/90 backdrop-blur px-4 py-2 rounded-full border border-blue-100 shadow-sm text-center"
                    >
                        Extracting content...
                    </motion.p>

                    {/* Label 2: Lessons */}
                    <motion.p
                        key="label-lesson"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: [0, 1, 1, 0], y: [-10, 0, 0, -10] }}
                        transition={{ duration: QUESTIONS_START_DELAY - 4.5, times: [0, 0.1, 0.85, 1], delay: 4.5 }}
                        className="text-xs font-bold text-indigo-600 bg-indigo-50/90 backdrop-blur px-4 py-2 rounded-full border border-indigo-100 shadow-sm absolute"
                    >
                        Creating Lesson Plan
                    </motion.p>

                    {/* Label 3: Quizzes */}
                    <motion.p
                        key="label-quiz"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: [0, 1, 1], y: [-10, 0, 0] }}
                        transition={{ duration: 3, times: [0, 0.12, 1], delay: QUESTIONS_START_DELAY }}
                        className="text-xs font-bold text-purple-700 bg-purple-50/90 backdrop-blur px-4 py-2 rounded-full border border-purple-100 shadow-sm absolute"
                    >
                        Generating quizzes
                    </motion.p>
                </AnimatePresence>
            </div>

            {/* ANIMATION CONTAINER */}
            <div className="relative w-full h-full flex items-center justify-center">
                {/* PHASE 1: RAW CONTENT (Enters -> Morphs to Strip) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 0.2] }}
                    transition={{ duration: 2.0, delay: 0, times: [0, 0.25, 0.85, 1], ease: "easeInOut" }}
                    className="absolute flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-lg border border-gray-100 z-30"
                >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                        <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="h-2 w-16 bg-gray-200 rounded-full mb-1" />
                    <div className="h-2 w-12 bg-gray-200 rounded-full" />
                </motion.div>


                {/* UNIFIED CONTENT -> LESSON TRANSFORMATION */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">

                    {/* Unified blob before split */}
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: [0, 1, 1, 0], y: [12, 0, 0, -8], scale: [0.96, 1, 1, 0.98] }}
                        transition={{ duration: COMBINED_DURATION, times: [0, 0.25, 0.8, 1], delay: COMBINED_DELAY }}
                        className="absolute z-10 flex flex-col items-start gap-1.5 w-[230px] sm:w-[260px]"
                    >
                        {Array.from({ length: 7 }).map((_, i) => (
                            <motion.div
                                key={`combined-${i}`}
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: i % 3 === 0 ? "100%" : i % 3 === 1 ? "92%" : "85%" }}
                                transition={{ delay: COMBINED_DELAY + (i * 0.08), duration: 0.32 }}
                                className={`h-1.5 rounded-full ${i % 3 === 0 ? "bg-blue-300 h-2" : "bg-blue-200"}`}
                            />
                        ))}
                    </motion.div>

                    {/* LESSON 1 GROUP (TOP) */}
                    <motion.div
                        initial={{ y: -SPLIT_START_OFFSET, opacity: 0 }}
                        animate={{ opacity: [0, 1, 1], y: [-SPLIT_START_OFFSET, -SPLIT_START_OFFSET, -SPLIT_GAP] }}
                        transition={{ duration: SPLIT_DURATION, times: [0, 0.35, 1], delay: SPLIT_DELAY }}
                        className="absolute z-20 flex flex-col items-start gap-1.5 w-[230px] sm:w-[260px]"
                    >
                        {/* THE CARD CONTAINER (Fades in AROUND content) */}
                        <motion.div
                            className="absolute -inset-4 rounded-2xl z-[-1]"
                            initial={{ backgroundColor: "rgba(255,255,255,0)", boxShadow: "none", border: "1px solid transparent" }}
                            animate={{ backgroundColor: "rgba(255,255,255,1)", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", border: "1px solid #e5e7eb" }}
                            transition={{ delay: CARD_DELAY, duration: 0.5 }}
                        />

                        {/* HEADER (Expands Card) */}
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
                            transition={{ delay: CARD_DELAY + 0.4, duration: 0.35 }}
                            className="flex items-center gap-2 overflow-hidden w-full"
                        >
                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px] shrink-0">1</div>
                            <div className="h-1.5 w-16 bg-blue-50 rounded-full" />
                        </motion.div>

                        {/* ORIGINAL LINES (The "Content") */}
                        <div className="flex flex-col gap-1.5 w-full pl-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <React.Fragment key={`top-${i}`}>
                                    <motion.div
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: i === 0 || i === 3 ? "100%" : "85%" }}
                                        transition={{ delay: SPLIT_DELAY + 0.2 + (i * 0.1), duration: 0.35 }}
                                        className={`h-1.5 rounded-full ${i === 0 || i === 3 ? "bg-blue-300 h-2" : "bg-blue-200"}`}
                                    />
                                    {i === 2 && (
                                        <motion.div
                                            className="flex gap-2 justify-start pl-1"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: QUESTIONS_START_DELAY, duration: 0.3 }}
                                        >
                                            {[1, 2].map((q, qIndex) => (
                                                <motion.div
                                                    key={`top-row1-${q}`}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: QUESTIONS_START_DELAY + (qIndex * 0.12), type: "spring", stiffness: 200, damping: 15 }}
                                                    className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[9px] font-bold border border-purple-200"
                                                >
                                                    ?
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                    {i === 4 && (
                                        <motion.div
                                            className="flex gap-2 justify-end pr-1"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: QUESTIONS_START_DELAY + QUESTION_ROW_STAGGER, duration: 0.3 }}
                                        >
                                            {[1, 2, 3].map((q, qIndex) => (
                                                <motion.div
                                                    key={`top-row2-${q}`}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: QUESTIONS_START_DELAY + QUESTION_ROW_STAGGER + (qIndex * 0.12), type: "spring", stiffness: 200, damping: 15 }}
                                                    className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[9px] font-bold border border-purple-200"
                                                >
                                                    ?
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* EXTRA DETAILS (Expands Card) */}
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ delay: CARD_DELAY + 0.9, duration: 0.4 }}
                            className="w-full flex flex-col gap-1.5 pl-2"
                        >
                            <div className="h-1.5 w-[90%] bg-blue-100/80 rounded-full" />
                            <div className="h-1.5 w-[75%] bg-blue-100/80 rounded-full" />
                        </motion.div>
                    </motion.div>


                    {/* LESSON 2 GROUP (BOTTOM) */}
                    <motion.div
                        initial={{ y: SPLIT_START_OFFSET, opacity: 0 }}
                        animate={{ opacity: [0, 1, 1], y: [SPLIT_START_OFFSET, SPLIT_START_OFFSET, SPLIT_GAP] }}
                        transition={{ duration: SPLIT_DURATION, times: [0, 0.35, 1], delay: SPLIT_DELAY }}
                        className="absolute z-20 flex flex-col items-start gap-1.5 w-[230px] sm:w-[260px]"
                    >
                        {/* THE CARD CONTAINER */}
                        <motion.div
                            className="absolute -inset-4 rounded-2xl z-[-1]"
                            initial={{ backgroundColor: "rgba(255,255,255,0)", boxShadow: "none", border: "1px solid transparent" }}
                            animate={{ backgroundColor: "rgba(255,255,255,1)", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", border: "1px solid #e5e7eb" }}
                            transition={{ delay: CARD_DELAY, duration: 0.5 }}
                        />

                        {/* HEADER */}
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
                            transition={{ delay: CARD_DELAY + 0.4, duration: 0.35 }}
                            className="flex items-center gap-2 overflow-hidden w-full"
                        >
                            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[10px] shrink-0">2</div>
                            <div className="h-1.5 w-16 bg-indigo-50 rounded-full" />
                        </motion.div>

                        {/* ORIGINAL LINES */}
                        <div className="flex flex-col gap-1.5 w-full pl-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <React.Fragment key={`bottom-${i}`}>
                                    <motion.div
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: i === 0 || i === 3 ? "100%" : "85%" }}
                                        transition={{ delay: SPLIT_DELAY + 0.2 + (i * 0.1), duration: 0.35 }}
                                        className={`h-1.5 rounded-full ${i === 0 || i === 3 ? "bg-indigo-300 h-2" : "bg-indigo-200"}`}
                                    />
                                    {i === 2 && (
                                        <motion.div
                                            className="flex gap-2 justify-end pr-1"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: QUESTIONS_START_DELAY + 0.12, duration: 0.3 }}
                                        >
                                            {[1, 2].map((q, qIndex) => (
                                                <motion.div
                                                    key={`bottom-row1-${q}`}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: QUESTIONS_START_DELAY + 0.12 + (qIndex * 0.12), type: "spring", stiffness: 200, damping: 15 }}
                                                    className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[9px] font-bold border border-purple-200"
                                                >
                                                    ?
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                    {i === 4 && (
                                        <motion.div
                                            className="flex gap-2 justify-start pl-1"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: QUESTIONS_START_DELAY + QUESTION_ROW_STAGGER + 0.12, duration: 0.3 }}
                                        >
                                            {[1, 2, 3].map((q, qIndex) => (
                                                <motion.div
                                                    key={`bottom-row2-${q}`}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: QUESTIONS_START_DELAY + QUESTION_ROW_STAGGER + 0.12 + (qIndex * 0.12), type: "spring", stiffness: 200, damping: 15 }}
                                                    className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[9px] font-bold border border-purple-200"
                                                >
                                                    ?
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* EXTRA DETAILS */}
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ delay: CARD_DELAY + 0.9, duration: 0.4 }}
                            className="w-full flex flex-col gap-1.5 pl-2"
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
