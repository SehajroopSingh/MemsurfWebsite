'use client'

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import WaitlistForm from '@/components/WaitlistForm'
import JoinCommunity from '@/components/JoinCommunity'
import Link from 'next/link'

export default function ComingSoonPage() {
  return (
    <main className="min-h-screen flex flex-col bg-app-canvas">
      <Navigation variant="youlearn" />
      <section className="flex-1 pt-36 pb-20 sm:pt-44 sm:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-center text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl font-bold leading-tight tracking-normal text-app-text sm:text-6xl lg:text-7xl"
            >
              MemSurf is almost ready
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 w-full text-lg text-app-textMuted leading-relaxed sm:text-xl"
            >
              <p className="mx-auto max-w-2xl">
                We&apos;re putting the final touches on the app. Join the list and we&apos;ll send the invite when it is ready.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="mx-auto mt-10 w-full max-w-xl"
              >
                <h3 className="mb-4 text-2xl font-bold tracking-normal text-app-text">
                  Get early access by email
                </h3>
                <WaitlistForm source="coming_soon_page" variant="youlearn" />
              </motion.div>

              <div className="mx-auto mt-8 w-full max-w-2xl rounded-[28px] border border-app-border bg-app-surface p-6 text-left shadow-sm sm:p-8">
                <p className="font-semibold text-app-text">
                  If you choose to join the waitlist, here&apos;s exactly what to expect:
                </p>

                <div className="my-4 border-t border-app-border" />

                <ol className="list-decimal pl-5 space-y-3 marker:text-app-textMuted text-app-textMuted">
                  <li>A welcome email to say hi and share what we&apos;re building</li>
                  <li>A second email with your beta link as soon as it&apos;s ready</li>
                </ol>

                <p className="mt-4 text-center text-sm text-app-textMuted">
                  That&apos;s it. This is just a simple waitlist so we can let you know when MemSurf is ready to try. No daily newsletters. No marketing drip campaigns. No data gathering.
                </p>
              </div>
            </motion.div>

            <div className="mt-8 w-full max-w-2xl rounded-[28px] border border-app-border bg-app-surface p-6 shadow-sm sm:p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="w-full"
              >
                <JoinCommunity
                  delay={0}
                  centered={true}
                  location="coming_soon"
                  title="Join the community of MemSurfers"
                  textColor="text-app-text"
                  invertIcon={true}
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mx-auto mt-8 max-w-2xl space-y-4 text-app-textMuted"
            >
              <p>
                If you ever have a question, reply to an email, connect with the founders directly <Link href="/team" className="text-app-text underline decoration-app-border underline-offset-4 transition hover:opacity-80">here</Link> or reach out on Discord.
              </p>

              <p>We&apos;re always happy to talk.</p>

              <p className="pt-2 text-app-textMuted">Thanks for being here. We&apos;re excited to build this with you.</p>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
