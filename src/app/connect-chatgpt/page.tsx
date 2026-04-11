import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const authorizeUrl = process.env.NEXT_PUBLIC_MCP_OAUTH_AUTHORIZE_URL || ''
const isConfigured = authorizeUrl.length > 0

export default function ConnectChatGPTPage() {
  return (
    <main className="min-h-screen flex flex-col bg-transparent">
      <Navigation />
      <section className="flex-1 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold text-app-text">
              Connect MemSurf to ChatGPT
            </h1>
            <p className="text-lg text-app-textMuted">
              Authorize ChatGPT to create captures and quizzes in your MemSurf
              account. You can disconnect anytime.
            </p>
            <div className="rounded-2xl border border-app-border bg-app-surfaceElevated p-6 space-y-4">
              <div className="flex flex-col gap-4">
                <span className="text-sm font-semibold uppercase tracking-wide text-app-textMuted">
                  Quick steps
                </span>
                <ol className="list-decimal list-inside text-app-textMuted space-y-2">
                  <li>Start the MemSurf connector in ChatGPT.</li>
                  <li>Click the connect button below to authorize.</li>
                  <li>Return to ChatGPT and try a tool call.</li>
                </ol>
              </div>
              <div>
                <a
                  href={isConfigured ? authorizeUrl : '#'}
                  className={`inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold shadow-sm transition ${
                    isConfigured
                      ? 'bg-app-softBlue text-white hover:opacity-90'
                      : 'bg-app-border text-app-textMuted cursor-not-allowed'
                  }`}
                  aria-disabled={!isConfigured}
                >
                  {isConfigured ? 'Authorize ChatGPT' : 'Authorize URL not set'}
                </a>
              </div>
              {!isConfigured && (
                <p className="text-sm text-app-textMuted">
                  Set <code className="font-mono rounded bg-app-surface px-1 py-0.5">NEXT_PUBLIC_MCP_OAUTH_AUTHORIZE_URL</code> in
                  your environment to enable this button.
                </p>
              )}
            </div>
            <p className="text-sm text-app-textMuted">
              This page is intentionally unlisted. Share the URL only with people
              you trust.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
