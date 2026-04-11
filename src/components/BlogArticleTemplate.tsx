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
      <div className="relative w-full aspect-[16/9] mb-8 rounded-lg overflow-hidden bg-app-surface border border-app-border/50">
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
      <h1 className="text-4xl md:text-5xl font-bold text-app-text mb-4">
        {article.title}
      </h1>

      {/* Date */}
      <p className="text-app-textMuted mb-8">
        {article.date}
      </p>

      {/* Content */}
      <div className="max-w-none text-lg leading-relaxed text-app-textMuted [&_h2]:text-app-text [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-app-text [&_strong]:text-app-text [&_a]:text-app-mintHi [&_a]:underline hover:[&_a]:text-app-mintBright [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4">
        {content}
      </div>
    </article>
  )
}




