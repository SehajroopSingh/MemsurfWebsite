'use client'

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { BookOpen, Brain, CheckCircle2, Clock, Layers, Lightbulb, Sparkles, Target, Zap } from 'lucide-react'

export default function MethodPage() {
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
                        <span className="text-sm font-medium text-blue-800">The MemSurf Method</span>
                    </motion.div>

                    <motion.h1
                        {...fadeIn}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight text-gray-900"
                    >
                        How MemSurf Turns Your Notes Into
                        <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Lessons, Quizzes & Lasting Memory
                        </span>
                    </motion.h1>

                    <motion.p
                        {...fadeIn}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-10"
                    >
                        Learning that adapts to you—your goals, your context, your pace.
                        Everything in MemSurf starts with <strong>your own content</strong>. You send us notes, articles, lectures, voice memos—anything you want to learn.
                    </motion.p>

                    <motion.p
                        {...fadeIn}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto"
                    >
                        Our AI builds personalized lessons and quizzes that reflect your wording, your context, and your examples, instead of generic textbook templates.
                        Each lesson is grounded in real learning science: we break your material down into clear main ideas, subpoints, and details, then deliver them in micro-lessons that use retrieval cues, desirable difficulty, and contrast-based learning.
                    </motion.p>
                </div>
            </section>

            {/* Main Content */}
            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">

                {/* The Result */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-blue-50 border border-blue-100 rounded-2xl p-8 mb-20 text-center"
                >
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">The Result?</h3>
                    <p className="text-xl text-blue-800 font-medium">
                        You learn faster, remember longer, and actually understand what you captured.
                    </p>
                </motion.div>

                {/* Step 1: Lessons */}
                <Section icon={<BookOpen className="w-8 h-8 text-blue-600" />} title="Step 1: Lessons Built for Understanding (Not Overload)">
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                        Our lesson engine transforms your content into short, teachable sections.
                        Every micro-lesson uses proven pedagogical techniques:
                    </p>
                    <div className="grid gap-4 mb-8">
                        <ListItem title="Chunking & clarity">
                            Breaking long content into digestible pieces
                        </ListItem>
                        <ListItem title="Retrieval cues">
                            Building mini-prompts that help your brain store and recall
                        </ListItem>
                        <ListItem title="Contrast & examples">
                            Showing what a concept is and what it isn’t
                        </ListItem>
                        <ListItem title="Common pitfalls">
                            Highlighting likely mistakes before they happen
                        </ListItem>
                        <ListItem title="Micro challenges">
                            Tiny “pause and think” moments that boost retention
                        </ListItem>
                    </div>
                    <p className="text-lg font-medium text-gray-900 border-l-4 border-blue-500 pl-4 py-1">
                        You learn just enough each day to make progress—without feeling overwhelmed.
                    </p>
                </Section>

                {/* Step 2: Quizzes */}
                <Section icon={<Brain className="w-8 h-8 text-purple-600" />} title="Step 2: Quizzes That Grow With You">
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                        MemSurf quizzes aren’t random. They follow a research-backed progression that moves from
                        <strong> basic recognition → analytical thinking → higher-order retrieval → applied mastery</strong>.
                    </p>

                    <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-amber-500" />
                            Why this flow?
                        </h4>
                        <p className="text-gray-600 mb-4">
                            This flow is inspired directly by cognitive science:
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex gap-2 items-start">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                <span><strong>Retrieval practice</strong> boosts long-term memory (the brain strengthens pathways each time you bring info back from memory)</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                <span><strong>Low-stakes quizzes</strong> reduce forgetting and increase confidence</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                <span><strong>Varying question types</strong> trains flexible understanding</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                <span><strong>Effortful recall</strong> creates durable learning (“desirable difficulty”)</span>
                            </li>
                        </ul>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-6">Your Quiz Progression</h3>

                    <div className="space-y-6">
                        <QuizLevel
                            level={1}
                            title="Foundational Understanding"
                            difficulty="Easy Difficulty"
                            description="Helps your brain recognize the core ideas. These build familiarity while keeping cognitive load low—critical for early learning."
                            types={["True / False", "Multiple Choice Questions (MCQs)", "Basic Identification (“Which of these is…?”)", "Simple Matching"]}
                            color="blue"
                        />
                        <QuizLevel
                            level={2}
                            title="Analytical Understanding"
                            difficulty="Medium Difficulty"
                            description="Now we challenge your reasoning—not just recognition. These question types deepen comprehension, catch misconceptions early, and force you to actively manipulate the idea instead of passively recognizing it."
                            types={["Find the Error", "Fill in the Blank", "Ordering / Sequencing", "Highlighting Key Ideas"]}
                            color="indigo"
                        />
                        <QuizLevel
                            level={3}
                            title="Retrieval & Higher Difficulty Questions"
                            difficulty="Hard Difficulty"
                            description="This is where real learning happens: you recall information without cues. This type of retrieval is the most powerful memory technique we know. These questions activate deeper neural pathways, making the memory more stable and long-lasting."
                            types={["Short Answer Questions", "Explain-in-your-own-words", "Mini Case Studies", "“Why is this important?” reasoning prompts"]}
                            color="purple"
                        />
                        <QuizLevel
                            level={4}
                            title="Applied Mastery"
                            difficulty="Expert Difficulty"
                            description="Once you’ve demonstrated understanding and recall, we test real-world application. These reinforce the ability to use knowledge, not just remember it."
                            types={["Scenario Analysis (“What would you do in this situation?”)", "Error Diagnosis in complex cases", "Analogical reasoning (“Which example fits this principle?”)"]}
                            color="pink"
                        />
                    </div>
                </Section>

                {/* Step 3: Spaced Repetition */}
                <Section icon={<Clock className="w-8 h-8 text-green-600" />} title="Step 3: Spaced Repetition That Never Lets You Forget">
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                        Every quiz you answer feeds into your personal memory model.
                        We track what you know, what you’re shaky on, and what you’ve forgotten—and then schedule each concept at the perfect interval.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-gray-900 mb-2">Why spaced repetition?</h4>
                            <p className="text-gray-600">
                                Because forgetting is natural. But reviewing at the right moment interrupts that forgetting curve and makes the memory permanent.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-gray-900 mb-2">The Science</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0" />
                                    Retrieval at spaced intervals dramatically increases long-term retention.
                                </li>
                                <li className="flex gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0" />
                                    The harder the recall (but still possible), the stronger the memory becomes.
                                </li>
                                <li className="flex gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0" />
                                    Small, well-timed reviews outperform long, crammed study sessions.
                                </li>
                            </ul>
                        </div>
                    </div>

                    <p className="text-lg font-medium text-gray-900">
                        MemSurf combines spaced repetition with escalating difficulty to keep your learning sharp, efficient, and effortless.
                    </p>
                </Section>

                {/* Conclusion */}
                <div className="my-24 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 transform -skew-y-2 rounded-3xl -z-10 opacity-10"></div>
                    <div className="bg-white rounded-2xl p-10 md:p-14 border border-gray-200 shadow-xl text-center">
                        <div className="inline-block p-4 bg-purple-50 rounded-full mb-6">
                            <Layers className="w-12 h-12 text-purple-600" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">A Learning System That Works With Your Brain</h2>

                        <div className="flex flex-wrap justify-center items-center gap-2 text-sm md:text-base font-medium text-gray-600 mb-10">
                            <span>Content</span>
                            <span className="text-gray-300">→</span>
                            <span className="text-blue-600">Lessons</span>
                            <span className="text-gray-300">→</span>
                            <span className="text-purple-600">Progressive Quizzes</span>
                            <span className="text-gray-300">→</span>
                            <span className="text-green-600">Spaced Review</span>
                            <span className="text-gray-300">→</span>
                            <span className="text-pink-600 font-bold">Mastery</span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto mb-10">
                            <CheckItem text="Lessons build clarity." />
                            <CheckItem text="Quizzes strengthen memory and expose gaps." />
                            <CheckItem text="Spaced repetition keeps everything alive." />
                            <CheckItem text="Higher-order questions push you into deep understanding." />
                        </div>

                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-medium">
                            <span>Most apps only give flashcards. We give you a full learning system.</span>
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
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="mb-24"
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white shadow-md rounded-xl border border-gray-100 shrink-0">
                    {icon}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{title}</h2>
            </div>
            <div className="pl-0 md:pl-20">
                {children}
            </div>
        </motion.section>
    )
}

