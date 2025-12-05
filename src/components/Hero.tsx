'use client'

import { motion } from 'framer-motion'
import MemoryGame from './MemoryGame'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-12 bg-black">
      {/* Dark Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 via-black to-black opacity-50"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzMzMiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Column: Copy */}
          <div className="text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/10 border border-yellow-400/50 rounded-none mb-8"
            >
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Status: Critical Failure</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tighter text-white"
            >
              YOUR BRAIN IS A <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">SIEVE.</span>
              <br />
              WE FIXED IT.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-400 mb-10 max-w-xl leading-relaxed font-mono"
            >
              You forgot what you ate for breakfast. Do you really think you'll remember that article in a week? <span className="text-white font-bold">Cute.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button className="px-8 py-4 bg-white text-black font-black text-lg hover:bg-gray-200 transition-colors uppercase tracking-widest">
                Fix Your Brain
              </button>
              <button className="px-8 py-4 bg-transparent text-gray-600 font-bold text-lg border border-gray-800 hover:border-gray-600 hover:text-gray-400 transition-all uppercase tracking-widest">
                Stay Forgetful
              </button>
            </motion.div>
          </div>

          {/* Right Column: Game */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/20 to-purple-500/20 blur-xl rounded-full opacity-50"></div>
            <MemoryGame />
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-600 font-mono uppercase">
                Beat Level 5 and we'll stop judging you.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

