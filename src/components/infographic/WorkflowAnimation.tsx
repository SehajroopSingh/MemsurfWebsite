'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import FlyingIcon from './FlyingIcon'
import { steps } from './constants'
import StaticSourceIcons from './CapturePhone/StaticSourceIcons'
import CapturePhoneContent from './CapturePhone/CapturePhoneContent'
import CapturePhoneScaleFrame from './CapturePhone/CapturePhoneScaleFrame'
import ProcessingPhoneWithAnnotations from './ProcessingPhone/ProcessingPhoneWithAnnotations'
import PracticeScrollShowcase from './PracticeScrollShowcase'
import { useTimeProgress } from '../../hooks/useTimeProgress'
import VideoOverlayContainer from './VideoOverlayContainer'
import ChatGptIntegrationSection from './ChatGptIntegrationSection'

export default function WorkflowAnimation() {
    // --- SETTINGS CYCLING LOGIC ---
    const [settingsState, setSettingsState] = useState({
        depthStage: 0,
        timeStage: 0,
        difficultyStage: 0,
        scheduleStage: 0,
    })

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now() / 2500 // 2.5 seconds per switch (slower)
            setSettingsState({
                depthStage: Math.floor(now % 3),
                timeStage: Math.floor((now + 0.5) % 3),
                difficultyStage: Math.floor((now + 1) % 3),
                scheduleStage: Math.floor(now % 4),
            })
        }, 100) // Update frequency
        return () => clearInterval(interval)
    }, [])

    // --- PHONE 1 LOGIC ---
    const phone1ContainerRef = useRef<HTMLDivElement>(null)
    const phone1InView = useInView(phone1ContainerRef, { once: true, amount: 0.4 })

    // Previously mapped 300vh scroll to logic. Now map 0-1 time progress.
    // Let's say the whole capture sequence takes about 15 seconds (3x slower).
    const phone1Progress = useTimeProgress({
        trigger: phone1InView,
        duration: 15000, // 5 seconds for full sequence
        delay: 200
    })

    // State derivation from phone1Progress
    const [phone1State, setPhone1State] = useState({
        activeStep: 0,
        capturedItems: [] as typeof steps,
        animationStage: 'capturing',
        contextText: ''
    })

    // Drive Phone 1 State based on time progress
    useEffect(() => {
        return phone1Progress.on('change', (v) => {
            setPhone1State(prev => {
                const textToType = "Focus on X, I want to learn Y content more deeply over time, build from the ground up."
                let newState = {
                    activeStep: 0,
                    capturedItems: [] as typeof steps,
                    animationStage: 'capturing',
                    contextText: ''
                }

                // 1. CAPTURING (0.0 - 0.25)
                if (v < 0.25) {
                    newState.animationStage = 'capturing'
                    const cardArrivalDelay = 0.04
                    const stepIndex = Math.floor(v / 0.05)
                    const capturedCount = Math.floor((v - cardArrivalDelay) / 0.05)
                    newState.activeStep = Math.max(0, Math.min(stepIndex, 4))
                    newState.capturedItems = steps.slice(0, Math.max(0, Math.min(capturedCount, 4))).reverse()
                }
                // 2. COMBINING (0.25 - 0.35)
                else if (v < 0.35) {
                    newState.animationStage = 'combining'
                    newState.activeStep = 0
                    newState.capturedItems = steps.slice(0, 4).reverse()
                }
                // 3. CONDENSING (0.35 - 0.45)
                else if (v < 0.45) {
                    newState.animationStage = 'condensing'
                }
                // 4. CONTEXT (0.45 - 0.68)
                else if (v < 0.68) {
                    newState.animationStage = 'context'
                    const textProgress = Math.max(0, Math.min(1, (v - 0.45) / 0.23))
                    const charCount = Math.floor(textProgress * textToType.length)
                    newState.contextText = textToType.slice(0, charCount)
                }
                // 5. SETTINGS (0.68 - 0.84)
                else if (v < 0.84) {
                    newState.animationStage = 'settings'
                    newState.contextText = textToType
                }
                // 6. CREATE BUTTON (0.84 - 0.91)
                else if (v < 0.91) {
                    newState.animationStage = 'create_button'
                    newState.contextText = textToType
                }
                // 7. CLICK ANIMATION (0.91 - 0.93) - Short click
                else if (v < 0.93) {
                    newState.animationStage = 'button_click'
                }
                // 8. FLASH (0.93 - 0.95) - Immediate after click
                else if (v < 0.95) {
                    newState.animationStage = 'flash'
                }
                // 8. DONE (0.92+)
                else {
                    newState.animationStage = 'processing'
                }

                if (JSON.stringify(prev) !== JSON.stringify(newState)) {
                    return newState
                }
                return prev
            })
        })
    }, [phone1Progress])

    // --- PHONE 2 LOGIC ---
    const phone2ContainerRef = useRef<HTMLDivElement>(null)
    const phone2InView = useInView(phone2ContainerRef, { once: true, amount: 0.4 })

    // Processing sequence
    const phone2Progress = useTimeProgress({
        trigger: phone2InView,
        duration: 12000,
        delay: 200
    })

    return (
        <div className="w-full flex flex-col items-center">
            {/* HOW IT WORKS Section — [3] */}
            <div className="w-full mt-16 md:mt-10 lg:mt-14 flex h-fit flex-col items-center gap-10 md:gap-14 lg:gap-12">
                {/* 3b — Capture */}
                <div
                    id="capture-section"
                    ref={phone1ContainerRef}
                    className="relative flex h-fit w-full flex-col items-center"
                >
                    <div className="relative flex h-fit w-full items-center justify-center overflow-visible py-4 md:py-6">
                        <motion.div
                            className="relative flex h-fit w-full max-w-7xl flex-col items-center justify-center z-30 overflow-visible mx-auto px-4 sm:px-6 lg:px-8 gap-4 sm:gap-6"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >


                            {/* Main Layout: Flex row across breakpoints */}
                            <div className="relative w-full flex flex-row gap-0 items-center justify-center">

                                {/* Desktop Text Area (Hidden on mobile) */}
                                <div className="hidden lg:flex col-start-1 col-end-2 row-start-1 flex-col justify-center pr-8 z-10 pl-6 min-w-0 overflow-hidden">
                                    <div className="space-y-4 text-left">
                                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-app-textMuted">Universal Input</p>
                                        <h2 className="text-[40px] font-bold text-app-text leading-tight">
                                            The agent meets you where your information lives.
                                        </h2>
                                        <p className="text-xl md:text-lg text-app-textMuted max-w-xl">
                                            Paste it. Upload it. Record it. Connect it. The agent knows what to do with it.
                                        </p>
                                    </div>
                                </div>

                                {/* Phone + Background Container (Right Side) */}
                                <div className="relative col-start-2 col-end-3 row-start-1 z-20 flex h-fit w-full min-w-0 max-w-[960px] flex-col items-center justify-start lg:pt-0">
                                    <div className="relative flex h-fit w-full min-w-0 max-w-[960px] flex-col overflow-visible rounded-[2.5rem] border border-app-border bg-app-surface shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
                                        <div className="flex w-full flex-col items-center gap-2 px-5 pt-6 pb-3 text-center sm:gap-3 sm:px-6 sm:pt-8 sm:pb-4">
                                            <p className="text-3xl font-semibold text-app-text tracking-wide sm:whitespace-nowrap">
                                                Input from any source
                                            </p>
                                            <p className="text-xl text-app-textMuted max-w-xl lg:hidden">
                                                Paste it. Upload it. Record it. Connect it. The agent knows what to do with it.
                                            </p>
                                        </div>

                                        {/* Icons + phone + settings annotations */}
                                        <div className="relative z-20 mx-auto w-full min-w-0 overflow-visible px-4 pb-6 sm:px-6 sm:pb-10">
                                            <div className="relative mx-auto h-[6.5rem] w-full max-w-[560px] sm:h-[7rem]">
                                                <StaticSourceIcons
                                                    activeStep={phone1State.activeStep}
                                                    animationStage={phone1State.animationStage}
                                                />
                                            </div>

                                            <CapturePhoneScaleFrame className="mt-1 sm:mt-2">
                                                <div className="relative flex flex-row flex-nowrap items-center justify-center gap-6 sm:gap-8 md:gap-10">
                                                    <div className="relative w-[280px] shrink-0">
                                                        <div className="pointer-events-none absolute -top-[6.5rem] bottom-0 left-1/2 z-50 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 overflow-visible sm:-top-[7rem]">
                                                            <AnimatePresence>
                                                                {phone1State.activeStep > 0 && phone1State.animationStage === 'capturing' && (
                                                                    <FlyingIcon key={phone1State.activeStep} data={steps[phone1State.activeStep - 1]} />
                                                                )}
                                                            </AnimatePresence>
                                                        </div>

                                                        <CapturePhoneContent
                                                            animationStage={phone1State.animationStage}
                                                            capturedItems={phone1State.capturedItems}
                                                            contextText={phone1State.contextText}
                                                            scheduleStage={settingsState.scheduleStage}
                                                        />
                                                    </div>

                                                </div>
                                            </CapturePhoneScaleFrame>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* 3d — Processing */}
                <div
                    id="processing-section"
                    ref={phone2ContainerRef}
                    className="relative z-40 flex h-fit w-full flex-col items-center gap-10 md:gap-12"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="z-30 flex h-fit w-full max-w-7xl flex-col items-center mx-auto px-4 sm:px-6 lg:px-8"
                    >
                        <ChatGptIntegrationSection />
                    </motion.div>

                    <div className="relative flex h-fit w-full items-start justify-center overflow-visible py-4 md:py-6">
                        <motion.div
                            className="relative z-30 flex h-fit w-full max-w-7xl flex-col items-center justify-center overflow-visible mx-auto gap-4 px-0 py-4 sm:gap-6 sm:p-8 md:py-6"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="max-w-full px-4 text-center text-3xl font-semibold tracking-wide text-app-text mb-6 sm:whitespace-nowrap lg:mb-8">
                                Your Agent Designs The Learning
                            </h2>

                            {/* Processing Section Layout: Flex col mobile, Grid desktop */}
                            <div className="relative w-full flex flex-col-reverse lg:grid lg:grid-cols-[620px_minmax(0,1fr)] gap-0 items-center justify-center">

                                {/* Phone + Background Container (Left Side) */}
                                <div className="relative col-start-1 col-end-2 row-start-1 z-20 flex h-fit w-full min-w-0 max-w-[620px] justify-center sm:min-w-[620px]">

                                    {/* Phone Content with Purple Card Wrapper */}
                                    <div className="relative flex h-fit w-full min-w-0 max-w-[620px] items-center justify-center rounded-[2.5rem] border border-app-border bg-app-surface px-4 py-10 shadow-[0_16px_48px_rgba(0,0,0,0.08)] sm:min-w-[620px] z-20">
                                        <ProcessingPhoneWithAnnotations progress={phone2Progress} />
                                    </div>
                                </div>

                                {/* Text Area (Right Side) */}
                                <div className="flex col-start-2 col-end-3 row-start-1 flex-col justify-center pr-0 lg:pr-4 z-10 pl-0 lg:pl-6 min-w-0 overflow-hidden mb-8 lg:mb-0">
                                    <div className="space-y-4 text-center lg:text-left px-4 lg:px-0">
                                        <p className="hidden lg:block text-sm font-semibold uppercase tracking-[0.3em] text-app-textMuted">YOUR LEARNING ARCHITECT</p>
                                        <h2 className="hidden md:block text-[40px] font-bold text-app-text leading-tight">
                                            Your Material, Made Learnable.
                                        </h2>
                                        <p className="text-xl md:text-lg text-app-textMuted max-w-xl mx-auto lg:mx-0">
                                            Send in the content and your agent gets to work. It pulls out what matters, builds the lessons and quizzes, then fits them into your schedule based on your pace, priorities, and progress.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* 3e — Practice */}
                <div className="h-fit w-full shrink-0">
                    <PracticeScrollShowcase />
                </div>
            </div>
        </div>
    )
}
