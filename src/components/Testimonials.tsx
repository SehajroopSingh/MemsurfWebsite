'use client'

import { Star, Quote, ArrowUpRight } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Medical Student',
    content: "Memsurf has completely transformed how I study. The AI-generated quizzes from my lecture notes are incredibly accurate, and the spaced repetition system has helped me retain information so much better.",
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
    tag: 'Student'
  },
  {
    name: 'Michael Rodriguez',
    role: 'Software Engineer',
    content: "As someone learning new technologies constantly, the quick capture feature is a game-changer. I can paste documentation and get structured learning materials in seconds.",
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
    tag: 'Engineer'
  },
  {
    name: 'Emily Johnson',
    role: 'Language Learner',
    content: "The variety of quiz types keeps learning engaging. I love how the system adapts to my progress and schedules reviews at the perfect times. My retention has improved dramatically.",
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150',
    tag: 'Language'
  },
]

export default function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])

  return (
    <section ref={containerRef} className="relative py-32 bg-black text-white overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-10">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-6"
            >
              LEARNING<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">EVOLVED.</span>
            </motion.h2>
            <p className="text-xl text-gray-400 max-w-lg leading-relaxed border-l-2 border-white/20 pl-6">
              Join the new wave of learners who have ditched static notes for active recall.
            </p>
          </div>

          <div className="flex gap-12 text-right hidden md:block">
            <div>
              <div className="text-4xl font-mono font-bold">1M+</div>
              <div className="text-sm text-gray-500 uppercase tracking-widest mt-1">Users</div>
            </div>
            <div>
              <div className="text-4xl font-mono font-bold">10M+</div>
              <div className="text-sm text-gray-500 uppercase tracking-widest mt-1">Quizzes</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative flex flex-col justify-between h-full min-h-[400px] p-8 bg-zinc-900/50 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-colors duration-500"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowUpRight className="w-6 h-6 text-white/50" />
              </div>

              <div className="relative">
                <Quote className="w-10 h-10 text-blue-500 mb-8 opacity-50" />
                <p className="text-xl md:text-2xl font-light leading-snug text-gray-200">
                  {testimonial.content}
                </p>
              </div>

              <div className="mt-12 flex items-center gap-4 pt-6 border-t border-white/10">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20 grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div>
                  <div className="font-bold text-white tracking-wide">{testimonial.name}</div>
                  <div className="text-sm font-mono text-blue-400">{testimonial.role}</div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-white text-white" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
