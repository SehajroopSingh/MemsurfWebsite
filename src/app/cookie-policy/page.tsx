import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen flex flex-col bg-transparent">
      <Navigation />

      <section className="flex-1 pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg prose-blue max-w-none">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-app-text mb-4">
              Cookie Policy
            </h1>
            <p className="text-lg text-gray-500 mb-12">
              Last updated: March 25, 2026
            </p>

            <p className="lead text-xl text-app-textMuted">
              MemSurf (“we”, “us”, “our”) uses cookies and similar technologies on our website and application to provide, protect, and improve the Service. This Cookie Policy explains what cookies are, how we use them, and the choices you have.
            </p>

            <hr className="my-12 border-gray-100" />

            {/* 1. What Are Cookies? */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-app-text mb-4">1. What Are Cookies?</h2>
              <p className="text-app-textMuted mb-4">
                Cookies are small text files stored on your device when you visit a website. They help websites function properly, improve performance, and remember your preferences.
              </p>
              <p className="text-app-textMuted mb-2">We also use similar technologies such as:</p>
              <ul className="list-disc pl-6 space-y-1 text-app-textMuted">
                <li>Local Storage</li>
                <li>Web Beacons</li>
                <li>Pixels</li>
                <li>Analytics SDK equivalents in the app</li>
              </ul>
            </div>

            {/* 2. Types of Cookies We Use */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-app-text mb-6">2. Types of Cookies We Use</h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-app-text mb-2">A. Strictly Necessary Cookies</h3>
                  <p className="text-app-textMuted mb-2">These cookies are essential for the website to work. They support:</p>
                  <ul className="list-disc pl-6 space-y-1 text-app-textMuted mb-2">
                    <li>Account login</li>
                    <li>Security & authentication</li>
                    <li>Load balancing</li>
                    <li>Session management</li>
                  </ul>
                  <p className="text-sm text-gray-500 italic">You cannot opt out of these because the site cannot function without them.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-app-text mb-2">B. Performance & Analytics Cookies</h3>
                  <p className="text-app-textMuted mb-2">We use analytics tools (e.g., Amplitude and similar providers) to understand:</p>
                  <ul className="list-disc pl-6 space-y-1 text-app-textMuted mb-2">
                    <li>How users navigate the site</li>
                    <li>Which features are most used</li>
                    <li>Where performance issues occur</li>
                  </ul>
                  <p className="text-app-textMuted mb-2">Data collected may include:</p>
                  <ul className="list-disc pl-6 space-y-1 text-app-textMuted mb-2">
                    <li>Device info</li>
                    <li>Browser type</li>
                    <li>Page interactions</li>
                    <li>Click paths</li>
                  </ul>
                  <p className="text-app-textMuted">We use this data to improve MemSurf.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-app-text mb-2">C. Functionality Cookies</h3>
                  <p className="text-app-textMuted mb-2">These help remember your preferences, such as:</p>
                  <ul className="list-disc pl-6 space-y-1 text-app-textMuted">
                    <li>Language settings</li>
                    <li>UI configurations</li>
                    <li>Previously viewed content</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-app-text mb-2">D. Marketing & Advertising Cookies</h3>
                  <p className="text-app-textMuted mb-2">If used, these support:</p>
                  <ul className="list-disc pl-6 space-y-1 text-app-textMuted mb-2">
                    <li>Measuring ad performance (Meta Ads, Google Ads)</li>
                    <li>Retargeting campaigns</li>
                    <li>Attribution tracking</li>
                  </ul>
                  <p className="text-app-textMuted font-medium">We do not sell personal data to advertisers.</p>
                </div>
              </div>
            </div>

            {/* 3. How We Use Cookies */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-app-text mb-4">3. How We Use Cookies</h2>
              <p className="text-app-textMuted mb-2">Cookies help us:</p>
              <ul className="list-disc pl-6 space-y-1 text-app-textMuted">
                <li>Operate and secure the service</li>
                <li>Personalize content</li>
                <li>Measure and improve performance</li>
                <li>Identify bugs</li>
                <li>Understand user behavior</li>
                <li>Run marketing campaigns (with consent where required)</li>
              </ul>
            </div>

            {/* 4. Third-Party Cookies */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-app-text mb-4">4. Third-Party Cookies</h2>
              <p className="text-app-textMuted mb-2">We may allow trusted partners to place cookies, including:</p>
              <ul className="list-disc pl-6 space-y-1 text-app-textMuted mb-2">
                <li>Analytics providers (e.g., Amplitude, Google Analytics)</li>
                <li>Infrastructure and performance providers (e.g., cloud/CDN services)</li>
                <li>Advertising and attribution providers, if enabled (e.g., Meta, Google Ads)</li>
              </ul>
              <p className="text-app-textMuted">These third parties may collect data according to their own policies.</p>
            </div>

            {/* 5. Cookie Management: Your Choices */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-app-text mb-4">5. Cookie Management: Your Choices</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-app-text mb-2">Browser Controls</h3>
                  <p className="text-app-textMuted">You can block or delete cookies in your browser settings.</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-app-text mb-2">Opt-Out of Analytics Tracking</h3>
                  <p className="text-app-textMuted mb-2">You may request analytics opt-out by emailing:</p>
                  <a href="mailto:contact@memsurf.com" className="text-blue-600 hover:underline">contact@memsurf.com</a>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-app-text mb-2">Do Not Track</h3>
                  <p className="text-app-textMuted">Our site does not currently respond to “Do Not Track” signals.</p>
                </div>
              </div>
            </div>

            {/* 6. Changes to This Cookie Policy */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-app-text mb-4">6. Changes to This Cookie Policy</h2>
              <p className="text-app-textMuted">We may update this policy when needed. Changes will be posted here with a new “Last Updated” date.</p>
            </div>

            {/* 7. Contact Us */}
            <div className="mb-12 p-8 bg-app-surfaceElevated rounded-2xl border border-app-border">
              <h2 className="text-2xl font-bold text-app-text mb-4">7. Contact Us</h2>
              <p className="text-app-textMuted mb-2">If you have questions about this Cookie Policy, contact:</p>
              <a href="mailto:contact@memsurf.com" className="inline-flex items-center text-blue-600 font-bold hover:underline gap-2 text-lg">
                contact@memsurf.com
              </a>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
