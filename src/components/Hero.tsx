'use client'

import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Mic, Copy, FileText, CheckCircle2 } from 'lucide-react'

// Custom Icons for Brands
const NotionIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M4.19 19.34c-1.3-.4-1.9-1.3-1.8-2.6l.1-9.7c.1-1.2.6-2 1.8-2.3L15.3 1.2c1.3-.4 2.2 0 2.5 1.3l2.8 14.8c.2 1.3-.2 2.2-1.4 2.6l-11 3.5c-1.2.4-2.1 0-2.4-1.2l-1.6-2.8zm11.2-13.6c-.3-.1-.6 0-.8.2-.2.2-.2.6 0 .8l.8.8c.2.2.6.2.8 0 .2-.2.2-.6 0-.8l-.8-1zm-4.4 7.4c-1.2.4-2.2 1.6-2.4 2.9-.1.8.1 1.6.6 2.2.5.6 1.3.9 2.1.6 1.2-.4 1.8-1.5 1.8-2.8 0-.8-.3-1.6-.8-2.2-.6-.6-1.5-.9-2.2-.7h.9z" />
    </svg>
)

const GDriveIcon = () => (
    <svg viewBox="0 0 87.3 78" className="w-6 h-6">
        <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066DA" />
        <path d="M43.65 25l13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.25l13.75 23.75z" fill="#00AC47" />
        <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l9.6-16.65c.8-1.4 1.2-2.95 1.2-4.5h-27.5l13.4 24.45z" fill="#EA4335" />
        <path d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-9.6 16.65c-.8 1.4-1.2 2.95-1.2 4.5h27.85z" fill="#00832D" />
        <path d="M59.8 53.05h27.5c0-1.55-.4-3.1-1.2-4.5l-3.85-6.65c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8z" fill="#2684FC" />
        <path d="M73.4 76.8l-13.75-23.75h-27.5l13.75 23.75c1.6 0 3.15-.45 4.5-1.25z" fill="#FFBA00" />
    </svg>
)

const steps = [
    {
        id: 1,
        icon: <NotionIcon />,
        color: "text-gray-900 border-gray-200 bg-white",
        label: "Research Notes",
        source: "Notion",
        position: { top: "20%", left: "15%" }
    },
    {
        id: 2,
        icon: <Mic className="w-6 h-6" />,
        color: "text-red-500 border-red-100 bg-red-50",
        label: "Lecture Audio",
        source: "Voice Note",
        position: { top: "30%", right: "15%" }
    },
    {
        id: 3,
        icon: <GDriveIcon />,
        color: "text-blue-500 border-blue-100 bg-blue-50",
        label: "Project Specs",
        source: "Google Drive",
        position: { top: "60%", left: "15%" }
    },
    {
        id: 4,
        icon: <Copy className="w-6 h-6" />,
        color: "text-purple-500 border-purple-100 bg-purple-50",
        label: "Interesting Article",
        source: "Clipboard",
        position: { top: "70%", right: "15%" }
    }
]

