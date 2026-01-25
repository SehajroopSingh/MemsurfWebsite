'use client'

import React from 'react'
import Image from 'next/image'
import { BlogArticle } from '@/types/blog'

interface BlogArticleTemplateProps {
  article: BlogArticle
  content: React.ReactNode
}

export default function BlogArticleTemplate({ article, content }: BlogArticleTemplateProps) {
  return (
    <article className="max-w-4xl mx-auto">
      {/* Hero Image */}
      <div className="relative w-full aspect-[16/9] mb-8 rounded-lg overflow-hidden bg-gray-100">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 896px"
          priority
        />
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        {article.title}
      </h1>

      {/* Date */}
      <p className="text-gray-500 mb-8">
        {article.date}
      </p>

      {/* Content */}
      <div className="prose prose-lg max-w-none text-gray-700">
        {content}
      </div>
    </article>
  )
}

