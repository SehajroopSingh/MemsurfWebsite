import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const contactEmail = 'contact@memsurf.com'

const dataTypes = [
  {
    title: 'Account Information',
    body: (
      <>
        When you create or use an account, we may collect your name, email address, username, profile information,
        account settings, authentication method, and related account identifiers. If you sign in with Apple, Google, or
        Facebook, we receive information made available by that provider, such as identity tokens and basic account
        details needed to create or sign you into your MemSurf account.
      </>
    ),
  },
  {
    title: 'User Content',
    body: (
      <>
        MemSurf lets you create, upload, import, share, and organize learning content. Depending on how you use the app,
        this may include text, notes, links, documents, images, audio transcripts, speech input, generated summaries,
        lessons, quizzes, containers, sets, feedback, comments, and other material you choose to save or share.
      </>
    ),
    extra: (
      <>
        If you use the share extension, the content you share to MemSurf may be stored temporarily on your device and
        uploaded to your account when you choose to save it.
      </>
    ),
  },
  {
    title: 'Device Permissions',
    body: (
      <>
        With your permission, MemSurf may access camera and photo library data, microphone and speech recognition data,
        contacts, and notifications. We use these permissions to provide requested features such as image capture, text
        extraction, voice notes, transcription, friend discovery, reminders, activity updates, and other app
        notifications. You can control these permissions in iOS Settings.
      </>
    ),
  },
  {
    title: 'Learning Activity and Social Features',
    body: (
      <>
        We collect information about your activity in MemSurf, such as captures created, quiz attempts, answers, practice
        progress, lessons viewed, streaks, gamification activity, subscriptions to learning content, notification
        interactions, friend requests, circles, leaderboard interactions, shared content, and related social actions.
      </>
    ),
  },
  {
    title: 'Purchases and Subscription Information',
    body: (
      <>
        If you purchase a subscription or other paid feature through Apple, Apple processes your payment. We may receive
        purchase status, product identifiers, subscription status, expiration information, and transaction validation
        information so we can provide paid features, enforce usage limits, and support your account. We do not receive or
        store full payment card numbers from Apple.
      </>
    ),
  },
  {
    title: 'Analytics, Advertising, and Diagnostics',
    body: (
      <>
        We use analytics tools, including Amplitude, to understand app usage, improve features, measure onboarding and
        subscription flows, and diagnose errors. We use Google Mobile Ads to show ads or manage ad-related functionality.
        Advertising partners may process device identifiers, usage data, approximate location derived from network or
        device signals, and ad interaction data depending on your consent, device settings, and applicable law. We may
        also collect diagnostic information such as API errors, performance events, crash-related information, logs, and
        device or app configuration details.
      </>
    ),
  },
  {
    title: 'Device, Network, and Security Information',
    body: (
      <>
        We and our service providers may process device information, IP address, network information, authentication
        tokens, security logs, and related technical data to operate the service, keep accounts secure, prevent abuse,
        and troubleshoot problems.
      </>
    ),
  },
]

const uses = [
  'Provide, maintain, and improve MemSurf.',
  'Create, authenticate, and manage your account.',
  'Process captures, images, notes, transcripts, lessons, quizzes, and other learning content.',
  'Generate summaries, study material, personalized learning outputs, and recommendations.',
  'Sync content across the app, widgets, and extensions.',
  'Provide social, leaderboard, notification, sharing, and collaboration features.',
  'Process subscriptions, validate purchases, and enforce plan limits.',
  'Send service messages, push notifications, support responses, and product communications.',
  'Analyze app performance, usage, reliability, and feature adoption.',
  'Show, deliver, or measure ads where applicable.',
  'Detect, prevent, and respond to fraud, abuse, security incidents, and technical issues.',
  'Comply with legal obligations and enforce our terms.',
]

