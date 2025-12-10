'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import FlyingIcon from './FlyingIcon'
import { steps } from './constants'
import StaticSourceIcons from './CapturePhone/StaticSourceIcons'
import ContextAnnotation from './CapturePhone/ContextAnnotation'
import CapturePhoneContent from './CapturePhone/CapturePhoneContent'
import SettingsPopout from './CapturePhone/SettingsPopout'
import RawContentTransition from './RawContentTransition'
import ProcessingPhoneWithAnnotations from './ProcessingPhone/ProcessingPhoneWithAnnotations'
import { useTimeProgress } from '../../hooks/useTimeProgress'

export default function WorkflowAnimation() {
    // --- SETTINGS CYCLING LOGIC ---
    const [settingsState, setSettingsState] = useState({
        depthStage: 0,
        timeStage: 0,
        difficultyStage: 0
    })

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now() / 2500 // 2.5 seconds per switch (slower)
            setSettingsState({
                depthStage: Math.floor(now % 3),
                timeStage: Math.floor((now + 0.5) % 3),
                difficultyStage: Math.floor((now + 1) % 3)
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
                let newState = {
                    activeStep: 0,
                    capturedItems: [] as typeof steps,
                    animationStage: 'capturing',
                    contextText: ''
                }

                // 1. CAPTURING (0.0 - 0.25)
                if (v < 0.25) {
                    newState.animationStage = 'capturing'
                    const stepIndex = Math.floor(v / 0.05)
                    const count = Math.max(0, Math.min(stepIndex, 4))
                    newState.activeStep = count
                    newState.capturedItems = steps.slice(0, count).reverse()
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
                // 4. CONTEXT (0.45 - 0.65)
                else if (v < 0.65) {
                    newState.animationStage = 'context'
                    const textToType = "Focus on X, I want to learn Y content more deeply over time, build from the ground up."
                    const textProgress = Math.max(0, Math.min(1, (v - 0.45) / 0.20))
                    const charCount = Math.floor(textProgress * textToType.length)
                    newState.contextText = textToType.slice(0, charCount)
                }
                // 5. SETTINGS (0.65 - 0.75)
                else if (v < 0.75) {
                    newState.animationStage = 'settings'
                }
                // 6. CREATE BUTTON (0.75 - 0.88)
                else if (v < 0.88) {
                    newState.animationStage = 'create_button'
                }
                // 7. CLICK ANIMATION (0.88 - 0.90) - Short click
                else if (v < 0.90) {
                    newState.animationStage = 'button_click'
                }
                // 8. FLASH (0.90 - 0.95) - Immediate after click
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
        <div className="w-full flex flex-col items-center origin-top scale-[0.65] sm:scale-100">
            <div
                ref={phone1ContainerRef}
                className="relative w-full min-h-[100vh] mt-[100vh] flex items-center justify-center mb-[10vh]"
            >


                <div className="sticky top-0 h-screen flex items-center justify-center overflow-visible">

                    <motion.div
                        className="relative flex flex-col items-center justify-center p-6 sm:p-8 bg-purple-50 rounded-[3rem] z-30 overflow-visible shadow-xl w-[95vw] max-w-[1800px] gap-4 sm:gap-6 min-w-[650px] lg:min-w-[620px]"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight text-center">
                            Capture Everything
                        </h2>

                        <div className="relative w-full grid grid-cols-[620px] lg:grid-cols-[minmax(0,1fr)_620px] gap-0 items-center justify-center lg:justify-start">

                            {/* Text Area (Left Side of Outer Card) */}
                            <div className="hidden lg:flex col-start-1 col-end-2 row-start-1 flex-col justify-center pr-8 z-10 pl-6 min-w-0 overflow-hidden">
                                <div className="text-gray-600 text-lg md:text-xl font-medium max-w-xs whitespace-normal">
                                    Capture content from any source instantly, preserving context and depth.
                                </div>
                            </div>

                            {/* Inner Card Background (Spans Phone + Annotation) */}
                            <div className="block col-start-1 lg:col-start-2 col-end-1 lg:col-end-3 row-start-1 bg-[#764ba2] rounded-[2.5rem] lg:rounded-r-[2.5rem] lg:rounded-l-[2rem] shadow-sm border border-white/50 w-full lg:w-[calc(100%+20px)] h-full lg:-ml-[20px]" />

<<<<<<< ours
<<<<<<< ours
                            {/* Phone Content (Left-aligned, full-width on mobile) */}
                            <div className="col-start-1 lg:col-start-2 col-end-1 lg:col-end-3 row-start-1 relative w-full max-w-[620px] flex justify-start pb-6 sm:pb-10 pt-32 sm:pt-40 z-20">
=======
                            {/* Phone Content (Centered on Mobile, Left-aligned in fixed column on Desktop) */}
                            <div className="col-start-1 lg:col-start-2 col-end-1 lg:col-end-3 row-start-1 relative w-[620px] flex justify-center lg:justify-start pb-6 sm:pb-10 pt-32 sm:pt-40 z-20">
>>>>>>> theirs
=======
                            {/* Phone Content (Centered on Mobile, Left-aligned in fixed column on Desktop) */}
                            <div className="col-start-1 lg:col-start-2 col-end-1 lg:col-end-3 row-start-1 relative w-full max-w-[620px] flex justify-center lg:justify-start pb-6 sm:pb-10 pt-32 sm:pt-40 z-20">
>>>>>>> theirs
                                <div className="relative w-[300px]">
                                    {/* Flying Icons */}
                                    <div className="absolute inset-0 overflow-visible pointer-events-none">
                                        <AnimatePresence>
                                            {phone1State.activeStep > 0 && phone1State.animationStage === 'capturing' && (
                                                <FlyingIcon key={phone1State.activeStep} data={steps[phone1State.activeStep - 1]} />
                                            )}
                                        </AnimatePresence>
                                        <StaticSourceIcons activeStep={phone1State.activeStep} animationStage={phone1State.animationStage} />
                                    </div>

                                    {/* Annotation Line */}
                                    <ContextAnnotation show={phone1State.animationStage === 'context'} />

                                    {/* Phone Content */}
                                    <CapturePhoneContent
                                        animationStage={phone1State.animationStage}
                                        capturedItems={phone1State.capturedItems}
                                        contextText={phone1State.contextText}
                                        depthStage={settingsState.depthStage}
                                        difficultyStage={settingsState.difficultyStage}
                                        timeStage={settingsState.timeStage}
                                    />

                                    {/* Settings Pop-out */}
                                    <SettingsPopout
                                        show={['settings', 'create_button', 'button_click', 'flash', 'processing'].includes(phone1State.animationStage)}
                                        depthStage={settingsState.depthStage}
                                        difficultyStage={settingsState.difficultyStage}
                                        timeStage={settingsState.timeStage}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* TRANSITION ZONE */}
            <div className="relative w-full h-[80vh] -mt-[25vh] -mb-[55vh] z-[50] pointer-events-none">
                <RawContentTransition />
            </div>

            {/* PHONE 2 SECTION */}
            <div
                ref={phone2ContainerRef}
                className="relative w-full z-40 bg-white min-h-[120vh] flex items-center justify-center -mt-10 pb-32"
            >

                <div className="sticky top-0 h-screen flex items-start justify-center overflow-visible pt-[5vh]">
                    <motion.div
                        className="relative flex flex-col items-center justify-center p-6 sm:p-8 bg-purple-50 rounded-[3rem] z-30 overflow-visible shadow-xl w-[95vw] max-w-[1800px] gap-4 sm:gap-6 min-w-[700px] lg:min-w-[680px]"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight text-center">
                            Process Content
                        </h2>

                        <div className="relative w-full grid grid-cols-[680px] lg:grid-cols-[680px_minmax(0,1fr)] gap-0 items-center justify-center lg:justify-start">

                            {/* Inner Card Background (Spans Left Side + Phone) */}
                            <div className="block col-start-1 col-end-1 lg:col-end-2 row-start-1 bg-[#764ba2] rounded-[2.5rem] lg:rounded-l-[2.5rem] lg:rounded-r-[2rem] shadow-sm border border-white/50 w-full lg:w-[calc(100%+20px)] h-full lg:-mr-[20px]" />

                            {/* Text Area (Right Side of Outer Card) */}
                            <div className="hidden lg:flex col-start-2 col-end-3 row-start-1 flex-col justify-center pl-8 z-10 pr-6 min-w-0 overflow-hidden">
                                <div className="text-gray-600 text-lg md:text-xl font-medium max-w-xs whitespace-normal">
                                    {/* Placeholder for future text if needed */}
                                </div>
                            </div>

                            {/* Phone Content (Right-aligned in fixed LEFT column) */}
                            <div className="col-start-1 col-end-1 lg:col-end-2 row-start-1 relative w-[680px] flex justify-center lg:justify-end pb-6 sm:pb-10 pt-32 sm:pt-40 z-20 pr-0 lg:pr-10">
                                <ProcessingPhoneWithAnnotations progress={phone2Progress} />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
