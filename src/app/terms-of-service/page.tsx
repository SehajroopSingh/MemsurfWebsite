import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navigation />
      <section className="flex-1 pt-24 pb-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Terms of Service
          </h1>
          <p className="text-gray-700">
            These terms govern your use of Memsurf. This text is a placeholder to be
            replaced with your own Terms of Service drafted or reviewed by legal counsel.
          </p>
          <p className="text-gray-700">
            By using Memsurf, users agree to follow the rules and guidelines that you set
            out in this document.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  )
}

