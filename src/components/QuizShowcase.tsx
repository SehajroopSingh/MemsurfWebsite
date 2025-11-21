'use client'

import { CheckCircle2, List, ArrowRightLeft, Hash } from 'lucide-react'
import { motion } from 'framer-motion'

const quizTypes = [
  {
    type: 'Multiple Choice',
    icon: CheckCircle2,
    example: 'What is the capital of France?',
    options: ['Paris', 'London', 'Berlin', 'Madrid'],
    color: 'blue',
  },
  {
    type: 'Fill in the Blank',
    icon: Hash,
    example: 'The process of converting light energy into chemical energy is called ______.',
    answer: 'photosynthesis',
    color: 'purple',
  },
  {
    type: 'Matching',
    icon: ArrowRightLeft,
    example: 'Match the terms with their definitions',
    pairs: ['Term A → Definition A', 'Term B → Definition B'],
    color: 'green',
  },
  {
    type: 'Ordering',
    icon: List,
    example: 'Arrange these historical events in chronological order',
    items: ['Event 1', 'Event 2', 'Event 3'],
    color: 'orange',
  },
]

export default function QuizShowcase() {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Diverse Quiz Types for
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Every Learning Style</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our AI generates multiple question formats to keep learning engaging and effective
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {quizTypes.map((quiz, index) => {
            const Icon = quiz.icon
            const colorClasses = {
              blue: 'bg-blue-50 border-blue-200 text-blue-600',
              purple: 'bg-purple-50 border-purple-200 text-purple-600',
              green: 'bg-green-50 border-green-200 text-green-600',
              orange: 'bg-orange-50 border-orange-200 text-orange-600',
            }
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-lg ${colorClasses[quiz.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{quiz.type}</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-700 font-medium">{quiz.example}</p>
                  {quiz.options && (
                    <div className="space-y-2">
                      {quiz.options.map((option, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg border ${
                            i === 0 ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <span className="text-gray-700">{option}</span>
                          {i === 0 && (
                            <span className="ml-2 text-sm text-blue-600 font-semibold">✓ Correct</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {quiz.answer && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <span className="text-purple-700 font-semibold">Answer: {quiz.answer}</span>
                    </div>
                  )}
                  {quiz.pairs && (
                    <div className="space-y-2">
                      {quiz.pairs.map((pair, i) => (
                        <div key={i} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <span className="text-gray-700">{pair}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {quiz.items && (
                    <div className="space-y-2">
                      {quiz.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-200 text-orange-700 font-bold">
                            {i + 1}
                          </span>
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">And many more quiz types including:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['True/False', 'Case Studies', 'Short Answer', 'Highlight Error', 'Sorting'].map((type, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

