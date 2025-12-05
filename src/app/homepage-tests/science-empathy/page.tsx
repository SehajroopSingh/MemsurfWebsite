import Navigation from '@/components/Navigation'
import ResearchSection from '@/components/ResearchSection'
import EmotionalFeedback from '@/components/EmotionalFeedback'
import EmpathyFeatures from '@/components/EmpathyFeatures'
import EmpathyCTA from '@/components/EmpathyCTA'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function ScienceEmpathyHome() {
    return (
        <main className="min-h-screen bg-white">
            <Navigation />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full mb-8">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-bold">Radical Honesty + Radical Empathy</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 tracking-tight">
                    You're not stupid.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        Your brain is just outdated.
                    </span>
                </h1>

                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
                    We built this because we felt dumb too. We kept forgetting things we *just* read.
                    Then we looked at the science and realized: it wasn't us. It was the method.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                        Upgrade Your Hardware
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <button className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all">
                        Read the Research
                    </button>
                </div>
            </section>

            <EmpathyFeatures />
            <ResearchSection />
            <EmpathyCTA />
            <EmotionalFeedback />
        </main>
    )
}
