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
import PracticeScrollShowcase from './PracticeScrollShowcase'
import { useTimeProgress } from '../../hooks/useTimeProgress'
import InstitutionScroll from '../InstitutionScroll'
import VideoOverlayContainer from './VideoOverlayContainer'

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
        <div className="w-full flex flex-col items-center">
            <InstitutionScroll />
            {/* HOW IT WORKS Heading */}
            <div className="w-full flex justify-center mb-16 md:mb-8 lg:mb-20 xl:mb-24 mt-48 md:mt-32 z-40">
                <h1 className="text-7xl sm:text-8xl md:text-7xl font-bold text-gray-500 tracking-tight text-center">
                    HOW IT WORKS
                </h1>
            </div>

            {/* HOW IT WORKS Section */}
            <div className="w-full">
                <div
                    id="capture-section"
                    ref={phone1ContainerRef}
                    className="relative w-full min-h-[60vh] md:min-h-[80vh] flex flex-col items-center justify-center mb-0 pb-0"
                >

                    <div className="sticky top-0 h-screen flex items-center justify-center overflow-visible">

                        <motion.div
                            className="relative flex flex-col items-center justify-center z-30 overflow-visible w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-4 sm:gap-6"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >


                            {/* Main Layout: Flex col on mobile, Grid on desktop */}
                            <div className="relative w-full flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_620px] gap-0 items-center justify-center">

                                {/* Desktop Text Area (Hidden on mobile) */}
                                <div className="hidden lg:flex col-start-1 col-end-2 row-start-1 flex-col justify-center pr-8 z-10 pl-6 min-w-0 overflow-hidden">
                                    <div className="space-y-4 text-left drop-shadow-lg">
                                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-600">Universal Input</p>
                                        <h2 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                                            The agent meets you where your information lives.
                                        </h2>
                                        <p className="text-xl md:text-lg text-gray-600 max-w-xl">
                                            Paste it. Upload it. Record it. Connect it. The agent knows what to do with it.
                                        </p>
                                    </div>
                                </div>

                                {/* Phone + Background Container (Right Side) */}
                                {/* This wrapper ensures the background sizes to the phone content, not the grid row */}
                                <div className="relative col-start-2 col-end-3 row-start-1 w-full min-w-[620px] max-w-[620px] flex justify-start z-20 lg:pt-0">

                                    {/* Purple Card Background */}
                                    <div className="relative w-full min-w-[620px] max-w-[620px] bg-[#8c648d] rounded-[2.5rem] shadow-sm border border-white/50 flex flex-col">
                                        {/* "INPUT FROM ANY SOURCE" Text - Centered in Card */}
                                        <div className="absolute top-[-12rem] sm:top-[-14rem] lg:top-[-4rem] xl:top-[-3rem] w-full flex flex-col items-center z-30 pointer-events-none">
                                            <p className="text-3xl font-semibold text-[#8c648d] tracking-wide whitespace-nowrap">INPUT FROM ANY SOURCE</p>
                                            {/* Mobile-only text below */}
                                            <div className="lg:hidden flex flex-col items-center mt-4 px-4">
                                                <p className="text-xl text-gray-600 text-center max-w-xl">
                                                    Paste it. Upload it. Record it. Connect it. The agent knows what to do with it.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Phone Content */}
                                        <div className="relative w-full flex justify-start pb-6 sm:pb-10 pt-40 sm:pt-32 lg:pt-36 z-20 pl-4">
                                            <div className="relative w-[280px]">
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
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* TRANSITION ZONE */}
                <div className="relative w-full h-0 -mt-0 -mb-0 z-[50] pointer-events-none">
                    <RawContentTransition />
                </div>

                {/* PHONE 2 SECTION */}
                <div
                    id="processing-section"
                    ref={phone2ContainerRef}
                    className="relative w-full z-40 min-h-[50vh] md:min-h-[65vh] lg:min-h-[100vh] flex flex-col items-center justify-center -mt-0 pb-0 mb-64 md:mb-80 lg:mb-8 xl:mb-8"
                >
                    {/* Video Loop Snippet */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 lg:mb-20 z-30 flex flex-col items-center"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <img
                                src="/logos/OpenAI-black-monoblossom.svg"
                                alt="OpenAI Logo"
                                className="w-20 h-20 md:w-32 md:h-32"
                            />
                            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                                ChatGPT App Integration
                            </h2>
                        </div>
                        <VideoOverlayContainer className="w-full" />
                    </motion.div>

                    <div className="sticky top-0 h-[60vh] md:h-[80vh] lg:h-screen flex items-start justify-center overflow-visible pt-0 lg:pt-[2vh]">
                        <motion.div
                            className="relative flex flex-col items-center justify-center px-0 py-4 md:py-6 sm:p-8 z-30 overflow-visible w-full max-w-7xl mx-auto gap-2 md:gap-4 sm:gap-6"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-3xl font-semibold text-[#8c648d] tracking-wide whitespace-nowrap text-center mb-6 lg:mb-8">
                                Your Agent Designs The Learning
                            </h2>

                            {/* Processing Section Layout: Flex col mobile, Grid desktop */}
                            <div className="relative w-full flex flex-col-reverse lg:grid lg:grid-cols-[620px_minmax(0,1fr)] gap-0 items-center justify-center">

                                {/* Phone + Background Container (Left Side) */}
                                <div className="relative col-start-1 col-end-2 row-start-1 w-full min-w-[620px] max-w-[620px] flex justify-center z-20">

                                    {/* Phone Content with Purple Card Wrapper */}
                                    <div className="relative w-full min-w-[620px] max-w-[620px] bg-transparent border-[6px] border-[#8c648d] rounded-[2.5rem] shadow-lg flex justify-center items-center py-10 px-4 z-20" style={{ backgroundColor: 'transparent' }}>
                                        <ProcessingPhoneWithAnnotations progress={phone2Progress} />
                                    </div>
                                </div>

                                {/* Text Area (Right Side) */}
                                <div className="flex col-start-2 col-end-3 row-start-1 flex-col justify-center pr-0 lg:pr-4 z-10 pl-0 lg:pl-6 min-w-0 overflow-hidden mb-8 lg:mb-0">
                                    <div className="space-y-4 text-center lg:text-left px-4 lg:px-0 drop-shadow-lg">
                                        <p className="hidden lg:block text-sm font-semibold uppercase tracking-[0.3em] text-[#8c648d]">Intelligent Curriculum</p>
                                        <h2 className="hidden md:block text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                                            We Do The Thinking For You.
                                        </h2>
                                        <p className="text-xl md:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
                                            Our agent ruthlessly optimizes your learning path. It cuts the fluff and feeds you the good stuff. It&apos;s like having a strict tutor, but one you can mute.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Practice Phone Section */}
                <PracticeScrollShowcase />
            </div>
        </div>
    )
}
