export interface BlogArticle {
  title: string
  date: string
  image: string
  slug: string
  excerpt?: string
  metaDescription?: string
  keywords?: string[]
  author?: string
  content?: React.ReactNode
}

