import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navigation />
      <section className="flex-1 pt-24 pb-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            About Memsurf
          </h1>
          <p className="text-gray-700 text-lg mb-4">
            Memsurf is an adaptive learning platform that helps you turn any content
            into interactive quizzes, and master knowledge with spaced repetition.
          </p>
          <p className="text-gray-700 text-lg">
            Our mission is to make high-quality, active learning accessible to everyone—
            from students and professionals to lifelong learners. We&apos;re building tools
            that fit naturally into your existing workflows so you can learn faster and
            remember more.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  )
}

