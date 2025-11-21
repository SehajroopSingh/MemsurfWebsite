'use client'

import { TrendingUp, Calendar, Target, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const benefits = [
  {
    icon: TrendingUp,
    stat: '200%',
    description: 'Increase in retention rate',
    color: 'blue',
  },
  {
    icon: Calendar,
    stat: 'Optimal',
    description: 'Review timing algorithm',
    color: 'purple',
  },
  {
    icon: Target,
    stat: 'Science',
    description: 'Backed by research',
    color: 'green',
  },
  {
    icon: Zap,
    stat: 'Efficient',
    description: 'Minimal study time',
    color: 'orange',
  },
]

const timelineData = [
  { day: 1, review: true, strength: 100 },
  { day: 2, review: false, strength: 80 },
  { day: 3, review: false, strength: 60 },
  { day: 7, review: true, strength: 100 },
  { day: 14, review: false, strength: 85 },
  { day: 30, review: true, strength: 100 },
]

export default function SpacedRepetitionShowcase() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Master Knowledge with
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Spaced Repetition</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Science-backed scheduling that optimizes review timing to maximize long-term retention
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-600 border-blue-200',
              purple: 'bg-purple-50 text-purple-600 border-purple-200',
              green: 'bg-green-50 text-green-600 border-green-200',
              orange: 'bg-orange-50 text-orange-600 border-orange-200',
            }
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`p-6 rounded-xl border-2 ${colorClasses[benefit.color as keyof typeof colorClasses]} text-center`}
              >
                <Icon className="w-8 h-8 mx-auto mb-3" />
                <div className="text-3xl font-bold mb-1">{benefit.stat}</div>
                <div className="text-sm text-gray-600">{benefit.description}</div>
              </motion.div>
            )
          })}
        </div>

        {/* Timeline Visualization */}
        <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            How Spaced Repetition Works
          </h3>
          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 transform -translate-y-1/2"></div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 relative">
              {timelineData.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-4">
                    <div
                      className={`w-12 h-12 mx-auto rounded-full border-4 flex items-center justify-center ${
                        item.review
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-white shadow-lg'
                          : 'bg-gray-100 border-gray-300'
                      }`}
                    >
                      {item.review && (
                        <Zap className="w-6 h-6 text-white" />
                      )}
                    </div>
                    {item.review && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">Day {item.day}</div>
                  <div className="text-xs text-gray-500">
                    {item.review ? 'Review' : 'Rest'}
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-medium text-gray-600">
                      Strength: {item.strength}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div
                        className={`h-1.5 rounded-full ${
                          item.strength >= 90
                            ? 'bg-gradient-to-r from-blue-500 to-green-500'
                            : item.strength >= 70
                            ? 'bg-yellow-500'
                            : 'bg-orange-500'
                        }`}
                        style={{ width: `${item.strength}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <p className="text-gray-700 text-center leading-relaxed">
              <span className="font-semibold">The Science:</span> Our algorithm uses the forgetting curve to schedule reviews
              at optimal intervals. Each review strengthens your memory, making the next interval longer and more efficient.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

