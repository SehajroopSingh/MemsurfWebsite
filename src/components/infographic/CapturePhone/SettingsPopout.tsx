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
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="absolute top-[18%] left-[-480px] w-[280px] z-50 text-right"
                >
                    <div className="mb-4">
                        <h4 className="text-lg font-bold text-gray-900 leading-tight">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={depthStage}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="block text-blue-600"
                                >
                                    {DEPTH_STATES[depthStage].label} Points
                                </motion.span>
                            </AnimatePresence>
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">Decide how much detail<br />you want to retain.</p>
                    </div>

                    {/* Depth Visualization reused (aligned right) */}
                    <div className="h-[240px] w-full">
                        <DepthVisualization stage={depthStage} />
                    </div>
                </motion.div>

                {/* UNIFIED OVERLAY: Depth, Time & Level Lines (Layered OVER Phone) */}
                <svg className="absolute inset-0 z-50 pointer-events-none overflow-visible">
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

                    {/* Depth Line (Left Button -> Left Pop-out) */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        exit={{ pathLength: 0, opacity: 0 }}
                        transition={{ duration: 1.2, delay: 0, ease: "easeInOut" }}
                        d="M 50 471 L 50 540 L -100 540 L -100 200 L -420 200"
                        fill="none"
                        stroke="url(#line-gradient-left)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Mastery Time Line (Middle Button -> Bottom Text) */}
                    {/* Goes DEEPER to pass under Difficulty line */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        exit={{ pathLength: 0, opacity: 0 }}
                        transition={{ duration: 1.2, delay: 0.2, ease: "easeInOut" }}
                        d="M 150 471 L 150 560 L 380 560 L 380 450 L 400 450"
                        fill="none"
                        stroke="url(#line-gradient-right)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Adaptive Difficulty Line (Right Button -> Top Text) */}
                    {/* Updated: M 250 471 -> Right L 350 471 -> Up L 350 150 -> Right L 400 150 */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        exit={{ pathLength: 0, opacity: 0 }}
                        transition={{ duration: 1.2, delay: 0.4, ease: "easeInOut" }}
                        d="M 250 471 L 350 471 L 350 150 L 400 150"
                        fill="none"
                        stroke="url(#line-gradient-right)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>

                {/* Connector Dots (Absolute on top of SVG start points) */}
                <motion.div
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
                />

                {/* Text Pop-outs (Positioned at end of SVG lines) */}

                {/* Adaptive Difficulty Text (NOW TOP) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.5, delay: 1.6 }}
                    className="absolute top-[120px] left-[400px] w-[280px] z-50 text-left"
                >
                    <h4 className="text-xl font-bold text-blue-600 leading-tight mb-2">
                        Adaptive Difficulty
                    </h4>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={difficultyStage}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-sm text-gray-600"
                        >
                            <p className="font-bold text-gray-900 mb-1">{DIFFICULTY_STATES[difficultyStage].label}</p>
                            <p className="leading-relaxed mb-1">{DIFFICULTY_STATES[difficultyStage].desc}</p>
                            <p className="text-xs text-gray-400">{DIFFICULTY_STATES[difficultyStage].detail}</p>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* Mastery Time Text (NOW BOTTOM) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                    className="absolute top-[420px] left-[400px] w-[260px] z-50 text-left"
                >
                    <h4 className="text-xl font-bold text-blue-600 leading-tight mb-2">
                        Mastery Time
                    </h4>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={timeStage}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-sm text-gray-600"
                        >
                            <p className="font-bold text-gray-900 mb-1">{TIME_STATES[timeStage].label}</p>
                            <p className="leading-relaxed mb-1">{TIME_STATES[timeStage].desc}</p>
                            <p className="text-xs text-gray-400">{TIME_STATES[timeStage].detail}</p>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </>
        </AnimatePresence>
    )
}
