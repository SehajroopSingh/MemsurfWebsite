import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navigation />
      <section className="flex-1 pt-24 pb-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Terms of Use — MemSurf
            </h1>
            <p className="text-lg text-gray-600">
              Effective Date: December 7, 2025
            </p>
            <p className="text-gray-700">
              Welcome to MemSurf (“the Service”). By accessing or using the app or website, you agree to these Terms of Use.
            </p>
          </div>

          <div className="space-y-6">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">1. Description of Service</h2>
              <p className="text-gray-700">
                MemSurf is an AI-powered learning platform that transforms user-provided content into structured lessons, quizzes, and personalized spaced-repetition schedules.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">2. Eligibility</h2>
              <p className="text-gray-700">
                You must be at least 13 years old to use MemSurf.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">3. User Content</h2>
              <p className="text-gray-700">
                You retain ownership of all content you submit (“User Content”).
                <br />
                By using the service, you grant us a limited license to process your content for:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Lesson and quiz generation</li>
                <li>Knowledge extraction</li>
                <li>Model personalization</li>
                <li>Feature improvement</li>
              </ul>
              <p className="text-gray-700">
                We do not claim ownership of your content.
                <br />
                You are responsible for ensuring your content does not contain illegal or harmful information.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">4. AI-Generated Content</h2>
              <p className="text-gray-700">
                MemSurf uses machine learning models to generate content.
                <br />
                You understand and agree that:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>AI outputs may contain errors</li>
                <li>AI content is provided “as-is”</li>
                <li>You should not rely solely on AI outputs for critical decisions</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">5. Intellectual Property</h2>
              <p className="text-gray-700">
                All MemSurf branding, UI, algorithms, lesson systems, and software are proprietary to MemSurf. You may not copy, reverse engineer, or resell the service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">6. Prohibited Activities</h2>
              <p className="text-gray-700">You may not:</p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Try to extract or reverse engineer our models</li>
                <li>Upload malicious code</li>
                <li>Harass or abuse others</li>
                <li>Use MemSurf for illegal activity</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">7. Termination</h2>
              <p className="text-gray-700">
                We may suspend or terminate accounts that violate these terms.
                <br />
                You may delete your account at any time.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">8. Disclaimers</h2>
              <p className="text-gray-700">
                MemSurf is provided “as-is” without warranties of any kind.
                <br />
                We are not liable for:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Errors in AI-generated content</li>
                <li>Data loss</li>
                <li>Service interruptions</li>
                <li>Indirect or consequential damages</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">9. Governing Law</h2>
              <p className="text-gray-700">
                These terms are governed by the laws of the State of California.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">10. Contact</h2>
              <p className="text-gray-700">
                <a href="mailto:contact@memsurf.com" className="text-blue-600 hover:underline">contact@memsurf.com</a>
              </p>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