const sharingParties = [
  'Service providers that host our backend, store data, send notifications, provide analytics, process AI requests, support authentication, validate purchases, deliver ads, or help operate the app.',
  'Apple, Google, Facebook, and other authentication or platform providers when you use their services.',
  'Analytics and advertising partners, including Amplitude and Google Mobile Ads, as described in this policy.',
  'Other users when you choose to use social, sharing, circles, comments, leaderboard, or collaboration features.',
  'Authorities, courts, or other parties when required by law or necessary to protect rights, safety, security, and the integrity of the service.',
  'A successor or acquirer if MemSurf is involved in a merger, acquisition, financing, reorganization, or sale of assets.',
]

const choices = [
  'Update certain account and profile information in the app.',
  'Delete content you created where the app provides deletion controls.',
  'Delete your MemSurf account in the app.',
  'Allow or revoke AI processing consent in Settings > AI Privacy before personal data is sent to third-party AI providers.',
  'Turn off push notifications in the app or in iOS Settings.',
  'Disable camera, photo library, microphone, speech recognition, and contacts permissions in iOS Settings.',
  'Manage Apple subscriptions through your Apple ID settings.',
  'Manage advertising and tracking choices through iOS privacy settings and any consent prompts shown in the app.',
]

const legalBases = [
  'Performance of a contract, such as providing the app and account features.',
  'Consent, such as optional device permissions, notifications, and consent-based advertising or analytics.',
  'Legitimate interests, such as security, fraud prevention, service improvement, and troubleshooting.',
  'Legal obligations, such as tax, accounting, compliance, and lawful request requirements.',
]

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen flex flex-col font-sans">
      <Navigation />
      <section className="flex-1 pt-32 pb-16 bg-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-app-textMuted">
          <h1 className="text-4xl md:text-5xl font-bold text-app-text mb-2">Privacy Policy - MemSurf</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: April 21, 2026</p>

          <div className="space-y-8">
            <p className="text-lg leading-relaxed">
              MemSurf (&quot;MemSurf&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) provides an
              AI-powered learning app that helps users capture information, create study material, practice with quizzes
              and lessons, and use related social, notification, and subscription features. This Privacy Policy explains
              what information we collect, how we use it, how we share it, how long we keep it, and the choices
              available to you.
            </p>
            <p>
              If you have questions or privacy requests, contact us at{' '}
              <a href={`mailto:${contactEmail}`} className="text-blue-600 hover:underline">
                {contactEmail}
              </a>
              .
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-app-text mb-4">1. Information We Collect</h2>
              <p className="mb-4">
                We collect information you provide directly, information created when you use MemSurf, information
                collected with your device permissions, and information processed by service providers that help us
                operate the app.
              </p>
              <div className="space-y-4 ml-4">
                {dataTypes.map((item) => (
                  <div key={item.title}>
                    <h3 className="font-semibold text-app-text">{item.title}</h3>
                    <p className="mt-2 text-app-textMuted">{item.body}</p>
                    {item.extra ? <p className="mt-2 text-app-textMuted">{item.extra}</p> : null}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-app-text mb-4">2. How We Use Information</h2>
              <p className="mb-2">We use information to:</p>
              <ul className="list-disc pl-5 space-y-1 text-app-textMuted">
                {uses.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-app-text mb-4">3. AI Processing</h2>
              <p className="text-app-textMuted">
                MemSurf uses AI systems and related service providers, including OpenAI, Google (Gemini), and
                Anthropic (Claude), to process content you submit and generate learning outputs, including summaries,
                lessons, quizzes, classifications, and study materials. Depending on the feature you use, this may
                include captured text, prompts, uploaded files or images, generated responses, and related request
                metadata needed to process your request. We request in-app user permission before sending personal data
                for third-party AI processing, and you can revoke that permission in Settings &gt; AI Privacy. Content
                sent for AI processing is used to provide requested app features. We do not sell your user content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-app-text mb-4">4. How We Share Information</h2>
              <p className="mb-2">We may share information with:</p>
              <ul className="list-disc pl-5 space-y-1 text-app-textMuted mb-4">
                {sharingParties.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="text-app-textMuted">
                We require service providers and third parties that process user data for us to protect that data and
                provide the same or equal level of protection described in this Privacy Policy and required by applicable
                law.
              </p>
              <p className="text-app-textMuted mt-3">
                We do not sell your personal information for money. Some advertising or analytics disclosures may be
                considered &quot;sharing&quot; or &quot;targeted advertising&quot; under certain privacy laws. Where
                required, we provide consent or opt-out choices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-app-text mb-4">5. Data Retention and Deletion</h2>
              <p className="text-app-textMuted">
                We keep personal information for as long as needed to provide MemSurf, maintain your account, comply
                with legal obligations, resolve disputes, enforce agreements, prevent abuse, support security, and
                maintain backups.
              </p>
              <p className="text-app-textMuted mt-3">
                User content and account data are generally kept until you delete the content, delete your account, or
                request deletion, unless we need to retain limited information for legal, security, backup,
                fraud-prevention, or operational reasons. Backup copies and logs may remain for a limited period before
                deletion according to our retention practices.
              </p>
              <p className="text-app-textMuted mt-3">
                You can delete your MemSurf account in the app. Deleting your account permanently deletes your account
                and associated app data, subject to limited retention for the reasons described above. If you have an
                active Apple subscription, deleting your MemSurf account does not automatically cancel your Apple
                subscription; you must cancel it through your Apple ID subscription settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-app-text mb-4">6. Your Choices</h2>
              <p className="mb-2">You can:</p>
              <ul className="list-disc pl-5 space-y-1 text-app-textMuted mb-4">
                {choices.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="text-app-textMuted">
                Contact us at{' '}
                <a href={`mailto:${contactEmail}`} className="text-blue-600 hover:underline">
                  {contactEmail}
                </a>{' '}
                to request access, correction, deletion, export, or other privacy support.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-app-text mb-4">7. Legal Bases for Processing</h2>
              <p className="mb-2 text-app-textMuted">
                Where applicable, we process personal information based on one or more of the following legal bases:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-app-textMuted">
                {legalBases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-app-text mb-4">
                8. California and Other Privacy Rights
              </h2>
              <p className="text-app-textMuted">
                Depending on your location, you may have rights to request access to personal information, correction of
                inaccurate personal information, deletion of personal information, portability of information you
                provided, and information about categories of personal information we collect, use, disclose, sell, or
                share.
              </p>
              <p className="text-app-textMuted mt-3">
                To exercise privacy rights, contact us at{' '}
                <a href={`mailto:${contactEmail}`} className="text-blue-600 hover:underline">
                  {contactEmail}
                </a>
                . We may need to verify your request before acting on it. We will not discriminate against you for
                exercising privacy rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-app-text mb-4">9. Children&apos;s Privacy</h2>
              <p className="text-app-textMuted">
                MemSurf is not intended for children under 13. We do not knowingly collect personal information from
                children under 13. If you believe a child has provided personal information, contact us at{' '}
                <a href={`mailto:${contactEmail}`} className="text-blue-600 hover:underline">
                  {contactEmail}
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-app-text mb-4">10. International Processing</h2>
              <p className="text-app-textMuted">
                Your information may be processed in the United States and other countries where we or our service
                providers operate. These countries may have data protection laws different from those in your location.
                Where required, we use appropriate safeguards for international transfers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-app-text mb-4">11. Security</h2>
              <p className="text-app-textMuted">
                We use reasonable technical, administrative, and organizational measures designed to protect personal
                information. No method of transmission or storage is completely secure, so we cannot guarantee absolute
                security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-app-text mb-4">12. Changes to This Policy</h2>
              <p className="text-app-textMuted">
                We may update this Privacy Policy from time to time. If we make material changes, we will update the
                &quot;Last updated&quot; date above and may provide additional notice in the app or through other
                appropriate channels.
              </p>
            </section>

            <section className="pt-4 border-t border-app-border">
              <h2 className="text-2xl font-semibold text-app-text mb-4">13. Contact</h2>
              <p className="text-app-textMuted">
                If you have questions or privacy requests, contact us at:
                <br />
                <a href={`mailto:${contactEmail}`} className="font-medium text-blue-600 hover:underline">
                  {contactEmail}
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
