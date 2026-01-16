import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navigation />
      <section className="flex-1 pt-24 pb-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Contact Us
          </h1>
          <p className="text-gray-700 text-lg mb-6">
            Have questions, feedback, or partnership ideas? We&apos;d love to connect.
          </p>
          <div className="space-y-4 text-gray-700">
            <p>
              You can reach the Memsurf team at:
            </p>
            <p className="font-medium">
              contact@memsurf.com
            </p>
            <p>
              We aim to respond to most inquiries within 1–2 business days.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

