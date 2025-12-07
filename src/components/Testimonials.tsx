'use client'

import { Star, Quote, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRef } from 'react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Medical Student',
    content: 'Memsurf has completely transformed how I study. The AI-generated quizzes from my lecture notes are incredibly accurate, and the spaced repetition system has helped me retain information so much better.',
    rating: 5,
    avatar: 'SC',
    gradient: 'from-blue-500 to-cyan-400'
  },
  {
    name: 'Michael Rodriguez',
    role: 'Software Engineer',
    content: 'As someone learning new technologies constantly, the quick capture feature is a game-changer. I can paste documentation and get structured learning materials in seconds. The adaptive difficulty keeps me challenged.',
    rating: 5,
    avatar: 'MR',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    name: 'Emily Johnson',
    role: 'Language Learner',
    content: 'The variety of quiz types keeps learning engaging. I love how the system adapts to my progress and schedules reviews at the perfect times. My retention has improved dramatically.',
    rating: 5,
    avatar: 'EJ',
    gradient: 'from-emerald-500 to-teal-400'
  },
]

export default function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <section id="testimonials" className="relative py-32 overflow-hidden bg-gray-50/50">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>Trusted by thousands of learners</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight"
          >
            Loved by students,<br className="hidden md:block" /> engineers, and lifelong learners.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Join millions of users who are mastering new subjects faster with Memsurf's adaptive learning platform.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: index * 0.2 }}
            >
              <div className="group h-full relative">
                {/* Card Hover Gradient */}
                <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-5 blur-xl transition-opacity duration-700`} />

                <div className="h-full relative bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100 transition-all duration-500 group-hover:shadow-xl group-hover:translate-y-[-4px]">
                  {/* Quote Icon */}
                  <div className="mb-8 relative">
                    <div className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br ${testimonial.gradient} opacity-10 rounded-full blur-xl`} />
                    <Quote className="relative w-10 h-10 text-gray-300 transform group-hover:scale-110 transition-transform duration-500" />
                  </div>

                  {/* Content */}
                  <div className="mb-8">
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed font-medium">
                      "{testimonial.content}"
                    </p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-4 mt-auto border-t border-gray-50 pt-6">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                      <div className="text-sm text-gray-500 font-medium">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Statistics Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24 pt-12 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          {[
            { label: 'Lessons Created', value: '100k+', suffix: 'Thousands' },
            { label: 'Quizzes Taken', value: '5M+', suffix: 'Millions' },
            { label: 'Active Learners', value: '50k+', suffix: 'Growing' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
