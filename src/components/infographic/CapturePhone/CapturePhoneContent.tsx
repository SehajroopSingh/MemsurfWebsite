'use client'

import { motion, AnimatePresence } from 'framer-motion'
import PhoneScreen from '../PhoneScreen'
import { steps } from '../constants'

type CapturePhoneContentProps = {
    animationStage: string
    capturedItems: typeof steps
    contextText: string
    scheduleStage: number
}

export default function CapturePhoneContent({
    animationStage,
    capturedItems,
    contextText,
    scheduleStage
}: CapturePhoneContentProps) {
    const scheduleOptions = ['Keep Fresh', 'Occasional', 'Sprint', 'By a Date'] as const
    const scheduleLabel = scheduleOptions[scheduleStage % scheduleOptions.length]

    return (
        <PhoneScreen>
            <div className="absolute inset-0 bg-app-canvas flex flex-col px-3 pt-[58px] pb-4 justify-start transition-all duration-500 ease-in-out overflow-y-auto scrollbar-hide">
                {/* Content Container */}
                <motion.div
                    layout
                    className={`w-full relative transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col items-center
                        ${animationStage === 'combining' ? 'p-1 rounded-3xl border-2 border-app-border bg-app-surface h-full' : 'h-auto'}
                        ${['condensing', 'context', 'settings', 'create_button', 'button_click', 'flash', 'processing'].includes(animationStage) ? 'w-full bg-app-surface rounded-2xl shadow-xl border border-app-border p-3 flex flex-col' : 'w-full'}
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
                            <p className="text-base font-bold text-white mb-2">Combined Text</p>
                            <div className="space-y-1.5">
                                <div className="h-1.5 w-full bg-app-softBlue/35 rounded-full" />
                                <div className="h-1.5 w-3/4 bg-app-softBlue/30 rounded-full" />
                                <div className="h-1.5 w-1/2 bg-app-softBlue/25 rounded-full" />
                            </div>
                                        <p className="text-app-textMuted text-base mt-2 font-medium tracking-widest">...</p>
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
                                        className="absolute inset-0 bg-app-softBlue/12 rounded-[2rem] border border-app-border shadow-sm z-10 w-full"
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
                                        className={`w-full rounded-2xl border shadow-sm flex items-center gap-3 overflow-hidden p-3 border-app-border bg-app-surfaceElevated z-20`}
                                    >
                                        <motion.div
                                            className="flex items-center gap-3 w-full"
                                            animate={{ opacity: 1 }}
                                        >
                                            <div className="p-2 rounded-xl shrink-0 bg-app-surface border border-app-border/80">
                                                <div className={item.color.split(' ')[0]}>{item.icon}</div>
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="text-lg font-semibold text-white truncate">{item.label}</p>
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
                            <div className="flex h-[100px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-app-border bg-app-surface p-4 transition-all duration-300">
                                {contextText ? (
                                    <p className="max-h-full w-full overflow-hidden break-words text-center text-sm font-medium leading-snug text-app-textMuted animate-pulse-cursor">
                                        &quot;{contextText}&quot;
                                        <span className="inline-block w-0.5 h-4 ml-0.5 bg-app-softBlue animate-pulse align-middle" />
                                    </p>
                                ) : (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-app-surfaceElevated flex items-center justify-center mb-2 text-app-mint">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                                <path d="M12 5v14M5 12h14" />
                                            </svg>
                                        </div>
                                        <p className="text-base font-semibold text-app-textMuted">Add Context</p>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* SCHEDULE UI */}
                <AnimatePresence>
                    {['settings', 'create_button', 'button_click', 'flash', 'processing'].includes(animationStage) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="w-full mt-4"
                        >
                            <p className="px-1 text-sm font-bold text-white mb-3">Scheduling Options</p>
                            <div className="grid grid-cols-2 gap-2 px-1">
                                {scheduleOptions.map((option) => {
                                    const isActive = option === scheduleLabel

                                    return (
                                        <motion.button
                                            key={option}
                                            type="button"
                                            tabIndex={-1}
                                            aria-pressed={isActive}
                                            animate={{
                                                scale: isActive ? 1.03 : 1,
                                                opacity: isActive ? 1 : 0.72,
                                            }}
                                            transition={{ duration: 0.25, ease: 'easeOut' }}
                                            className={`h-11 rounded-xl border px-2 text-center text-xs font-bold transition-colors duration-300 ${
                                                isActive
                                                    ? 'border-app-softBlue bg-app-softBlue text-white shadow-[0_0_18px_rgba(96,165,250,0.28)]'
                                                    : 'border-app-border bg-app-surfaceElevated text-app-textMuted'
                                            }`}
                                        >
                                            {option}
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* CREATE CAPTURE BUTTON */}
                    <AnimatePresence>
                        {['create_button', 'button_click', 'flash'].includes(animationStage) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                                animate={{
                                    opacity: 1,
                                    scale: animationStage === 'button_click' ? 0.92 : (animationStage === 'flash' ? 0.96 : 1),
                                    y: 0
                                }}
                                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                                className="pointer-events-none absolute bottom-5 left-6 right-6 z-50"
                            >
                                <div className={`w-full rounded-xl py-2.5 text-center text-sm font-bold shadow-md transition-all duration-75
                                    ${animationStage === 'button_click' ? 'bg-app-blueDark scale-95' : 'bg-app-softBlue'}
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
                            className="absolute inset-0 bg-app-canvas z-[100]"
                        />
                    )}
                </AnimatePresence>
            </div>
        </PhoneScreen >
    )
}
