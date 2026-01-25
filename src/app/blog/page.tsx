import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import BlogCard from '@/components/BlogCard'
import { getAllBlogPosts } from '@/lib/blogPosts'

export const metadata: Metadata = {
  title: 'Blog | Memsurf – Learning Tips, Study Techniques, and Memory Science',
  description: 'Explore articles about spaced repetition, learning techniques, memory science, and effective study methods. Learn how to make knowledge stick with Memsurf.',
  keywords: ['learning blog', 'study tips', 'spaced repetition', 'memory techniques', 'education', 'learning strategies'],
  openGraph: {
    title: 'Blog | Memsurf',
    description: 'Explore articles about spaced repetition, learning techniques, and memory science.',
    type: 'website',
  },
}

export default function BlogPage() {
  const posts = getAllBlogPosts()

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navigation />
      <section className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Blogs
            </h1>
            <p className="text-lg text-gray-600 mt-4">
              Discover insights on learning, memory, and effective study techniques.
            </p>
          </div>

          {/* Blog Grid */}
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((article) => (
                <BlogCard key={article.slug} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-2">
                No articles yet.
              </p>
              <p className="text-gray-400 text-sm">
                Check back soon for new content.
              </p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}

