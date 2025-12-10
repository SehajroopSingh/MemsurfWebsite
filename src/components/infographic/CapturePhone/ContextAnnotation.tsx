'use client'

import { motion, AnimatePresence } from 'framer-motion'

type ContextAnnotationProps = {
    show: boolean
}

export default function ContextAnnotation({ show }: ContextAnnotationProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="absolute right-[-220px] top-[45%] w-[220px] z-50 pointer-events-none hidden md:block"
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
    )
}
