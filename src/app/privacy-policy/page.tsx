import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navigation />
      <section className="flex-1 pt-24 pb-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Privacy Policy
          </h1>
          <p className="text-gray-700">
            This page explains how Memsurf collects, uses, and protects your information.
            The content here is a placeholder – please replace it with your actual privacy policy text.
          </p>
          <p className="text-gray-700">
            We recommend working with your legal advisor to ensure this policy reflects your
            data practices and complies with applicable laws.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  )
}

