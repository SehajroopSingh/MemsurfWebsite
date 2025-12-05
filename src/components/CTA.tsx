'use client'

import { ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CTA() {
  return (
    <section className="py-24 bg-yellow-400 relative overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-none mb-8"
        >
          <span className="text-sm font-bold uppercase tracking-wider">Offer Expires: Eventually</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-black mb-6 uppercase tracking-tighter"
        >
          Give us your money.
          <br />
          <span className="text-3xl md:text-5xl opacity-50">Or don't.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-black/80 mb-10 max-w-2xl mx-auto font-mono"
        >
          We're going to be rich either way. But you might be smarter if you click the button.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button className="group px-8 py-4 bg-black text-white rounded-none font-bold text-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 uppercase tracking-widest">
            Take My Money
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 bg-transparent text-black border-2 border-black rounded-none font-bold text-lg hover:bg-black hover:text-white transition-all duration-200 uppercase tracking-widest">
            I Hate Learning
          </button>
        </motion.div>

        <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-black/60 font-mono uppercase">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <span>No Refunds (Jk)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <span>It actually works</span>
          </div>
        </div>
      </div>
    </section>
  )
}

