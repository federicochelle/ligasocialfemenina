export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/webp',
] as const

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number]

export type OptimizedImageOptions = {
  maxWidth: number
  maxHeight: number
  quality: number
}
