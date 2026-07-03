export type News = {
  id: string
  title: string
  slug: string
  content: string
  cover_image: string | null
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export type NewsFormValues = {
  title: string
  content: string
  cover_file: File | null
}

export type CreateNewsInput = {
  title: string
  slug: string
  content: string
  cover_image: string | null
  published: boolean
  published_at: string | null
}

export type UpdateNewsInput = CreateNewsInput
