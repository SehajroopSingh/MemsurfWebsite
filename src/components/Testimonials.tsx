'use client'

import { Star, Quote } from 'lucide-react'
import { motion } from 'framer-motion'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Medical Student',
    content: 'Memsurf has completely transformed how I study. The AI-generated quizzes from my lecture notes are incredibly accurate, and the spaced repetition system has helped me retain information so much better.',
    rating: 5,
    avatar: 'SC',
  },
  {
    name: 'Michael Rodriguez',
    role: 'Software Engineer',
    content: 'As someone learning new technologies constantly, the quick capture feature is a game-changer. I can paste documentation and get structured learning materials in seconds. The adaptive difficulty keeps me challenged.',
    rating: 5,
    avatar: 'MR',
  },
  {
    name: 'Emily Johnson',
    role: 'Language Learner',
    content: 'The variety of quiz types keeps learning engaging. I love how the system adapts to my progress and schedules reviews at the perfect times. My retention has improved dramatically.',
    rating: 5,
    avatar: 'EJ',
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            1000s of thousands of lessons created, and millions of quizzes created by users.
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what learners are saying about their experience with Memsurf
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="group relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-emerald-500/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                <div className="relative bg-white/80 backdrop-blur border border-gray-200/80 rounded-3xl p-8 shadow-sm group-hover:border-blue-200 group-hover:shadow-xl transition-all duration-500">
                  <Quote className="absolute top-6 right-6 w-8 h-8 text-gray-200" />

                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-gray-700 mb-6 leading-relaxed relative z-10">
                    "{testimonial.content}"
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
