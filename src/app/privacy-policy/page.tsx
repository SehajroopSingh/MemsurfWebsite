import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen flex flex-col font-sans">
      <Navigation />
      <section className="flex-1 pt-32 pb-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-800">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Privacy Policy — MemSurf
          </h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: December 7, 2024</p>

          <div className="space-y-8">
            <p className="text-lg leading-relaxed">
              MemSurf (“we”, “us”, “our”) is an AI-powered learning and memory platform that helps users capture information, turn it into structured knowledge, and retain it using adaptive spaced repetition. We are committed to protecting your privacy and handling your data responsibly.
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="mb-4">We collect the following categories of information:</p>

              <div className="space-y-4 ml-4">
                <div>
                  <h3 className="font-semibold text-gray-900">A. Content You Provide</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                    <li>Quick Captures, notes, documents, links, audio transcriptions</li>
                    <li>User-generated courses, lessons, quizzes</li>
                    <li>Messages you send through the app or website</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">B. Account Information</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                    <li>Name</li>
                    <li>Email</li>
                    <li>Password (hashed & salted)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">C. Usage & Device Information</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                    <li>IP address</li>
                    <li>Device type, OS, app version</li>
                    <li>Crash logs</li>
                    <li>Interaction data (pages viewed, features used)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">D. Payment Information</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                    <li>Processed securely by Apple App Store or Google Play.</li>
                    <li>We do not store credit card numbers.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="mb-2">We use collected data to:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Provide core features (lesson creation, quiz generation, AI tutoring)</li>
                <li>Improve learning recommendations and memory models</li>
                <li>Maintain and improve app performance and security</li>
                <li>Analyze usage to guide product development</li>
                <li>Communicate updates, new features, and support messages</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use AI / LLMs</h2>
              <p className="mb-2">Certain user content may be sent to third-party AI providers (e.g., OpenAI, Anthropic) strictly for the purpose of:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
                <li>Summarization</li>
                <li>Knowledge extraction</li>
                <li>Quiz and lesson generation</li>
                <li>Memory model optimization</li>
              </ul>
              <p className="font-medium text-gray-900">We do not allow AI providers to train on your data.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Sharing of Information</h2>
              <p className="mb-2">We may share limited data with:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
                <li>AI processing partners (OpenAI, Anthropic)</li>
                <li>Analytics tools (Amplitude, Firebase)</li>
                <li>Payment processors (Apple, Google)</li>
                <li>Service providers that support hosting, logging, or email delivery</li>
              </ul>
              <p className="font-medium text-gray-900">We do not sell your personal data.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Retention</h2>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Your content persists until you delete your account.</li>
                <li>Backups and logs are retained for 30–90 days.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
              <p className="mb-2">Depending on your location, you may request:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
                <li>Access to your data</li>
                <li>Correction of inaccurate data</li>
                <li>Export of your data (portability)</li>
                <li>Deletion of your account</li>
              </ul>
              <p className="text-gray-700">
                Email us at <a href="mailto:support@memsurf.app" className="text-blue-600 hover:underline">support@memsurf.app</a> to make any request.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Children&apos;s Privacy</h2>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>MemSurf is not intended for children under 13.</li>
                <li>We do not knowingly collect data from minors under 13.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to This Policy</h2>
              <p className="text-gray-700">We may update this policy and will notify users when we do.</p>
            </section>

            <section className="pt-4 border-t border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700">
                If you have questions, contact us at: <br />
                <a href="mailto:support@memsurf.app" className="font-medium text-blue-600 hover:underline">support@memsurf.app</a>
              </p>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

