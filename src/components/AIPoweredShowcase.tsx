'use client'

import { Brain, Layers, Target, Sparkles, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const aiFeatures = [
  {
    icon: Brain,
    title: 'Content Classification',
    description: 'Automatically categorizes and organizes your learning materials by topic, difficulty, and subject matter.',
    color: 'blue',
  },
  {
    icon: Layers,
    title: 'Main Points Extraction',
    description: 'Identifies and extracts key concepts, main points, and subpoints from any content automatically.',
    color: 'purple',
  },
  {
    icon: Target,
    title: 'Adaptive Difficulty',
    description: 'Adjusts quiz difficulty based on your performance, ensuring optimal challenge and learning pace.',
    color: 'green',
  },
  {
    icon: Sparkles,
    title: 'Subpoint Generation',
    description: 'Breaks down complex topics into digestible subpoints and details for comprehensive understanding.',
    color: 'orange',
  },
]

const processFlow = [
  { step: 'Input', description: 'Raw content' },
  { step: 'Analysis', description: 'AI processes' },
  { step: 'Structure', description: 'Organized hierarchy' },
  { step: 'Generate', description: 'Quizzes & materials' },
]

export default function AIPoweredShowcase() {
  return (
    <section className="py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-app-text mb-4">
            Powered by
            <span className="bg-gradient-to-r from-app-softBlue to-app-violet bg-clip-text text-transparent"> Advanced AI</span>
          </h2>
          <p className="text-xl text-app-textMuted max-w-2xl mx-auto">
            Intelligent algorithms that understand, organize, and transform your content into effective learning materials
          </p>
        </div>

        {/* AI Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {aiFeatures.map((feature, index) => {
            const Icon = feature.icon
            const colorClasses = {
              blue: 'bg-app-softBlue/15 border-app-border text-app-softBlue',
              purple: 'bg-app-violet/15 border-app-border text-app-lavender',
              green: 'bg-app-mint/15 border-app-border text-app-mint',
              orange: 'bg-app-lilac/15 border-app-border text-app-lilac',
            }
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-app-surfaceElevated rounded-xl p-6 border-2 border-app-border hover:border-app-softBlue hover:shadow-lg transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-lg ${colorClasses[feature.color as keyof typeof colorClasses]} mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-app-text mb-2">{feature.title}</h3>
                <p className="text-app-textMuted text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Process Flow */}
        <div className="bg-gradient-to-br from-app-softBlue/15 via-app-violet/15 to-app-mint/10 rounded-2xl p-8 md:p-12 border border-app-border">
          <h3 className="text-2xl font-bold text-app-text mb-8 text-center">
            AI Processing Flow
          </h3>
          <div className="relative">
            {/* Flow Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-app-softBlue/40 via-app-violet/40 to-app-mint/40 transform -translate-y-1/2"></div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
              {processFlow.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-app-softBlue to-app-violet border-4 border-app-canvas shadow-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{index + 1}</span>
                    </div>
                    {index < processFlow.length - 1 && (
                      <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                        <ArrowRight className="w-6 h-6 text-app-lavender" />
                      </div>
                    )}
                  </div>
                  <div className="text-lg font-bold text-app-text mb-1">{item.step}</div>
                  <div className="text-sm text-app-textMuted">{item.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 p-6 bg-app-surfaceElevated/90 backdrop-blur-sm rounded-xl border border-app-border">
            <div className="flex items-start gap-4">
              <Brain className="w-8 h-8 text-app-lavender flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-bold text-app-text mb-2">Intelligent Learning System</h4>
                <p className="text-app-textMuted leading-relaxed">
                  Our AI doesn't just generate questions—it understands context, identifies relationships between concepts,
                  and creates a comprehensive learning hierarchy. From raw text to structured knowledge, every step is
                  optimized for maximum retention and understanding.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

