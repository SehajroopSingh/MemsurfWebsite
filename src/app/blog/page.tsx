import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function BlogPage() {
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
          </div>

          {/* Empty State */}
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-2">
              No articles yet.
            </p>
            <p className="text-gray-400 text-sm">
              Check back soon for new content.
            </p>
          </div>

          {/* Blog Grid - Ready for future articles */}
          {/* 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <BlogCard key={article.slug} article={article} />
            ))}
          </div>
          */}
        </div>
      </section>
      <Footer />
    </main>
  )
}

