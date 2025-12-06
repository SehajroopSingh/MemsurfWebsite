import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function CareersPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navigation />
      <section className="flex-1 pt-24 pb-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Careers at Memsurf
          </h1>
          <p className="text-gray-700 text-lg mb-4">
            We&apos;re a small, fast-moving team building the future of AI-powered learning.
          </p>
          <p className="text-gray-700 text-lg mb-4">
            If you&apos;re passionate about education, AI, and creating delightful product
            experiences, we&apos;d love to hear from you.
          </p>
          <p className="text-gray-700 text-lg">
            For opportunities, please reach out via our contact page or email us directly.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  )
}

