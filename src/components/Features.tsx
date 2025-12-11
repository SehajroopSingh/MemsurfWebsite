'use client'

import { Brain, Zap, Calendar, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAmplitude } from '@/hooks/useAmplitude'

const features = [
  {
    icon: Brain,
    title: 'AI GENERATION',
    description: 'We generate the quizzes. You just click the buttons. It\'s almost too easy for you.',
    gradient: 'from-gray-800 to-gray-900',
  },
  {
    icon: Zap,
    title: 'QUICK CAPTURE',
    description: 'Save it now. Read it never. We know your habits.',
    gradient: 'from-gray-800 to-gray-900',
  },
  {
    icon: Calendar,
    title: 'SPACED REPETITION',
    description: 'We\'ll annoy you with notifications until you actually learn it. You\'re welcome.',
    gradient: 'from-gray-800 to-gray-900',
  },
  {
    icon: TrendingUp,
    title: 'SMART INSIGHTS',
    description: 'Graphs that show exactly how much you\'re procrastinating.',
    gradient: 'from-gray-800 to-gray-900',
  },
]

export default function Features() {
  const { track } = useAmplitude()

  const handleFeatureView = (featureTitle: string) => {
    track('feature_viewed', {
      feature_name: featureTitle.toLowerCase().replace(/\s+/g, '_'),
      location: 'features_section'
    })
  }

  return (
    <section id="features" className="py-24 bg-black border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">
            We did the work.
            <span className="text-gray-500 block text-2xl mt-2 font-mono font-normal">So you don't have to.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onViewportEnter={() => handleFeatureView(feature.title)}
                className="group relative p-8 bg-gray-900/20 border border-gray-800 hover:border-white/50 hover:bg-gray-900/40 transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-none bg-white/5 mb-6 group-hover:bg-white/10 transition-colors duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wide font-mono">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed font-mono text-sm">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