export default function Hero() {
    const { scrollY } = useScroll()

    // Scroll Animations
    const phone1X = useTransform(scrollY, [0, 600], ["0%", "-50%"])
    const phone1Opacity = useTransform(scrollY, [600, 800], [1, 0])
    const textOpacity = useTransform(scrollY, [0, 300], [1, 0])

    const phone2X = useTransform(scrollY, [400, 1000], ["200%", "50%"])
    const phone2Opacity = useTransform(scrollY, [400, 600], [0, 1])

    const [activeStep, setActiveStep] = useState(0)
    const [capturedItems, setCapturedItems] = useState<typeof steps>([])
    const [depthStage, setDepthStage] = useState(0)
    const [contextText, setContextText] = useState("")

    // 'capturing' -> 'combining' -> 'condensing' -> 'context' -> 'settings'
    const [animationStage, setAnimationStage] = useState<'capturing' | 'combining' | 'condensing' | 'context' | 'settings'>('capturing')

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

                // Settings Stage
                setAnimationStage('settings')
                await new Promise(r => setTimeout(r, 10000)) // Show settings and depth pop-out (Need >9s for 3x3s cycles)

                setCapturedItems([])
                setContextText("") // Clear text for next loop
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

    // Depth Cycle - Only run during settings stage and reset on entry
    useEffect(() => {
        let interval: NodeJS.Timeout

        if (animationStage === 'settings') {
            setDepthStage(0) // Reset to Main Points start
            interval = setInterval(() => {
                setDepthStage(prev => (prev + 1) % 3)
            }, 3000)
        } else {
            setDepthStage(0)
        }

        return () => clearInterval(interval)
    }, [animationStage])

    return (
        <section className="relative h-[300vh] bg-gradient-to-b from-white to-blue-50/50">
            <div className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-center pt-20">

                {/* Background Ambience */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNlN2U1ZTQiLz48L3N2Zz4=')] opacity-20 pointer-events-none"></div>
                {/* ... other background blobs ... */}

                <motion.div style={{ opacity: textOpacity }} className="text-center z-20 absolute top-32 w-full px-4">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Don&apos;t Forget to Remember
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 mb-20 max-w-3xl mx-auto leading-relaxed">
                        Don&apos;t surf the web, surf what you wanted to remember. Use Memsurf.
                    </p>
                </motion.div>

                <div className="relative w-full max-w-7xl mx-auto h-[600px] flex items-center justify-center mt-48">

                    {/* Phone 1: Capture (Moves Left) */}
                    <motion.div
                        style={{ x: phone1X, opacity: phone1Opacity }}
                        className="absolute flex items-center justify-center w-[300px]"
                    >
                        {/* Flying Icons */}
                        <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 overflow-visible pointer-events-none">
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
                                    style={{ top: step.position.top, left: step.position.left, right: step.position.right }}
                                >
                                    <div className="grayscale opacity-50 scale-75">{step.icon}</div>
                                    {step.source}
                                </div>
                            ))}
                        </motion.div>

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
                            <div className={`absolute inset-0 bg-white flex flex-col p-6 transition-all duration-500 ease-in-out
                                ${(animationStage === 'condensing' || animationStage === 'context' || animationStage === 'settings') ? 'justify-start pt-16' : 'justify-center'}
                            `}>

                                <div className="h-10 w-full shrink-0"></div> {/* Spacer for dynamic island area */}

                                {/* Content Container */}
                                <motion.div
                                    layout
                                    className={`w-full relative transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col items-center
                           ${animationStage === 'combining' ? 'p-1 rounded-3xl border-2 border-blue-200 bg-blue-50/50 justify-center h-full' : ''}
                           ${(animationStage === 'condensing' || animationStage === 'context' || animationStage === 'settings') ? 'w-full bg-white rounded-2xl shadow-xl border border-blue-100 p-4 h-auto' : 'h-full justify-center'}
                        `}
                                >
                                    {/* CONDENSED STATE (Summary Card) */}
                                    {(animationStage === 'condensing' || animationStage === 'context' || animationStage === 'settings') && (
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
                                    {!(animationStage === 'condensing' || animationStage === 'context' || animationStage === 'settings') && (
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
                                                            scale: 1,
                                                            height: 'auto'
                                                        }}
                                                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                                        className={`rounded-2xl border shadow-sm flex items-center gap-3 overflow-hidden p-3 border-gray-100 bg-white z-20`}
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
                                    {(animationStage === 'context' || animationStage === 'settings') && (
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
                                    {animationStage === 'settings' && (
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
                                                                {depthStage === 0 ? "Main" : depthStage === 1 ? "Sub" : "Details"}
                                                            </motion.span>
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                                <div className="h-8 w-[1px] bg-gray-100"></div>
                                                <div className="flex flex-col items-center gap-1 opacity-50">
                                                    <span className="text-[10px] font-medium text-gray-300 uppercase tracking-wide">Time</span>
                                                    <div className="p-2 rounded-xl bg-gray-50 text-gray-400 border border-gray-100">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                                            <circle cx="12" cy="12" r="10" />
                                                            <path d="M12 6v6l4 2" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="h-8 w-[1px] bg-gray-100"></div>
                                                <div className="flex flex-col items-center gap-1 opacity-50">
                                                    <span className="text-[10px] font-medium text-gray-300 uppercase tracking-wide">Level</span>
                                                    <div className="p-2 rounded-xl bg-gray-50 text-gray-400 border border-gray-100">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                                        </svg>
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
                                    {/* Elbow Line (Left -> Up -> Left) */}
                                    <svg className="absolute top-[20%] left-[-200px] w-[200px] h-[400px] z-40 pointer-events-none overflow-visible">
                                        <motion.path
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            exit={{ pathLength: 0, opacity: 0 }}
                                            transition={{ duration: 0.8, ease: "easeInOut" }}
                                            d="M 200 360 L 100 360 L 100 50 L 0 50"
                                            fill="none"
                                            stroke="url(#line-gradient)"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                        />
                                        <defs>
                                            <linearGradient id="line-gradient" x1="100%" y1="0%" x2="0%" y2="0%">
                                                <stop offset="0%" stopColor="#93C5FD" />
                                                <stop offset="100%" stopColor="#3B82F6" />
                                            </linearGradient>
                                        </defs>
                                    </svg>

                                    {/* Connector Dot at Phone */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        transition={{ duration: 0.3, delay: 0 }}
                                        className="absolute top-[78.5%] left-[-6px] w-3 h-3 rounded-full bg-blue-300 z-50 ring-4 ring-blue-50"
                                    />

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
                                                        {depthStage === 0 ? "Main Points" : depthStage === 1 ? "Subpoints" : "Details"}
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
                                </>
                            )}
                        </AnimatePresence>

                    </motion.div>

                    {/* Phone 2: Structure (Enters from Right) */}
                    <motion.div
                        style={{ x: phone2X, opacity: phone2Opacity }}
                        className="absolute flex flex-col items-center justify-center w-[300px]"
                    >
                        {/* Choose Depth Indicator */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="absolute -top-32 bg-white/80 backdrop-blur px-6 py-3 rounded-2xl shadow-lg border border-gray-200 text-center z-50 min-w-[200px]"
                        >
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">AI Context</p>
                            <div className="flex items-center gap-2 justify-center">
                                <span className={`text-sm font-bold transition-colors duration-300 ${depthStage === 0 ? 'text-blue-600 scale-110' : 'text-gray-300'}`}>Main Points</span>
                                <span className="text-gray-300">→</span>
                                <span className={`text-sm font-bold transition-colors duration-300 ${depthStage === 1 ? 'text-blue-600 scale-110' : 'text-gray-300'}`}>Subpoints</span>
                                <span className="text-gray-300">→</span>
                                <span className={`text-sm font-bold transition-colors duration-300 ${depthStage === 2 ? 'text-blue-600 scale-110' : 'text-gray-300'}`}>Details</span>
                            </div>
                        </motion.div>

                        <PhoneScreen>
                            <div className="absolute inset-0 bg-white flex flex-col p-6">
                                <div className="h-14 w-full bg-white shrink-0"></div>
                                <div className="mb-6">
                                    <h3 className="text-gray-900 font-bold text-2xl">Structure</h3>
                                    <p className="text-gray-400 text-sm">AI organizing content...</p>
                                </div>

                                <div className="flex-1 relative">
                                    <DepthVisualization stage={depthStage} />
                                </div>
                            </div>
                        </PhoneScreen>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}

function PhoneScreen({ children }: { children?: React.ReactNode }) {
    return (
        <div className="relative w-full h-[600px] bg-gray-950 rounded-[55px] shadow-2xl border-[6px] border-[#3b3b3b] overflow-hidden transform-style-3d">
            {/* Titanium Frame Highlights */}
            <div className="absolute inset-0 rounded-[50px] border-[2px] border-[#555555]/40 pointer-events-none z-50"></div>
            <div className="absolute inset-[-2px] rounded-[58px] border-[1px] border-[#1a1a1a] pointer-events-none z-50 opacity-50"></div>
            {/* Inner Bezel */}
            <div className="absolute inset-[3px] rounded-[48px] border-[3px] border-black pointer-events-none z-40"></div>
            {/* Dynamic Island */}
            <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-full z-50 flex items-center justify-center">
                <div className="w-20 h-full flex items-center justify-between px-3">
                    <div className="w-3 h-3 bg-[#111] rounded-full"></div>
                    <div className="w-2 h-2 bg-[#050505] rounded-full"></div>
                </div>
            </div>
            {/* Screen Content */}
            <div className="absolute inset-[6px] rounded-[44px] bg-white overflow-hidden mask-image-rounded">
                {children}
            </div>
            {/* Buttons */}
            <div className="absolute top-[100px] left-[-8px] w-[3px] h-[24px] bg-[#2a2a2a] rounded-l-md border-r border-[#1a1a1a]"></div>
            <div className="absolute top-[140px] left-[-8px] w-[3px] h-[40px] bg-[#2a2a2a] rounded-l-md border-r border-[#1a1a1a]"></div>
            <div className="absolute top-[190px] left-[-8px] w-[3px] h-[40px] bg-[#2a2a2a] rounded-l-md border-r border-[#1a1a1a]"></div>
            <div className="absolute top-[140px] right-[-8px] w-[3px] h-[65px] bg-[#2a2a2a] rounded-r-md border-l border-[#1a1a1a]"></div>
            <div className="absolute bottom-[100px] right-[-4px] w-[4px] h-[65px] bg-[#1a1a1a] rounded-r-md shadow-inner border-l border-gray-800"></div>
            {/* Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none z-30 rounded-[55px]"></div>
        </div>
    )
}

function FlyingIcon({ data }: { data: any }) {
    const isLeft = !!data.position.left
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5, top: data.position.top, left: isLeft ? data.position.left : 'auto', right: !isLeft ? data.position.right : 'auto', x: 0, y: 0 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1.2, 0.5, 0], left: '50%', top: '50%', right: 'auto', x: '-50%', y: '-50%' }}
            transition={{ duration: 0.8, times: [0, 0.2, 0.8, 1], ease: "easeInOut" }}
            className={`absolute z-50 p-4 rounded-2xl shadow-xl backdrop-blur-md border border-white/50 ${data.color}`}
        >
            {data.icon}
        </motion.div>
    )
}

function DepthVisualization({ stage }: { stage: number }) {
    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
            {[1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    layout
                    className="relative"
                >
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-3 shrink-0" />
                        <motion.div
                            layoutId={`main-${i}`}
                            className="h-8 w-full bg-blue-100 rounded-lg"
                            animate={{ backgroundColor: stage === 0 ? '#DBEAFE' : '#EFF6FF' }}
                        />
                    </div>
                    <AnimatePresence>
                        {stage >= 1 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pl-2 border-l border-gray-100 ml-3 mt-3 space-y-4"
                            >
                                {[1, 2].map((j) => (
                                    <div key={j} className="space-y-3">
                                        <div className="flex items-center gap-3 pl-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
                                            <div className="h-6 w-3/4 bg-blue-50 rounded-md" />
                                        </div>
                                        <AnimatePresence>
                                            {stage >= 2 && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="pl-8 space-y-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                                                        <div className="h-4 w-full bg-gray-50 rounded-sm" />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                                                        <div className="h-4 w-5/6 bg-gray-50 rounded-sm" />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}
        </div>
    )
}
