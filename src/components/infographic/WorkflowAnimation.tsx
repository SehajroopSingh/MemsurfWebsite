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
        contextText: '',
        depthStage: 0,
        difficultyStage: 0,
        timeStage: 0
    })

    // Drive Phone 1 State based on time progress
    useEffect(() => {
        return phone1Progress.on('change', (v) => {
            setPhone1State(prev => {
                let newState = {
                    activeStep: 0,
                    capturedItems: [] as typeof steps,
                    animationStage: 'capturing',
                    contextText: '',
                    depthStage: 0,
                    difficultyStage: 0,
                    timeStage: 0
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
                    newState.depthStage = Math.floor(((v - 0.65) * 20)) % 3
                    newState.timeStage = Math.floor(((v - 0.65) * 15)) % 3
                    newState.difficultyStage = Math.floor(((v - 0.65) * 10)) % 3
                }
                // 6. CREATE BUTTON (0.75 - 0.88)
                else if (v < 0.88) {
                    newState.animationStage = 'create_button'
                    newState.depthStage = 2
                    newState.timeStage = 2
                    newState.difficultyStage = 2
                }
                // 7. CLICK ANIMATION (0.88 - 0.90) - Short click
                else if (v < 0.90) {
                    newState.animationStage = 'button_click'
                    newState.depthStage = 2
                    newState.timeStage = 2
                    newState.difficultyStage = 2
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
        <div className="w-full flex flex-col items-center">
            {/* PHONE 1 SECTION */}
            <div
                ref={phone1ContainerRef}
                className="relative w-full min-h-[100vh] mt-[100vh] flex items-center justify-center"
            >
                <div className="sticky top-0 h-screen flex items-center justify-center overflow-visible">

                    <motion.div
                        className="relative flex items-center justify-center w-[300px] z-30 overflow-visible"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
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
                            depthStage={phone1State.depthStage}
                            difficultyStage={phone1State.difficultyStage}
                            timeStage={phone1State.timeStage}
                        />

                        {/* Settings Pop-out */}
                        <SettingsPopout
                            show={['settings', 'create_button', 'button_click', 'flash', 'processing'].includes(phone1State.animationStage)}
                            depthStage={phone1State.depthStage}
                            difficultyStage={phone1State.difficultyStage}
                            timeStage={phone1State.timeStage}
                        />
                    </motion.div>
                </div>
            </div>

            {/* TRANSITION ZONE */}
            <div className="relative w-full h-[80vh] -mt-[30vh] -mb-[60vh] z-[60] pointer-events-none">
                <RawContentTransition />
            </div>

            {/* PHONE 2 SECTION */}
            <div
                ref={phone2ContainerRef}
                className="relative w-full z-40 bg-white min-h-[120vh] flex items-center justify-center"
            >
                <div className="sticky top-0 h-screen flex items-center justify-center overflow-visible">
                    <ProcessingPhoneWithAnnotations progress={phone2Progress} />
                </div>
            </div>
        </div>
    )
}
