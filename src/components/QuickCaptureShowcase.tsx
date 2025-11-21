'use client'

import { FileText, Sparkles, BookOpen, ArrowRight } from 'lucide-react'

const steps = [
  {
    step: 1,
    title: 'Capture Content',
    description: 'Paste text, add links, or upload documents',
    icon: FileText,
    content: 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.',
    color: 'blue',
  },
  {
    step: 2,
    title: 'AI Processing',
    description: 'Our AI analyzes and structures your content',
    icon: Sparkles,
    content: 'Main Points:\n• Machine learning is a subset of AI\n• Systems learn from experience\n• No explicit programming needed',
    color: 'purple',
  },
  {
    step: 3,
    title: 'Ready to Learn',
    description: 'Get quizzes, flashcards, and study materials',
    icon: BookOpen,
    content: 'Quiz: What is machine learning?\nA) A programming language\nB) A subset of AI that learns from experience ✓\nC) A database system',
    color: 'green',
  },
]

export default function QuickCaptureShowcase() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            From Text to
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Structured Learning</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform any content into interactive learning materials in seconds
          </p>
        </div>

        <div className="relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 transform -translate-y-1/2"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => {
              const Icon = step.icon
              const colorClasses = {
                blue: 'bg-blue-50 border-blue-200 text-blue-600',
                purple: 'bg-purple-50 border-purple-200 text-purple-600',
                green: 'bg-green-50 border-green-200 text-green-600',
              }
              return (
                <div key={index} className="relative">
                  <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                    {/* Step Number */}
                    <div className="flex items-center justify-between mb-6">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full ${colorClasses[step.color as keyof typeof colorClasses]} border-2`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-2xl font-bold text-gray-300">0{step.step}</span>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 mb-6">{step.description}</p>

                    {/* Content Preview */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                        {step.content}
                      </pre>
                    </div>
                  </div>

                  {/* Arrow (hidden on last item) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <div className="bg-white p-2 rounded-full border-2 border-gray-200">
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="text-gray-700 font-semibold">
              From text to structured learning in seconds
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

