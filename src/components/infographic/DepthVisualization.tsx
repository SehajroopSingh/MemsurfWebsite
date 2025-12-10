import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DepthVisualization({ stage }: { stage: number }) {
    return (
        <div className="w-full h-full flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
            {[1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    layout
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="relative"
                >
                    <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                        <motion.div
                            layoutId={`main-${i}`}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="h-6 w-full rounded-lg backdrop-blur-md border border-blue-200/50 shadow-sm"
                            animate={{ 
                                backgroundColor: stage === 0 ? 'rgba(219, 234, 254, 0.6)' : 'rgba(239, 246, 255, 0.6)'
                            }}
                        />
                    </div>
                    <AnimatePresence>
                        {stage >= 1 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                className="pl-2 border-l border-gray-100 ml-2.5 mt-2 space-y-2"
                            >
                                {[1, 2].map((j) => (
                                    <div key={j} className="space-y-1.5">
                                        <div className="flex items-center gap-2 pl-2">
                                            <div className="w-1 h-1 rounded-full bg-blue-300 shrink-0" />
                                            <div className="h-4 w-3/4 rounded-md backdrop-blur-md bg-blue-50/60 border border-blue-200/40 shadow-sm" />
                                        </div>
                                        <AnimatePresence>
                                            {stage >= 2 && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                                    className="pl-4 space-y-1"
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-0.5 h-0.5 rounded-full bg-gray-300 shrink-0" />
                                                        <div className="h-3 w-full rounded-sm backdrop-blur-md bg-gray-50/60 border border-gray-200/40 shadow-sm" />
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-0.5 h-0.5 rounded-full bg-gray-300 shrink-0" />
                                                        <div className="h-3 w-5/6 rounded-sm backdrop-blur-md bg-gray-50/60 border border-gray-200/40 shadow-sm" />
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
