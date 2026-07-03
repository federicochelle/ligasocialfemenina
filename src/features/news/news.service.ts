import { supabase } from '../../lib/supabaseClient.ts'
import { uploadNewsImage as uploadNewsImageAsset } from '../images/image-upload.service.ts'
import type { CreateNewsInput, News, UpdateNewsInput } from './news.types.ts'

const newsColumns =
  'id, title, slug, content, cover_image, published, published_at, created_at, updated_at'

export async function getNews() {
  const { data, error } = await supabase
    .from('news')
    .select(newsColumns)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('No pudimos obtener las noticias.')
  }

  return data satisfies News[]
}

export async function createNews(input: CreateNewsInput) {
  const { data, error } = await supabase
    .from('news')
    .insert(input)
    .select(newsColumns)
    .single()

  if (error) {
    throw new Error('No pudimos crear la noticia.')
  }

  return data satisfies News
}

export async function updateNews(newsId: string, input: UpdateNewsInput) {
  const { data, error } = await supabase
    .from('news')
    .update(input)
    .eq('id', newsId)
    .select(newsColumns)
    .single()

  if (error) {
    throw new Error('No pudimos actualizar la noticia.')
  }

  return data satisfies News
}

export async function deleteNews(newsId: string) {
  const { error } = await supabase.from('news').delete().eq('id', newsId)

  if (error) {
    throw new Error('No pudimos eliminar la noticia.')
  }
}

export async function toggleNewsPublished(newsId: string, published: boolean) {
  const payload = {
    published,
    published_at: published ? new Date().toISOString() : null,
  }

  const { data, error } = await supabase
    .from('news')
    .update(payload)
    .eq('id', newsId)
    .select(newsColumns)
    .single()

  if (error) {
    throw new Error('No pudimos actualizar el estado de la noticia.')
  }

  return data satisfies News
}

export function uploadNewsImage(file: File) {
  return uploadNewsImageAsset(file)
}
