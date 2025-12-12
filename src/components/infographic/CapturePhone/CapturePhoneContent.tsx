'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PhoneScreen from '../PhoneScreen'
import { steps, DEPTH_STATES, TIME_STATES, DIFFICULTY_STATES } from '../constants'

type CapturePhoneContentProps = {
    animationStage: string
    capturedItems: typeof steps
    contextText: string
    depthStage: number
    difficultyStage: number
    timeStage: number
}

export default function CapturePhoneContent({
    animationStage,
    capturedItems,
    contextText,
    depthStage,
    difficultyStage,
    timeStage
}: CapturePhoneContentProps) {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom when button appears
    React.useEffect(() => {
        if (['create_button', 'button_click'].includes(animationStage) && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth'
            })
        }
    }, [animationStage])

    return (
        <PhoneScreen>
            <div ref={scrollContainerRef} className="absolute inset-0 bg-white flex flex-col px-3 pt-20 pb-4 justify-start transition-all duration-500 ease-in-out overflow-y-auto scrollbar-hide">
                {/* Content Container */}
                <motion.div
                    layout
                    className={`w-full relative transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col items-center
                        ${animationStage === 'combining' ? 'p-1 rounded-3xl border-2 border-blue-200 bg-blue-50/50 h-full' : 'h-auto'}
                        ${['condensing', 'context', 'settings', 'create_button', 'button_click', 'flash', 'processing'].includes(animationStage) ? 'w-full bg-white rounded-2xl shadow-xl border border-blue-100 p-3 flex flex-col' : 'w-full'}
                    `}
                >
                    {/* CONDENSED STATE (Summary Card) */}
                    {['condensing', 'context', 'settings', 'create_button', 'button_click', 'flash', 'processing'].includes(animationStage) && (
                        <motion.div
                            layoutId="summary-card"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col w-full"
                        >
                            <p className="text-base font-bold text-gray-800 mb-2">Combined Text</p>
                            <div className="space-y-1.5">
                                <div className="h-1.5 w-full bg-blue-200 rounded-full" />
                                <div className="h-1.5 w-3/4 bg-blue-200 rounded-full" />
                                <div className="h-1.5 w-1/2 bg-blue-200 rounded-full" />
                            </div>
                                        <p className="text-gray-400 text-base mt-2 font-medium tracking-widest">...</p>
                        </motion.div>
                    )}

                    {/* LIST STATE (Capturing & Combining) */}
                    {!['condensing', 'context', 'settings', 'create_button', 'button_click', 'flash', 'processing'].includes(animationStage) && (
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
                                                <p className="text-lg font-semibold text-gray-900 truncate">{item.label}</p>
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
                    {['context', 'settings', 'create_button', 'button_click', 'flash', 'processing'].includes(animationStage) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="w-full mt-4"
                        >
                            <div className="w-full rounded-2xl border-2 border-dashed border-gray-200 p-4 flex flex-col items-center justify-center bg-gray-50/50 min-h-[100px] transition-all duration-300">
                                {contextText ? (
                                    <p className="text-base text-gray-700 font-medium leading-relaxed text-center w-full break-words animate-pulse-cursor">
                                        &quot;{contextText}&quot;
                                        <span className="inline-block w-0.5 h-4 ml-0.5 bg-blue-500 animate-pulse align-middle" />
                                    </p>
                                ) : (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2 text-blue-500">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                                <path d="M12 5v14M5 12h14" />
                                            </svg>
                                        </div>
                                        <p className="text-base font-semibold text-gray-500">Add Context</p>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* SETTINGS UI (Depth, Time, Difficulty) */}
                <AnimatePresence>
                    {['settings', 'create_button', 'button_click', 'flash', 'processing'].includes(animationStage) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="w-full mt-4"
                        >
                            <p className="text-sm font-bold text-gray-900 mb-3 px-1">Capture Settings</p>
                            <div className="flex justify-between items-center px-1">
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Depth</span>
                                    <div className="h-10 min-w-[60px] px-3 rounded-xl bg-blue-100/50 text-blue-600 border border-blue-200 flex items-center justify-center">
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={depthStage}
                                                initial={{ opacity: 0, y: 3 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -3 }}
                                                className="text-xs font-bold"
                                            >
                                                {DEPTH_STATES[depthStage].label}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                </div>
                                <div className="h-10 w-[1px] bg-gray-100"></div>
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Time</span>
                                    <div className="h-10 min-w-[60px] px-3 rounded-xl bg-gray-50 text-gray-400 border border-gray-100 flex items-center justify-center">
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={timeStage}
                                                initial={{ opacity: 0, y: 3 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -3 }}
                                                className="text-xs font-bold"
                                            >
                                                {TIME_STATES[timeStage].label}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                </div>
                                <div className="h-10 w-[1px] bg-gray-100"></div>
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Level</span>
                                    <div className="h-10 min-w-[60px] px-3 rounded-xl bg-gray-50 text-gray-400 border border-gray-100 flex items-center justify-center">
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={difficultyStage}
                                                initial={{ opacity: 0, y: 3 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -3 }}
                                                className="text-xs font-bold"
                                            >
                                                {DIFFICULTY_STATES[difficultyStage].label}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* CREATE CAPTURE BUTTON */}
                    <AnimatePresence>
                        {['create_button', 'button_click', 'flash'].includes(animationStage) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{
                                    opacity: 1,
                                    scale: animationStage === 'button_click' ? 0.85 : (animationStage === 'flash' ? 0.95 : 1),
                                    y: 0
                                }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="w-full mt-auto mb-8"
                            >
                                <div className={`w-full py-4 rounded-xl font-bold text-center text-lg shadow-md transition-all duration-75 
                                    ${animationStage === 'button_click' ? 'bg-blue-700 scale-95' : 'bg-blue-600'} 
                                    text-white
                                `}>
                                    Create Capture
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </AnimatePresence>



                {/* PHONE SCREEN FLASH OVERLAY */}
                <AnimatePresence>
                    {animationStage === 'flash' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}
                            className="absolute inset-0 bg-white z-[100]"
                        />
                    )}
                </AnimatePresence>
            </div>
        </PhoneScreen >
    )
}
