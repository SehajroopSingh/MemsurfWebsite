'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-app-textMuted mb-6">
      <Link href="/" className="hover:text-app-text transition-colors">
        <Home className="w-4 h-4" />
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-app-textMuted/60" />
          {item.href ? (
            <Link href={item.href} className="hover:text-app-text transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-app-text font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

