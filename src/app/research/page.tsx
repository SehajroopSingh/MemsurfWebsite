'use client'

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { Brain, Database, FileText, Lightbulb, Link as LinkIcon, Sparkles } from 'lucide-react'

export default function ResearchPage() {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    }

    return (
        <main className="min-h-screen bg-white selection:bg-blue-100">
            <Navigation />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/4"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-pink-100 to-blue-100 rounded-full blur-3xl opacity-50 -translate-x-1/3 translate-y-1/4"></div>
                </div>

                <div className="text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-8 border border-blue-100"
                    >
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">The Science of Learning</span>
                    </motion.div>

                    <motion.h1
                        {...fadeIn}
                        className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight"
                    >
                        Why Most Learning Fades
                        <span className="block mt-2 text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            And Why People Stop Writing Things Down
                        </span>
                    </motion.h1>

                    <motion.p
                        {...fadeIn}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto"
                    >
                        The cognitive science behind Memsurf’s “capture → retrieval → mastery” system.
                        For decades, research has been clear: <strong>If you don't revisit it, you don't remember it.</strong>
                    </motion.p>
                </div>
            </section>

            {/* Main Content */}
            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">

                {/* Section 1 */}
                <Section icon={<Brain className="w-8 h-8 text-purple-600" />} title="1. People only encode information when they expect to use it again">
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                        Cognitive science shows that the brain invests effort only when it predicts future payoff.
                        If a person believes they’ll never revisit their notes, their brain subconsciously labels the effort as wasted.
                    </p>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200 mb-6">
                        <h4 className="font-semibold text-gray-900 mb-4">This dynamic is known as:</h4>
                        <ul className="space-y-4">
                            <ListItem title="The Expected Value of Control model">
                                We exert mental effort only when the outcome seems worthwhile (Shenhav et al., 2013).
                            </ListItem>
                            <ListItem title="Rational Inattention">
                                We avoid storing information that is unlikely to be used later (Sims, 2003; Gabaix, 2014).
                            </ListItem>
                        </ul>
                    </div>
                    <p className="italic text-gray-600">
                        This is why people increasingly avoid writing things down in digital notes: <strong>They know they won’t come back to it.</strong>
                    </p>
                </Section>

                {/* Section 2 */}
                <Section icon={<FileText className="w-8 h-8 text-blue-600" />} title="2. Without structured revision, note-taking collapses">
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                        Decades of learning research shows that note-taking is only effective when followed by review and retrieval.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <FactCard
                            highlight="Students who expect to be tested"
                            detail="Take far better notes and retain more (Agarwal et al., 2008)."
                        />
                        <FactCard
                            highlight="Reviewing notes"
                            detail="Not just writing them — is what actually strengthens memory (Kiewra, 1989)."
                        />
                    </div>
                    <p className="text-xl font-medium text-gray-900 text-center bg-blue-50 py-4 px-6 rounded-xl inline-block w-full">
                        If you don’t revisit it, you don’t remember it.
                    </p>
                </Section>

                {/* Section 3 */}
                <Section icon={<Database className="w-8 h-8 text-pink-600" />} title="3. Knowledge management tools fail because notes never resurface">
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                        Research in Human–Computer Interaction shows that most digital notes are stored once, never looked at again, and ultimately abandoned.
                        This confirms the core behavioral barrier: The <strong>Production Paradox</strong>.
                    </p>
                    <div className="bg-white shadow-lg shadow-gray-200/50 rounded-2xl p-8 border border-gray-100 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-gradient-to-bl from-pink-100 to-transparent w-32 h-32 opacity-50 rounded-bl-full"></div>
                        <blockquote className="text-2xl font-serif text-gray-800 italic relative z-10">
                            “Stuff goes into the computer, but it doesn’t come out.”
                            <footer className="text-sm font-sans text-gray-500 mt-4 not-italic">— Boardman & Sasse, 2004</footer>
                        </blockquote>
                    </div>
                </Section>

                {/* Section 4 */}
                <Section icon={<Lightbulb className="w-8 h-8 text-amber-500" />} title="4. The brain encodes for future relevance">
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                        Neuroscience shows memory is adaptive. The hippocampus prioritizes information the brain expects to matter later.
                        If there is no signal that information will ever return, the brain downregulates encoding.
                    </p>
                    <p className="font-medium text-lg text-gray-900 mb-4">
                        Memory strengthens when retrieval is expected — and weakens when it isn’t.
                    </p>
                </Section>

                {/* Solution Section */}
                <div className="my-24 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 transform skew-y-3 rounded-3xl -z-10 opacity-10"></div>
                    <div className="bg-white rounded-2xl p-10 md:p-14 border border-gray-200 shadow-xl text-center">
                        <div className="inline-block p-4 bg-blue-50 rounded-full mb-6">
                            <Sparkles className="w-12 h-12 text-blue-600" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">How Memsurf Solves This</h2>
                        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                            Memsurf transforms passive notes into active memory by automatically closing the loop that traditional tools never solved.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                            {[
                                "Extracts important knowledge",
                                "Creates structured concepts",
                                "Generates quizzes & lessons",
                                "Surfaces via spaced repetition"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>
                                    <span className="font-medium text-gray-800">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* References */}
                <div className="border-t border-gray-200 pt-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                        <LinkIcon className="w-6 h-6 text-gray-400" />
                        References
                    </h3>
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 text-sm text-gray-600">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Effort, Encoding & Expected Utility</h4>
                            <ul className="space-y-3">
                                <RefLink author="Shenhav et al. (2013)" title="The Expected Value of Control" url="https://doi.org/10.1016/j.neuron.2013.07.039" />
                                <RefLink author="Sims (2003)" title="Implications of rational inattention" url="https://www.princeton.edu/~sims/research/Implications.pdf" />
                                <RefLink author="Gabaix (2014)" title="A sparsity-based model of bounded rationality" url="https://www.aeaweb.org/articles?id=10.1257/aer.104.5.1091" />
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Note-Taking & Retrieval Research</h4>
                            <ul className="space-y-3">
                                <RefLink author="Kiewra (1989)" title="A Review of Note-Taking" url="https://doi.org/10.3102/00346543059002181" />
                                <RefLink author="Agarwal et al. (2008)" title="Examining the Testing Effect" url="https://doi.org/10.1037/0278-7393.34.1.167" />
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">HCI & Knowledge Management Failure</h4>
                            <ul className="space-y-3">
                                <RefLink author="Boardman & Sasse (2004)" title="Stuff goes into the computer..." url="https://doi.org/10.1145/1028014.1028023" />
                                <RefLink author="Chen (2020)" title="Understanding Personal Knowledge Management Tools" url="https://dl.acm.org/doi/10.1145/3313831.3376413" />
                                <RefLink author="Grudin (1988)" title="Why CSCW Applications Fail" url="https://www.researchgate.net/publication/221516398" />
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Neuroscience of Predictive Memory</h4>
                            <ul className="space-y-3">
                                <RefLink author="Friston (2005)" title="A theory of cortical responses" url="https://doi.org/10.1016/j.neuroimage.2005.08.003" />
                                <RefLink author="Shohamy & Adcock (2010)" title="Dopamine and adaptive memory" url="https://doi.org/10.1146/annurev.psych.093008.100445" />
                            </ul>
                        </div>
                    </div>
                </div>

            </article>

            <Footer />
        </main>
    )
}

