'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BlogArticle } from '@/types/blog'

interface BlogCardProps {
  article: BlogArticle
}

export default function BlogCard({ article }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group block"
    >
      <div className="h-full overflow-hidden rounded-[24px] border border-app-border bg-app-surface p-3 transition-colors hover:bg-app-surfaceElevated">
        {/* Image */}
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-app-surfaceElevated rounded-2xl mb-4 border border-app-border">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        
        {/* Content */}
        <div className="px-1 pb-1">
          <h3 className="text-lg font-semibold text-app-text mb-2 transition-colors group-hover:text-app-text">
            {article.title}
          </h3>
          <p className="text-sm text-app-textMuted/80">
            {article.date}
          </p>
        </div>
      </div>
    </Link>
  )
}
