import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { ArrowRight, FlaskConical } from 'lucide-react'

export default function HomepageTests() {
    const tests = [
        {
            id: 'dbrand',
            title: 'Version 1: Dbrand Style',
            description: 'Sarcastic, edgy, and status-driven copy with a dark industrial aesthetic.',
            path: '/homepage-tests/dbrand',
            date: '2025-12-05'
        },
        {
            id: 'science-empathy',
            title: 'Version 2: Empathy & Science',
            description: 'Validating, research-backed, and emotionally intelligent. "You\'re not stupid, just outdated."',
            path: '/homepage-tests/science-empathy',
            date: '2025-12-05'
        },
        {
            id: 'boy-coded',
            title: 'Version 3: Boy Coded (The Arena)',
            description: 'Cyberpunk, competitive, stats-heavy. "Min-max your brain."',
            path: '/homepage-tests/boy-coded',
            date: '2025-12-05'
        },
        {
            id: 'girl-coded',
            title: 'Version 4: Girl Coded (The Dreamscape)',
            description: 'Cozy, pastel, manifestation vibes. "Romanticize your study session."',
            path: '/homepage-tests/girl-coded',
            date: '2025-12-05'
        },
        {
            id: 'idgaf-coded',
            title: 'Version 5: Idgaf Coded (The Void)',
            description: 'Brutalist, chaotic, indifferent. "Learn stuff. Or don\'t."',
            path: '/homepage-tests/idgaf-coded',
            date: '2025-12-05'
        },
        {
            id: 'persona-based',
            title: 'Version 6: Persona-Based (Psychology)',
            description: 'Starts with a quiz. Adapts to 6 archetypes (Architect, Berserker, Survivor, etc.).',
            path: '/homepage-tests/persona-based',
            date: '2025-12-05'
        }
    ]

    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FlaskConical className="w-6 h-6 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Homepage Experiments</h1>
                    </div>
                    <p className="text-xl text-gray-600 max-w-2xl">
                        A collection of different homepage iterations and design tests.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tests.map((test) => (
                        <Link
                            key={test.id}
                            href={test.path}
                            className="block group bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {test.date}
                                </span>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {test.title}
                            </h3>
                            <p className="text-gray-600">
                                {test.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    )
}
