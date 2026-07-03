import { useEffect, useState, type FormEvent } from 'react'
import { validateImageFile } from '../images/image-upload.processor.ts'
import { NewsDialog } from './NewsDialog.tsx'
import type { News, NewsFormValues } from './news.types.ts'

type NewsFormProps = {
  open: boolean
  news?: News | null
  submitting: boolean
  submitStatusMessage?: string | null
  onClose: () => void
  onSubmit: (values: NewsFormValues) => Promise<void>
}

const defaultValues: NewsFormValues = {
  title: '',
  content: '',
  cover_file: null,
}

function mapNewsToFormValues(news: News | null | undefined): NewsFormValues {
  if (!news) {
    return defaultValues
  }

  return {
    title: news.title,
    content: news.content,
    cover_file: null,
  }
}

export function NewsForm({
  open,
  news,
  submitting,
  submitStatusMessage,
  onClose,
  onSubmit,
}: NewsFormProps) {
  const [values, setValues] = useState<NewsFormValues>(defaultValues)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    setValues(mapNewsToFormValues(news))
    setCoverPreviewUrl(news?.cover_image ?? null)
    setErrorMessage(null)
  }, [open, news])

  useEffect(() => {
    if (!values.cover_file) {
      return
    }

    const nextPreviewUrl = URL.createObjectURL(values.cover_file)
    setCoverPreviewUrl(nextPreviewUrl)

    return () => {
      URL.revokeObjectURL(nextPreviewUrl)
    }
  }, [values.cover_file])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!values.title.trim()) {
      setErrorMessage('El titular es obligatorio.')
      return
    }

    if (!values.content.trim()) {
      setErrorMessage('El contenido es obligatorio.')
      return
    }

    setErrorMessage(null)
    await onSubmit({
      ...values,
      title: values.title.trim(),
      content: values.content.trim(),
    })
  }

  return (
    <NewsDialog
      open={open}
      title={news ? 'Editar noticia' : 'Nueva noticia'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="primary-button" form="news-form" disabled={submitting}>
            {submitting ? 'Guardando...' : news ? 'Guardar cambios' : 'Crear noticia'}
          </button>
        </>
      }
    >
      <form id="news-form" className="teams-form news-form" onSubmit={handleSubmit}>
        <section className="form-section news-form__section">
          <div className="form-section__header">
            <h3 className="form-section__title">Contenido</h3>
          </div>

          <div className="news-form__hero-grid">
            <div className="field">
              <label htmlFor="news-title">Titular *</label>
              <input
                id="news-title"
                name="title"
                value={values.title}
                onChange={(event) =>
                  setValues((current) => ({ ...current, title: event.target.value }))
                }
                required
              />
            </div>

            <div className="field news-form__cover-field">
              <label
                htmlFor="news-cover-file"
                className={`image-picker image-picker--cinema${coverPreviewUrl ? ' image-picker--filled' : ''}`}
              >
                <span className="sr-only">Seleccionar portada</span>
                <input
                  id="news-cover-file"
                  name="cover_file"
                  className="image-picker__input"
                  type="file"
                  accept="image/png,image/jpg,image/jpeg,image/webp"
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] ?? null

                    if (!nextFile) {
                      setValues((current) => ({ ...current, cover_file: null }))
                      setCoverPreviewUrl(news?.cover_image ?? null)
                      setErrorMessage(null)
                      return
                    }

                    try {
                      validateImageFile(nextFile)
                      setValues((current) => ({ ...current, cover_file: nextFile }))
                      setErrorMessage(null)
                    } catch (error) {
                      setValues((current) => ({ ...current, cover_file: null }))
                      setCoverPreviewUrl(news?.cover_image ?? null)
                      setErrorMessage(
                        error instanceof Error
                          ? error.message
                          : 'No pudimos validar la imagen seleccionada.',
                      )
                      event.target.value = ''
                    }
                  }}
                />

                <span className="image-picker__surface">
                  {coverPreviewUrl ? (
                    <img
                      className="image-picker__preview"
                      src={coverPreviewUrl}
                      alt={news ? `Portada actual de ${news.title}` : 'Preview de portada'}
                    />
                  ) : (
                    <svg className="image-picker__icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M12 16V7m0 0-3.5 3.5M12 7l3.5 3.5M5 17.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-.5"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                      />
                    </svg>
                  )}
                </span>
              </label>
              {submitStatusMessage ? <p className="field-status">{submitStatusMessage}</p> : null}
            </div>
          </div>

          <div className="field">
            <label htmlFor="news-content">Texto / contenido *</label>
            <textarea
              id="news-content"
              name="content"
              rows={10}
              value={values.content}
              onChange={(event) =>
                setValues((current) => ({ ...current, content: event.target.value }))
              }
              required
            />
          </div>
        </section>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      </form>
    </NewsDialog>
  )
}
