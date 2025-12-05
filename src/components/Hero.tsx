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
  // Content pins for 300vh
  // 0-200vh: Stage 1 (Capture) moves from Center to Left
  // 100-300vh: Stage 2 (Structure) moves from Right to Right-Center

  const phone1X = useTransform(scrollY, [0, 600], ["0%", "-50%"])
  const phone1Opacity = useTransform(scrollY, [600, 800], [1, 0])
  const textOpacity = useTransform(scrollY, [0, 300], [1, 0])

  // Adjusted: Starts further off-screen (200%) and enters later (400-1000 range)
  const phone2X = useTransform(scrollY, [400, 1000], ["200%", "50%"])
  const phone2Opacity = useTransform(scrollY, [400, 600], [0, 1]) // Fade in as it enters

  const [activeStep, setActiveStep] = useState(0)
  const [capturedItems, setCapturedItems] = useState<typeof steps[]>([])
  const [showCaptureFlash, setShowCaptureFlash] = useState(false)
  const [depthStage, setDepthStage] = useState(0) // 0: Main, 1: Sub, 2: Detail

  // Stage 1: Capture Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        const next = (prev + 1) % (steps.length + 1)
        if (next === 0) {
          setCapturedItems([])
          return 0
        }
        return next
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (activeStep > 0) {
      const item = steps[activeStep - 1]
      const timer = setTimeout(() => {
        setCapturedItems(prev => [item, ...prev].slice(0, 4))
        setShowCaptureFlash(true)
        setTimeout(() => setShowCaptureFlash(false), 800)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [activeStep])

  // Stage 2: Depth Cycle (simulated for now)
  useEffect(() => {
    const interval = setInterval(() => {
      setDepthStage(prev => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative h-[300vh] bg-gradient-to-b from-white to-blue-50/50">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-center pt-20">

        {/* Background Ambience */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNlN2U1ZTQiLz48L3N2Zz4=')] opacity-20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl opacity-30 translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-3xl opacity-30 -translate-x-1/3 translate-y-1/4 pointer-events-none"></div>

        {/* Initial Title (Fades out on scroll) */}
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

        {/* Animation Container - Increased top margin to mt-48 to clear title */}
        <div className="relative w-full max-w-7xl mx-auto h-[600px] flex items-center justify-center mt-48">

          {/* Phone 1: Capture (Moves Left) */}
          <motion.div
            style={{ x: phone1X, opacity: phone1Opacity }}
            className="absolute flex items-center justify-center w-[300px]"
          >
            {/* Flying Icons (Attached to Phone 1) */}
            <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 overflow-visible pointer-events-none">
              <AnimatePresence>
                {activeStep > 0 && activeStep <= steps.length && (
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

            <PhoneScreen>
              <div className="absolute inset-0 bg-white flex flex-col">
                {/* Flash Feedback Overlay */}
                <AnimatePresence>
                  {showCaptureFlash && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-50 bg-blue-500/20 flex items-center justify-center backdrop-blur-[2px]"
                    >
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1.2, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        className="px-6 py-3 bg-white rounded-full shadow-xl font-bold text-blue-600 text-xl tracking-wide"
                      >
                        CAPTURED
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="h-14 w-full bg-white shrink-0"></div>
                <div className="px-6 pb-4 border-b border-gray-100 shrink-0 bg-white z-10">
                  <h3 className="text-gray-900 font-bold text-2xl">Inbox</h3>
                  <p className="text-gray-400 text-sm">{capturedItems.length} items captured</p>
                </div>
                <div className="flex-1 overflow-hidden p-4 space-y-3 relative">
                  {capturedItems.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <p>Ready to capture</p>
                    </div>
                  )}
                  <AnimatePresence mode='popLayout'>
                    {capturedItems.map((item) => (
                      <motion.div
                        layout
                        key={item.id}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-2xl p-3 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-3"
                      >
                        <div className={`p-2 rounded-xl bg-opacity-10 ${item.color.replace('bg-', 'bg-opacity-10 ')}`}>
                          <div className={item.color.split(' ')[0]}>{item.icon}</div>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-semibold text-gray-900 truncate">{item.label}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">Imported from {item.source}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </PhoneScreen>
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

// ... existing PhoneScreen and FlyingIcon components ...
function PhoneScreen({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative w-full h-[600px] bg-gray-950 rounded-[55px] shadow-2xl border-[6px] border-[#3b3b3b] overflow-hidden transform-style-3d">
      {/* Titanium Frame Highlights */}
      <div className="absolute inset-0 rounded-[50px] border-[2px] border-[#555555]/40 pointer-events-none z-50"></div>
      <div className="absolute inset-[-2px] rounded-[58px] border-[1px] border-[#1a1a1a] pointer-events-none z-50 opacity-50"></div>

      {/* Inner Bezel (Ultra Thin for iPhone 16 Pro) */}
      <div className="absolute inset-[3px] rounded-[48px] border-[3px] border-black pointer-events-none z-40"></div>

      {/* Dynamic Island */}
      <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-full z-50 flex items-center justify-center">
        {/* Camera/Sensors */}
        <div className="w-20 h-full flex items-center justify-between px-3">
          <div className="w-3 h-3 bg-[#111] rounded-full"></div>
          <div className="w-2 h-2 bg-[#050505] rounded-full"></div>
        </div>
      </div>

      {/* Screen Content Area */}
      <div className="absolute inset-[6px] rounded-[44px] bg-white overflow-hidden mask-image-rounded">
        {children}
      </div>

      {/* Hardware Buttons */}
      <div className="absolute top-[100px] left-[-8px] w-[3px] h-[24px] bg-[#2a2a2a] rounded-l-md border-r border-[#1a1a1a]"></div>
      <div className="absolute top-[140px] left-[-8px] w-[3px] h-[40px] bg-[#2a2a2a] rounded-l-md border-r border-[#1a1a1a]"></div>
      <div className="absolute top-[190px] left-[-8px] w-[3px] h-[40px] bg-[#2a2a2a] rounded-l-md border-r border-[#1a1a1a]"></div>
      <div className="absolute top-[140px] right-[-8px] w-[3px] h-[65px] bg-[#2a2a2a] rounded-r-md border-l border-[#1a1a1a]"></div>
      <div className="absolute bottom-[100px] right-[-4px] w-[4px] h-[65px] bg-[#1a1a1a] rounded-r-md shadow-inner border-l border-gray-800"></div>

      {/* Screen Reflection/Gloss */}
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
          {/* Main Point (Bullet + Blob) */}
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-400 mt-3 shrink-0" />
            <motion.div
              layoutId={`main-${i}`}
              className="h-8 w-full bg-blue-100 rounded-lg"
              animate={{
                backgroundColor: stage === 0 ? '#DBEAFE' : '#EFF6FF'
              }}
            />
          </div>

          {/* Sub Points */}
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
                    {/* Sub Point */}
                    <div className="flex items-center gap-3 pl-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
                      <div className="h-6 w-3/4 bg-blue-50 rounded-md" />
                    </div>

                    {/* Details */}
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