function Section({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
        >
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white shadow-md rounded-xl border border-gray-100">
                    {icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            <div className="pl-0 md:pl-20">
                {children}
            </div>
        </motion.section>
    )
}

function ListItem({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <li className="flex gap-3">
            <div className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
            <div>
                <span className="font-semibold text-gray-900 block mb-1">{title}</span>
                <span className="text-gray-600">{children}</span>
            </div>
        </li>
    )
}

function FactCard({ highlight, detail }: { highlight: string, detail: string }) {
    return (
        <div className="bg-white p-6 rounded-xl border-l-4 border-blue-500 shadow-sm">
            <p className="font-bold text-gray-900 mb-2">{highlight}</p>
            <p className="text-gray-600 text-sm">{detail}</p>
        </div>
    )
}

function RefLink({ author, title, url }: { author: string, title: string, url: string }) {
    return (
        <li>
            <a href={url} target="_blank" rel="noopener noreferrer" className="group block hover:bg-gray-50 p-2 rounded-lg -ml-2 transition-colors">
                <div className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{title}</div>
                <div className="text-xs text-gray-500 flex items-center justify-between">
                    <span>{author}</span>
                    <ExternalLinkIcon className="opacity-0 group-hover:opacity-100 transition-opacity w-3 h-3" />
                </div>
            </a>
        </li>
    )
}

function ExternalLinkIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M3 2C2.44772 2 2 2.44772 2 3V12C2 12.5523 2.44772 13 3 13H12C12.5523 13 13 12.5523 13 12V8.5C13 8.22386 12.7761 8 12.5 8C12.2239 8 12 8.22386 12 8.5V12H3V3L6.5 3C6.77614 3 7 2.77614 7 2.5C7 2.22386 6.77614 2 6.5 2H3ZM12.8536 2.14645C12.9015 2.19439 12.9377 2.24964 12.9621 2.30861C12.9861 2.36669 12.9996 2.4303 13 2.497V2.5V2.50046V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3.70711L9.35355 6.35355C9.15829 6.54882 8.84171 6.54882 8.64645 6.35355C8.45118 6.15829 8.45118 5.84171 8.64645 5.64645L11.2929 3H9.5C9.22386 3 9 2.77614 9 2.5C9 2.22386 9.22386 2 9.5 2H12.4996H12.5C12.5678 2 12.6324 2.01349 12.6914 2.03794C12.7504 2.06234 12.8056 2.09851 12.8536 2.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
        </svg>
    )
}
