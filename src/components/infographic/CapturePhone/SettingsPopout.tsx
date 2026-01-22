'use client'

import { motion, AnimatePresence } from 'framer-motion'
import DepthVisualization from '../DepthVisualization'
import { DEPTH_STATES, DIFFICULTY_STATES, TIME_STATES } from '../constants'

type SettingsPopoutProps = {
    show: boolean
    depthStage: number
    difficultyStage: number
    timeStage: number
}

export default function SettingsPopout({
    show,
    depthStage,
    difficultyStage,
    timeStage
}: SettingsPopoutProps) {
    if (!show) return null

    return (
        <AnimatePresence>
            <>
                {/* Pop-out Content (No Card Background) */}
                {/* DEPTH - NOW BOTTOM RIGHT */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="absolute top-[270px] left-[325px] w-[280px] z-50 text-left"
                >
                    <div className="mb-4">
                        <h4 className="text-xl font-bold text-white leading-tight">
                            Depth
                        </h4>
                        <p className="text-sm text-white/90 mt-2">Choose how much detail you want to retain.</p>
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={depthStage}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-sm font-medium text-white mt-2"
                            >
                                {DEPTH_STATES[depthStage].label} Points
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    {/* Depth Visualization reused (aligned right) */}
                    <div className="h-[185px] w-full overflow-hidden">
                        <DepthVisualization stage={depthStage} />
                    </div>
                </motion.div>

                {/* UNIFIED OVERLAY: Depth, Time & Level Lines (Layered OVER Phone) */}
                {/* <svg className="absolute inset-0 z-50 pointer-events-none overflow-visible">
                    <defs>
                        <linearGradient id="line-gradient-right" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#93C5FD" />
                            <stop offset="100%" stopColor="#3B82F6" />
                        </linearGradient>
                        <linearGradient id="line-gradient-left" x1="100%" y1="0%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="#93C5FD" />
                            <stop offset="100%" stopColor="#3B82F6" />
                        </linearGradient>
                    </defs>

                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        exit={{ pathLength: 0, opacity: 0 }}
                        transition={{ duration: 1.2, delay: 0, ease: "easeInOut" }}
                        d="M 50 471 L 50 550 L 380 550 L 380 380 L 400 380"
                        fill="none"
                        stroke="url(#line-gradient-right)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        exit={{ pathLength: 0, opacity: 0 }}
                        transition={{ duration: 1.2, delay: 0.2, ease: "easeInOut" }}
                        d="M 150 471 L 150 520 L 360 520 L 360 210 L 400 210"
                        fill="none"
                        stroke="url(#line-gradient-right)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        exit={{ pathLength: 0, opacity: 0 }}
                        transition={{ duration: 1.2, delay: 0.4, ease: "easeInOut" }}
                        d="M 250 471 L 340 471 L 340 40 L 400 40"
                        fill="none"
                        stroke="url(#line-gradient-right)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg> */}

                {/* Connector Dots (Absolute on top of SVG start points) */}
                {/* <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.3, delay: 0 }}
                    className="absolute top-[465px] left-[44px] w-3 h-3 rounded-full bg-blue-300 z-50 ring-4 ring-blue-50"
                />
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="absolute top-[465px] left-[144px] w-3 h-3 rounded-full bg-blue-300 z-50 ring-4 ring-blue-50"
                />
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="absolute top-[465px] left-[244px] w-3 h-3 rounded-full bg-blue-300 z-50 ring-4 ring-blue-50"
                /> */}

                {/* Text Pop-outs (Positioned at end of SVG lines) */}

                {/* Adaptive Difficulty Text (NOW TOP) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.5, delay: 1.6 }}
                    className="absolute top-[5px] left-[325px] w-[280px] z-50 text-left"
                >
                    <h4 className="text-xl font-bold text-white leading-tight mb-3">
                        Quiz Difficulty
                    </h4>
                    <p className="text-sm text-white/90 mb-3">Choose quiz difficulty levels.</p>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={difficultyStage}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-sm"
                        >
                            <p className="font-bold text-white leading-relaxed">{DIFFICULTY_STATES[difficultyStage].label} - {DIFFICULTY_STATES[difficultyStage].desc}</p>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* Mastery Time Text (NOW MIDDLE) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                    className="absolute top-[130px] left-[325px] w-[260px] z-50 text-left"
                >
                    <h4 className="text-xl font-bold text-white leading-tight mb-3">
                        Mastery Time
                    </h4>
                    <p className="text-sm text-white/90 mb-3">Master the material by?</p>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={timeStage}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-sm"
                        >
                            <p className="font-bold text-white mb-2">{TIME_STATES[timeStage].label}</p>
                            <p className="leading-relaxed mb-1 text-white/90">{TIME_STATES[timeStage].desc}</p>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </>
        </AnimatePresence>
    )
}
