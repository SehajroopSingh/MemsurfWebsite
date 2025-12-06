import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DepthVisualization({ stage }: { stage: number }) {
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