function ListItem({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="mt-1.5 w-2 h-2 bg-blue-500 rounded-full shrink-0" />
            <div>
                <span className="font-bold text-gray-900 block mb-1">{title}</span>
                <span className="text-gray-600">{children}</span>
            </div>
        </div>
    )
}

function QuizLevel({ level, title, difficulty, description, types, color }: {
    level: number,
    title: string,
    difficulty: string,
    description: string,
    types: string[],
    color: string
}) {
    const colorClasses = {
        blue: "bg-blue-50 border-blue-100 text-blue-700",
        indigo: "bg-indigo-50 border-indigo-100 text-indigo-700",
        purple: "bg-purple-50 border-purple-100 text-purple-700",
        pink: "bg-pink-50 border-pink-100 text-pink-700"
    }[color] || "bg-gray-50 border-gray-100 text-gray-700"

    const numberColor = {
        blue: "bg-blue-600",
        indigo: "bg-indigo-600",
        purple: "bg-purple-600",
        pink: "bg-pink-600"
    }[color] || "bg-gray-600"

    return (
        <div className="relative pl-8 border-l-2 border-dashed border-gray-200 pb-8 last:pb-0 last:border-l-0">
            <div className={`absolute top-0 left-[-17px] w-8 h-8 rounded-full ${numberColor} text-white flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-white`}>
                {level}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h5 className="text-xl font-bold text-gray-900">{title}</h5>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colorClasses}`}>
                        {difficulty}
                    </span>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                    {description}
                </p>

                <div className="bg-gray-50 rounded-lg p-4">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Question Types include:</span>
                    <div className="grid sm:grid-cols-2 gap-2">
                        {types.map((type, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                <Target className="w-3.5 h-3.5 text-gray-400" />
                                {type}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function CheckItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-gray-700">{text}</span>
        </div>
    )
}
