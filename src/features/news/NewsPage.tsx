import { useCallback, useEffect, useMemo, useState } from 'react'
import { CrudCard } from '../admin/crud/CrudCard.tsx'
import { CrudToolbar } from '../admin/crud/CrudToolbar.tsx'
import { AdminToastViewport } from '../admin/toast/AdminToastViewport.tsx'
import { NewsDialog } from './NewsDialog.tsx'
import { NewsForm } from './NewsForm.tsx'
import { NewsTable } from './NewsTable.tsx'
import {
  createNews,
  deleteNews,
  getNews,
  toggleNewsPublished,
  uploadNewsImage,
  updateNews,
} from './news.service.ts'
import type { News, NewsFormValues } from './news.types.ts'

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function mapFormValues(values: NewsFormValues, currentNews?: News | null) {
  const slug = slugify(values.title.trim())
  const cover_image = values.cover_file
    ? await uploadNewsImage(values.cover_file)
    : currentNews?.cover_image ?? null

  return {
    title: values.title,
    slug,
    excerpt: values.excerpt,
    content: values.content,
    cover_image,
    published: currentNews?.published ?? false,
    published_at: currentNews?.published_at ?? null,
  }
}

export function NewsPage() {
  const [news, setNews] = useState<News[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedNews, setSelectedNews] = useState<News | null>(null)
  const [newsToDelete, setNewsToDelete] = useState<News | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [busyNewsId, setBusyNewsId] = useState<string | null>(null)
  const [submitStatusMessage, setSubmitStatusMessage] = useState<string | null>(null)

  const loadNews = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const nextNews = await getNews()
      setNews(nextNews)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No pudimos cargar las noticias.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadNews()
  }, [loadNews])

  const filteredNews = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return news
    }

    return news.filter((newsItem) => {
      const searchableContent = [newsItem.title, newsItem.excerpt ?? '', newsItem.content]
        .join(' ')
        .toLowerCase()
      return searchableContent.includes(normalizedSearch)
    })
  }, [news, searchTerm])

  const openCreateDialog = () => {
    setSelectedNews(null)
    setIsFormOpen(true)
  }

  const handleEdit = (newsItem: News) => {
    setSelectedNews(newsItem)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (values: NewsFormValues) => {
    setSubmitting(true)
    setErrorMessage(null)
    setSubmitStatusMessage(values.cover_file ? 'Optimizando imagen...' : null)

    try {
      if (selectedNews) {
        await updateNews(selectedNews.id, await mapFormValues(values, selectedNews))
        setFeedbackMessage(
          values.cover_file
            ? 'Imagen optimizada correctamente. Noticia actualizada correctamente.'
            : 'Noticia actualizada correctamente.',
        )
      } else {
        await createNews(await mapFormValues(values))
        setFeedbackMessage(
          values.cover_file
            ? 'Imagen optimizada correctamente. Noticia creada correctamente.'
            : 'Noticia creada correctamente.',
        )
      }

      setIsFormOpen(false)
      setSelectedNews(null)
      await loadNews()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No pudimos guardar la noticia.',
      )
    } finally {
      setSubmitting(false)
      setSubmitStatusMessage(null)
    }
  }

  const handleDelete = async () => {
    if (!newsToDelete) {
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      await deleteNews(newsToDelete.id)
      setNewsToDelete(null)
      setFeedbackMessage('Noticia eliminada correctamente.')
      await loadNews()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No pudimos eliminar la noticia.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleTogglePublished = async (newsItem: News) => {
    setBusyNewsId(newsItem.id)
    setErrorMessage(null)

    try {
      await toggleNewsPublished(newsItem.id, !newsItem.published)
      setFeedbackMessage(
        newsItem.published
          ? 'La noticia pasó a borrador correctamente.'
          : 'La noticia se publicó correctamente.',
      )
      await loadNews()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No pudimos actualizar el estado de la noticia.',
      )
    } finally {
      setBusyNewsId(null)
    }
  }

  return (
    <section className="admin-page teams-page">
      <AdminToastViewport
        items={[
          {
            id: 'news-feedback',
            message: feedbackMessage,
            variant: 'success',
            onClose: () => setFeedbackMessage(null),
          },
          {
            id: 'news-error',
            message: errorMessage,
            variant: 'error',
            onClose: () => setErrorMessage(null),
          },
        ]}
      />

      <CrudCard
        toolbar={
          <CrudToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por titular o contenido"
            primaryAction={openCreateDialog}
            primaryLabel="+ Nueva noticia"
          />
        }
      >
        {loading ? (
          <div className="placeholder-panel crud-card__state">
            <h2 className="placeholder-panel__title">Cargando noticias...</h2>
            <p className="placeholder-panel__text">
              Estamos consultando Supabase para traer el listado actualizado.
            </p>
          </div>
        ) : news.length === 0 ? (
          <div className="placeholder-panel crud-card__state">
            <h2 className="placeholder-panel__title">Todavía no hay noticias</h2>
            <p className="placeholder-panel__text">
              Creá la primera noticia para empezar a poblar la sección editorial.
            </p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="placeholder-panel crud-card__state">
            <h2 className="placeholder-panel__title">Sin resultados</h2>
            <p className="placeholder-panel__text">
              No encontramos noticias que coincidan con la búsqueda actual.
            </p>
          </div>
        ) : (
          <NewsTable
            news={filteredNews}
            busyNewsId={busyNewsId}
            onEdit={handleEdit}
            onDelete={setNewsToDelete}
            onTogglePublished={handleTogglePublished}
          />
        )}
      </CrudCard>

      <NewsForm
        open={isFormOpen}
        news={selectedNews}
        submitting={submitting}
        submitStatusMessage={submitStatusMessage}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedNews(null)
        }}
        onSubmit={handleFormSubmit}
      />

      <NewsDialog
        open={newsToDelete !== null}
        title="Eliminar noticia"
        description="Esta acción elimina el registro de la noticia. Podés volver a crearla más adelante si lo necesitás."
        onClose={() => setNewsToDelete(null)}
        footer={
          <>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setNewsToDelete(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="danger-button"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </>
        }
      >
        <p className="dialog-description dialog-description--body">
          ¿Seguro que querés eliminar <strong>{newsToDelete?.title}</strong>?
        </p>
      </NewsDialog>
    </section>
  )
}
