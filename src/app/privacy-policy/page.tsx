import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen flex flex-col font-sans">
      <Navigation />
      <section className="flex-1 pt-32 pb-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-800">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Privacy Policy - MemSurf
          </h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: March 25, 2026</p>

          <div className="space-y-8">
            <p className="text-lg leading-relaxed">
              MemSurf ("we", "us", "our") is an AI-powered learning and memory platform. This Privacy Policy explains
              what data we collect, how we use and share it, and the choices available to you.
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="mb-4">We collect the following categories of information:</p>

              <div className="space-y-4 ml-4">
                <div>
                  <h3 className="font-semibold text-gray-900">A. Content You Provide</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                    <li>Captures, notes, documents, links, and transcriptions</li>
                    <li>User-created lessons, quizzes, and study materials</li>
                    <li>Messages and support requests you send to us</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">B. Account Information</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                    <li>Name, username, and email address</li>
                    <li>Account credentials (stored in hashed form)</li>
                    <li>Profile information you choose to add</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">C. Usage and Device Information</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                    <li>IP address and general device/network metadata</li>
                    <li>Device type, operating system, app version</li>
                    <li>Interaction events (such as viewed screens and used features)</li>
                    <li>Diagnostic and error information</li>
                    <li>Push notification token (if notifications are enabled)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">D. Permissions-Based Data</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                    <li>Microphone and speech data for voice features</li>
                    <li>Camera and photo library data for image capture/import features</li>
                    <li>Contact emails for optional friend discovery features (with your permission)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">E. Payment Information</h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                    <li>Subscription and transaction metadata from app stores</li>
                    <li>Payments processed by Apple App Store or Google Play</li>
                    <li>We do not store full payment card numbers</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="mb-2">We use collected data to:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Provide core product features and account functionality</li>
                <li>Generate learning outputs such as summaries, lessons, and quizzes</li>
                <li>Deliver social, notification, and subscription features</li>
                <li>Maintain security, prevent abuse, and troubleshoot issues</li>
                <li>Analyze usage and improve product quality</li>
                <li>Send service updates, support responses, and product communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use AI and LLMs</h2>
              <p className="mb-2">
                Certain content you submit may be processed by third-party AI providers to power service features.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
                <li>Summarization and knowledge extraction</li>
                <li>Quiz, lesson, and study-aid generation</li>
                <li>Learning workflow and retention optimization</li>
              </ul>
              <p className="text-gray-700">
                We configure integrations to apply provider data-use restrictions where available and commercially
                applicable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. How We Share Information</h2>
              <p className="mb-2">We share your information with third-party service providers, including:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
                <li>AI processing providers (e.g., OpenAI, Google, OpenRouter) to generate learning content</li>
                <li>Analytics providers (e.g., Amplitude) to understand product usage and improve the service</li>
                <li>Cloud infrastructure providers (e.g., AWS, Azure) to host and secure our services</li>
                <li>Authentication providers (e.g., Google, Apple, Facebook) if you choose social sign-in</li>
                <li>Payment and subscription providers (e.g., Apple App Store, Google Play) to process purchases</li>
                <li>Notification providers (e.g., Apple Push Notification service) to deliver app notifications</li>
                <li>Integration partners you choose to connect (e.g., Notion, Google Drive) to import or sync content</li>
              </ul>
              <p className="text-gray-700">
                We share data only as needed to provide services, limit disclosures to the minimum necessary data, and
                apply contractual and confidentiality safeguards where applicable.
              </p>
              <p className="font-medium text-gray-900 mt-3">We do not sell your personal data.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Legal Bases (EU/EEA/UK)</h2>
              <p className="mb-2 text-gray-700">
                Where applicable, we rely on one or more of the following legal bases:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Performance of a contract (providing and operating the service)</li>
                <li>Legitimate interests (security, analytics, and product improvement)</li>
                <li>Consent (optional permissions and consent-based processing)</li>
                <li>Compliance with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. California Privacy Rights (CCPA/CPRA)</h2>
              <p className="mb-2 text-gray-700">California residents may have rights to request:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
                <li>Access to categories and specific pieces of personal information</li>
                <li>Correction of inaccurate personal information</li>
                <li>Deletion of personal information (subject to legal exceptions)</li>
                <li>Data portability for information you provided</li>
                <li>Information about categories of disclosures for business purposes</li>
              </ul>
              <p className="text-gray-700">
                To exercise rights, contact us at{' '}
                <a href="mailto:contact@memsurf.com" className="text-blue-600 hover:underline">
                  contact@memsurf.com
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>
                  We retain personal information as long as needed for service delivery, legal compliance, security,
                  and legitimate business operations.
                </li>
                <li>
                  User content generally remains available until you delete it or your account, subject to backup and
                  legal retention obligations.
                </li>
                <li>
                  Backups and operational logs are typically retained for limited periods (for example, approximately
                  30-90 days), unless longer retention is required by law or security needs.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
              <p className="text-gray-700">
                Our providers may process personal information in countries outside your place of residence. Where
                required, we implement appropriate safeguards for international transfers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Security</h2>
              <p className="text-gray-700">
                We use technical, administrative, and organizational safeguards designed to protect personal
                information. No system is completely secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Your Rights and Choices</h2>
              <p className="mb-2">Depending on your location, you may request:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
                <li>Access to your data</li>
                <li>Correction of inaccurate data</li>
                <li>Export of your data (portability)</li>
                <li>Deletion of your account or data, subject to legal exceptions</li>
              </ul>
              <p className="text-gray-700">
                Email us at{' '}
                <a href="mailto:contact@memsurf.com" className="text-blue-600 hover:underline">
                  contact@memsurf.com
                </a>{' '}
                to make a request.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Children&apos;s Privacy</h2>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>MemSurf is not intended for children under 13.</li>
                <li>We do not knowingly collect personal data from children under 13.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. If we make material changes, we will update the
                "Last updated" date and provide notice as required by law.
              </p>
            </section>

            <section className="pt-4 border-t border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700">
                If you have questions or privacy requests, contact us at:
                <br />
                <a href="mailto:contact@memsurf.com" className="font-medium text-blue-600 hover:underline">
                  contact@memsurf.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
