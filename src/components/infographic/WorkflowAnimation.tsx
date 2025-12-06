'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PhoneScreen from './PhoneScreen'
import FlyingIcon from './FlyingIcon'
import DepthVisualization from './DepthVisualization'
import ProcessingScreen, { PROCESSING_TIMINGS } from './ProcessingScreen'
import { steps, DEPTH_STATES, TIME_STATES, DIFFICULTY_STATES } from './constants'

export default function WorkflowAnimation() {
    const [activeStep, setActiveStep] = useState(0)
    const [capturedItems, setCapturedItems] = useState<typeof steps>([])
    const [depthStage, setDepthStage] = useState(0)
    const [difficultyStage, setDifficultyStage] = useState(0)
    const [timeStage, setTimeStage] = useState(0)
    const [contextText, setContextText] = useState("")
    const [showProcessingPhone, setShowProcessingPhone] = useState(false)
    const { BULLET_ONE_DELAY, BULLET_TWO_DELAY, BULLET_THREE_DELAY } = PROCESSING_TIMINGS

    // 'capturing' -> 'combining' -> 'condensing' -> 'context' -> 'settings' -> 'flash' -> 'processing'
    const [animationStage, setAnimationStage] = useState<'capturing' | 'combining' | 'condensing' | 'context' | 'settings' | 'flash' | 'processing'>('capturing')

    // Capture Loop & Animation Manager
    useEffect(() => {
        let isRunning = true
        const runLoop = async () => {
            while (isRunning) {
                // Capture Items
                setAnimationStage('capturing')
                for (let i = 1; i <= steps.length; i++) {
                    setActiveStep(i)
                    await new Promise(r => setTimeout(r, 1200))
                }
                setActiveStep(0)

                await new Promise(r => setTimeout(r, 300))

                setAnimationStage('combining')
                await new Promise(r => setTimeout(r, 600))

                setAnimationStage('condensing')
                await new Promise(r => setTimeout(r, 1500)) // Move to top and pause briefly

                setAnimationStage('context')
                await new Promise(r => setTimeout(r, 500)) // Wait before typing

                // Typing Animation
                const textToType = "Focus on X, I want to learn Y content more deeply over time, build from the ground up."
                for (let i = 0; i <= textToType.length; i++) {
                    setContextText(textToType.slice(0, i))
                    await new Promise(r => setTimeout(r, 20 + Math.random() * 10)) // Typing speed
                }

                await new Promise(r => setTimeout(r, 2000)) // Hold text

                setAnimationStage('settings')
                await new Promise(r => setTimeout(r, 9000)) // Show settings and depth pop-out

                setAnimationStage('flash')
                await new Promise(r => setTimeout(r, 300)) // Quick flash

                setAnimationStage('processing')
                isRunning = false // Stop loop
            }
        }
        runLoop()

        return () => { isRunning = false }
    }, [])

    // Add Item Logic (Synced with activeStep)
    useEffect(() => {
        if (activeStep > 0 && animationStage === 'capturing') {
            const item = steps[activeStep - 1]
            const timer = setTimeout(() => {
                setCapturedItems(prev => [item, ...prev].slice(0, 4))
            }, 600)
            return () => clearTimeout(timer)
        }
    }, [activeStep, animationStage])

    // Cycle Settings States
    useEffect(() => {
        let depthInterval: NodeJS.Timeout
        let difficultyInterval: NodeJS.Timeout
        let timeInterval: NodeJS.Timeout

        if (animationStage === 'settings') {
            setDepthStage(0)
            setDifficultyStage(0)
            setTimeStage(0)

            // Staggered start to create organic feel
            depthInterval = setInterval(() => {
                setDepthStage(prev => (prev + 1) % 3)
            }, 3000)

            setTimeout(() => {
                difficultyInterval = setInterval(() => {
                    setDifficultyStage(prev => (prev + 1) % 3)
                }, 3000)
            }, 800)

            setTimeout(() => {
                timeInterval = setInterval(() => {
                    setTimeStage(prev => (prev + 1) % 3)
                }, 3000)
            }, 1600)

        } else {
            setDepthStage(0)
            setDifficultyStage(0)
            setTimeStage(0)
        }

        return () => {
            clearInterval(depthInterval)
            clearInterval(difficultyInterval)
            clearInterval(timeInterval)
        }
    }, [animationStage])

    useEffect(() => {
        let timer: NodeJS.Timeout | null = null

        if (animationStage === 'processing') {
            timer = setTimeout(() => setShowProcessingPhone(true), 800) // wait for phone 1 slide
        } else {
            setShowProcessingPhone(false)
        }

        return () => {
            if (timer) clearTimeout(timer)
        }
    }, [animationStage])

    return (
        <div className="w-full flex flex-col items-center">
            <div className="relative w-full max-w-7xl mx-auto h-[600px] flex items-center justify-center mt-72">
                {/* Flash Overlay */}
                <AnimatePresence>
                    {animationStage === 'flash' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-white z-[100] pointer-events-none"
                        />
                    )}
                </AnimatePresence>

                {/* Phone 1: Capture (Moves Left) */}
                <motion.div
                    animate={{
                        x: animationStage === 'processing' ? -310 : 0,
                        opacity: 1
                    }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                    className="absolute flex items-center justify-center w-[300px] z-30 overflow-visible"
                >
                    {/* Flying Icons */}
                    <motion.div className="absolute inset-0 overflow-visible pointer-events-none">
                        <AnimatePresence>
                            {activeStep > 0 && animationStage === 'capturing' && (
                                <FlyingIcon key={activeStep} data={steps[activeStep - 1]} />
                            )}
                        </AnimatePresence>
                        {/* Static Sources */}
                        {steps.map((step, i) => (
                            <div
                                key={i}
                                className={`absolute hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm text-sm font-medium text-gray-400 transition-opacity duration-500
                   ${activeStep === i + 1 ? 'opacity-0' : 'opacity-100'}
                `}
                                style={{
                                    top: step.position.top,
                                    left: step.position.left,
                                    transform: step.position.x ? `translateX(${step.position.x})` : 'none'
                                }}
                            >
                                <div className="grayscale opacity-50 scale-75">{step.icon}</div>
                                {step.source}
                            </div>
                        ))}
                    </motion.div>

                    {/* Processing Stage: Bullet list to left of phone */}
                    <AnimatePresence>
                        {animationStage === 'processing' && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="absolute left-[-220px] top-[20%] z-40 text-left"
                            >
                                <ul className="space-y-4">
                                    {capturedItems.map((item) => (
                                        <motion.li
                                            key={item.id}
                                            className="flex items-center gap-2 text-gray-700 font-medium"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <span className="text-blue-500">•</span> {item.label}
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Annotation Line (Outside Phone) */}
                    <AnimatePresence>
                        {animationStage === 'context' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="absolute right-[-240px] top-[45%] w-[220px] z-50 pointer-events-none hidden md:block"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="h-[1px] w-8 bg-blue-300"></div>
                                    <p className="text-sm font-medium text-blue-600 bg-blue-50/80 backdrop-blur px-3 py-2 rounded-lg border border-blue-100 shadow-sm">
                                        Guide the AI: Set goals, focus areas, and formatting preferences for your summary.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <PhoneScreen>
                        <div className="absolute inset-0 bg-white flex flex-col px-3 pt-20 pb-4 justify-start transition-all duration-500 ease-in-out">

                            {/* Content Container */}
                            <motion.div
                                layout
                                className={`w-full relative transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col items-center
                   ${animationStage === 'combining' ? 'p-1 rounded-3xl border-2 border-blue-200 bg-blue-50/50 h-full' : 'h-auto'}
                   ${['condensing', 'context', 'settings', 'flash', 'processing'].includes(animationStage) ? 'w-full bg-white rounded-2xl shadow-xl border border-blue-100 p-3' : 'w-full'}
                `}
                            >
                                {/* CONDENSED STATE (Summary Card) */}
                                {['condensing', 'context', 'settings', 'flash', 'processing'].includes(animationStage) && (
                                    <motion.div
                                        layoutId="summary-card"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col w-full"
                                    >
                                        <p className="text-sm font-bold text-gray-800 mb-2">Combined Text</p>
                                        <div className="space-y-1.5">
                                            <div className="h-1.5 w-full bg-blue-200 rounded-full" />
                                            <div className="h-1.5 w-3/4 bg-blue-200 rounded-full" />
                                            <div className="h-1.5 w-1/2 bg-blue-200 rounded-full" />
                                        </div>
                                        <p className="text-gray-400 text-xs mt-2 font-medium tracking-widest">...</p>
                                    </motion.div>
                                )}

                                {/* LIST STATE (Capturing & Combining) */}
                                {!['condensing', 'context', 'settings', 'flash', 'processing'].includes(animationStage) && (
                                    <div className="flex flex-col gap-3 w-full relative">
                                        {/* Giant Vertical Pill (Combining) */}
                                        <AnimatePresence>
                                            {animationStage === 'combining' && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9, height: '80%' }}
                                                    animate={{ opacity: 1, scale: 1, height: '100%' }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute inset-0 bg-blue-100 rounded-[2rem] border border-blue-200 shadow-sm z-10 w-full"
                                                />
                                            )}
                                        </AnimatePresence>

                                        <AnimatePresence mode='popLayout'>
                                            {capturedItems.map((item, index) => (
                                                <motion.div
                                                    layoutId={`item-${item.id}`}
                                                    key={item.id}
                                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                        scale: [1.05, 1],
                                                        height: 'auto'
                                                    }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 400,
                                                        damping: 25,
                                                        opacity: { duration: 0.2 }
                                                    }}
                                                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                                    className={`w-full rounded-2xl border shadow-sm flex items-center gap-3 overflow-hidden p-3 border-gray-100 bg-white z-20`}
                                                >
                                                    <motion.div
                                                        className="flex items-center gap-3 w-full"
                                                        animate={{ opacity: 1 }}
                                                    >
                                                        <div className={`p-2 rounded-xl bg-opacity-10 shrink-0 ${item.color.replace('bg-', 'bg-opacity-10 ')}`}>
                                                            <div className={item.color.split(' ')[0]}>{item.icon}</div>
                                                        </div>
                                                        <div className="flex-1 min-w-0 text-left">
                                                            <p className="text-sm font-semibold text-gray-900 truncate">{item.label}</p>
                                                        </div>
                                                    </motion.div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </motion.div>

                            {/* CONTEXT BOX (Appears below summary) */}
                            <AnimatePresence>
                                {['context', 'settings', 'flash', 'processing'].includes(animationStage) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="w-full mt-4"
                                    >
                                        <div className="w-full rounded-2xl border-2 border-dashed border-gray-200 p-4 flex flex-col items-center justify-center bg-gray-50/50 min-h-[100px] transition-all duration-300">
                                            {contextText ? (
                                                <p className="text-xs text-gray-700 font-medium leading-relaxed text-center w-full break-words animate-pulse-cursor">
                                                    &quot;{contextText}&quot;
                                                    <span className="inline-block w-0.5 h-3 ml-0.5 bg-blue-500 animate-pulse align-middle" />
                                                </p>
                                            ) : (
                                                <>
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mb-2 text-blue-500">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                                            <path d="M12 5v14M5 12h14" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-500">Add Context</p>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* SETTINGS UI (Depth, Time, Difficulty) */}
                            <AnimatePresence>
                                {['settings', 'flash', 'processing'].includes(animationStage) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="w-full mt-4"
                                    >
                                        <p className="text-xs font-bold text-gray-900 mb-3 px-1">Capture Settings</p>
                                        <div className="flex justify-between items-center px-1">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Depth</span>
                                                <div className="h-8 min-w-[50px] px-2 rounded-xl bg-blue-100/50 text-blue-600 border border-blue-200 flex items-center justify-center">
                                                    <AnimatePresence mode="wait">
                                                        <motion.span
                                                            key={depthStage}
                                                            initial={{ opacity: 0, y: 3 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -3 }}
                                                            className="text-[10px] font-bold"
                                                        >
                                                            {DEPTH_STATES[depthStage].label}
                                                        </motion.span>
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                            <div className="h-8 w-[1px] bg-gray-100"></div>
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Time</span>
                                                <div className="h-8 min-w-[50px] px-2 rounded-xl bg-gray-50 text-gray-400 border border-gray-100 flex items-center justify-center">
                                                    <AnimatePresence mode="wait">
                                                        <motion.span
                                                            key={timeStage}
                                                            initial={{ opacity: 0, y: 3 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -3 }}
                                                            className="text-[10px] font-bold"
                                                        >
                                                            {TIME_STATES[timeStage].label}
                                                        </motion.span>
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                            <div className="h-8 w-[1px] bg-gray-100"></div>
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Level</span>
                                                <div className="h-8 min-w-[50px] px-2 rounded-xl bg-gray-50 text-gray-400 border border-gray-100 flex items-center justify-center">
                                                    <AnimatePresence mode="wait">
                                                        <motion.span
                                                            key={difficultyStage}
                                                            initial={{ opacity: 0, y: 3 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -3 }}
                                                            className="text-[10px] font-bold"
                                                        >
                                                            {DIFFICULTY_STATES[difficultyStage].label}
                                                        </motion.span>
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>
                    </PhoneScreen>

                    {/* DEPTH POP-OUT ANIMATION */}
                    <AnimatePresence>
                        {animationStage === 'settings' && (
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
                        )}
                    </AnimatePresence>

                </motion.div>

                {/* Complex Processing Animation (ADVANCED FLOW) */}
                <AnimatePresence>
                    {animationStage === 'processing' && (
                        <div className="absolute inset-0 z-50 pointer-events-none">
                            {/* This div is now empty as its content has been moved/deleted */}
                        </div>
                    )}
                </AnimatePresence>

                {/* Phone 2: Destination (Right Side) */}
                <AnimatePresence>
                    {showProcessingPhone && (
                        <motion.div
                            key="processing-phone"
                            initial={{ x: 490, opacity: 0, scale: 0.8 }}
                            animate={{ x: 390, opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, x: 450 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="absolute flex items-center justify-center w-[300px] z-30"
                        >
                            {/* Processing annotations anchored outside the phone */}
                            <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-[-320px] z-40 flex flex-col gap-2 items-end max-w-[260px] text-gray-800 text-xs sm:text-sm leading-relaxed">
                                <motion.div
                                    className="relative text-left"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: BULLET_ONE_DELAY, duration: 0.4 }}
                                >
                                    <span className="absolute left-full top-[14px] ml-4 w-16 h-px bg-blue-300" />
                                    <span className="absolute left-full top-[14px] ml-[4.75rem] w-2 h-2 rounded-full bg-blue-500" />
                                    <p className="font-semibold text-[11px] sm:text-xs uppercase tracking-wide text-blue-600">Extract relevant content</p>
                                    <p className="leading-relaxed mt-1">Raw content is extracted from sources and turned into content based on depth and context.</p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: BULLET_ONE_DELAY + 0.3, duration: 0.3 }}
                                    className="flex flex-col items-center self-stretch"
                                >
                                    <div className="w-[1px] h-6 bg-gray-300" />
                                    <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-t-gray-300 border-l-transparent border-r-transparent" />
                                </motion.div>

                                <motion.div
                                    className="relative text-left"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: BULLET_TWO_DELAY, duration: 0.4 }}
                                >
                                    <span className="absolute left-full top-[14px] ml-4 w-16 h-px bg-indigo-300" />
                                    <span className="absolute left-full top-[14px] ml-[4.75rem] w-2 h-2 rounded-full bg-indigo-500" />
                                    <p className="font-semibold text-[11px] sm:text-xs uppercase tracking-wide text-indigo-600">Build lesson plan and modules</p>
                                    <p className="leading-relaxed mt-1">The extracted content is then turned into an organized lesson plan and modules for the user to learn in an organized, fun, and directional way.</p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: BULLET_TWO_DELAY + 0.3, duration: 0.3 }}
                                    className="flex flex-col items-center self-stretch"
                                >
                                    <div className="w-[1px] h-6 bg-gray-300" />
                                    <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-t-gray-300 border-l-transparent border-r-transparent" />
                                </motion.div>

                                <motion.div
                                    className="relative text-left"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: BULLET_THREE_DELAY, duration: 0.4 }}
                                >
                                    <span className="absolute left-full top-[14px] ml-4 w-16 h-px bg-purple-300" />
                                    <span className="absolute left-full top-[14px] ml-[4.75rem] w-2 h-2 rounded-full bg-purple-500" />
                                    <p className="font-semibold text-[11px] sm:text-xs uppercase tracking-wide text-purple-600">Generate quizzes</p>
                                    <p className="leading-relaxed mt-1">Then the quizzes are generated to test the content and the learning objectives.</p>
                                </motion.div>
                            </div>

                            <PhoneScreen>
                                <ProcessingScreen />
                            </PhoneScreen>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    )
}
