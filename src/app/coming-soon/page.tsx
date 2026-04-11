'use client'

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import WaitlistForm from '@/components/WaitlistForm'
import JoinCommunity from '@/components/JoinCommunity'
import Link from 'next/link'

export default function ComingSoonPage() {
  return (
    <main className="min-h-screen flex flex-col bg-transparent">
      <Navigation />
      <section className="flex-1 pt-24 pb-16 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-center text-center space-y-8 max-w-5xl mx-auto">



            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight whitespace-nowrap"
            >
              <span className="bg-gradient-to-r from-app-softBlue via-app-lavender to-app-mint bg-clip-text text-transparent">
                MemSurf is almost ready
              </span>
            </motion.h1>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-app-textMuted space-y-4 leading-relaxed"
            >
              <p>We&apos;re putting the final touches on our mobile app, and we&apos;d love to invite you in early.</p>

              {/* Email Signup Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="w-full max-w-xl mx-auto space-y-4 pb-6"
              >
                <h3 className="text-3xl md:text-3xl font-bold">
                  <span className="bg-gradient-to-r from-app-softBlue via-app-lavender to-app-mint bg-clip-text text-transparent">
                    Get early access by email
                  </span>
                </h3>
                <WaitlistForm source="coming_soon_page" />
              </motion.div>

              <div className="text-left bg-app-surfaceElevated/90 backdrop-blur-sm border border-app-border rounded-2xl p-6 shadow-sm my-2 w-fit mx-auto">
                <p className="font-medium text-app-text">If you choose to join the waitlist, here&apos;s exactly what to expect:</p>

                <div className="my-4 border-t border-app-border" />

                <ol className="list-decimal pl-5 space-y-3 marker:text-app-textMuted text-app-textMuted">
                  <li>A welcome email to say hi and share what we&apos;re building</li>
                  <li>A second email with your beta link as soon as it&apos;s ready</li>
                </ol>

                <p className="mt-4 text-sm text-app-textMuted w-0 min-w-full text-center">
                  That&apos;s it. This is just a simple waitlist so we can let you know when MemSurf is ready to try. No daily newsletters. No marketing drip campaigns. No data gathering.
                </p>
              </div>




            </motion.div>

            {/* Purple Card Wrapper */}
            <div className="w-full -mx-4 sm:mx-auto sm:w-fit sm:max-w-none bg-[#8c648d] backdrop-blur-sm border border-white/40 shadow-[0_20px_60px_rgba(0,0,0,0.12)] rounded-3xl sm:rounded-[56px] p-4 sm:p-8 my-8">

              {/* Discord Community */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="w-full"
              >
                <JoinCommunity delay={0} centered={true} location="coming_soon" title="Join the community of MemSurfers" textColor="text-white" invertIcon={true} />
              </motion.div>



            </div>

            {/* Footer Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-app-textMuted space-y-4 pt-4"
            >
              <p>
                If you ever have a question, reply to an email, connect with the founders directly <Link href="/team" className="text-app-softBlue hover:text-app-mint underline decoration-app-softBlue/40 hover:decoration-app-mint underline-offset-2 transition-all">here</Link> or reach out on Discord.
              </p>

              <p>We&apos;re always happy to talk.</p>

              <p className="text-app-textMuted/80 italic pt-2">Thanks for being here. We&apos;re excited to build this with you, fellow MemSurfer 🤍</p>
            </motion.div>



          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
