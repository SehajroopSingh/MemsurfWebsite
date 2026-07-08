import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import BlogCard from '@/components/BlogCard'
import ResourcesSection from '@/components/ResourcesSection'
import { getAllBlogPosts } from '@/lib/blogPosts'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://memsurf.com'

export const metadata: Metadata = {
  title: 'Blog | MemSurf – Learning Tips, Study Techniques, and Memory Science',
  description: 'Explore articles about spaced repetition, learning techniques, memory science, and effective study methods. Learn how to make knowledge stick with MemSurf.',
  keywords: ['learning blog', 'study tips', 'spaced repetition', 'memory techniques', 'education', 'learning strategies'],
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
  openGraph: {
    title: 'Blog | MemSurf',
    description: 'Explore articles about spaced repetition, learning techniques, and memory science.',
    type: 'website',
    url: `${siteUrl}/blog`,
  },
}

export default function BlogPage() {
  const posts = getAllBlogPosts()
  const pageUrl = `${siteUrl}/blog`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'MemSurf Blog – Learning Tips, Study Techniques, and Memory Science',
    description: 'Explore articles about spaced repetition, learning techniques, memory science, and effective study methods.',
    url: pageUrl,
    isPartOf: { '@id': `${siteUrl}/#website` },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${siteUrl}/blog/${post.slug}`,
      datePublished: post.date,
      description: post.metaDescription || post.excerpt,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen flex flex-col bg-app-canvas">
      <Navigation variant="youlearn" />
      <section className="flex-1 pt-36 pb-20 sm:pt-44 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h1 className="text-5xl font-bold leading-tight tracking-normal text-app-text sm:text-6xl">
              Blog
            </h1>
            <p className="text-lg leading-relaxed text-app-textMuted mt-5 sm:text-xl">
              Discover insights on learning, memory, and effective study techniques.
            </p>
          </div>

          {/* Blog Grid */}
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((article) => (
                <BlogCard key={article.slug} article={article} />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-app-border bg-app-surface py-16 text-center">
              <p className="text-app-textMuted text-lg mb-2">
                No articles yet.
              </p>
              <p className="text-app-textMuted text-sm">
                Check back soon for new content.
              </p>
            </div>
          )}
          
          {/* External Resources Section */}
          <ResourcesSection />
        </div>
      </section>
        <Footer />
      </main>
    </>
  )
}
