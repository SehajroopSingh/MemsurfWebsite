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
      <div className="bg-white overflow-hidden">
        {/* Image */}
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100 rounded-lg mb-4">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        
        {/* Content */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-gray-500">
            {article.date}
          </p>
        </div>
      </div>
    </Link>
  )
}

