import { useEffect, useState, type FormEvent } from 'react'
import { TeamDialog } from './TeamDialog.tsx'
import type { Team, TeamFormValues } from './teams.types.ts'
import { validateImageFile } from '../images/image-upload.processor.ts'

type TeamFormProps = {
  open: boolean
  team?: Team | null
  submitting: boolean
  submitStatusMessage?: string | null
  onClose: () => void
  onSubmit: (values: TeamFormValues) => Promise<void>
}

const defaultValues: TeamFormValues = {
  name: '',
  description: '',
  active: true,
  logo_file: null,
}

function mapTeamToFormValues(team: Team | null | undefined): TeamFormValues {
  if (!team) {
    return defaultValues
  }

  return {
    name: team.name,
    description: team.description ?? '',
    active: team.active,
    logo_file: null,
  }
}

export function TeamForm({
  open,
  team,
  submitting,
  submitStatusMessage,
  onClose,
  onSubmit,
}: TeamFormProps) {
  const [values, setValues] = useState<TeamFormValues>(defaultValues)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    setValues(mapTeamToFormValues(team))
    setLogoPreviewUrl(team?.logo_url ?? null)
    setErrorMessage(null)
  }, [open, team])

  useEffect(() => {
    if (!values.logo_file) {
      return
    }

    const nextPreviewUrl = URL.createObjectURL(values.logo_file)
    setLogoPreviewUrl(nextPreviewUrl)

    return () => {
      URL.revokeObjectURL(nextPreviewUrl)
    }
  }, [values.logo_file])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!values.name.trim()) {
      setErrorMessage('El nombre es obligatorio.')
      return
    }

    setErrorMessage(null)
    await onSubmit({
      ...values,
      name: values.name.trim(),
      description: values.description.trim(),
    })
  }

  return (
    <TeamDialog
      open={open}
      title={team ? 'Editar equipo' : 'Nuevo equipo'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="primary-button" form="team-form" disabled={submitting}>
            {submitting ? 'Guardando...' : team ? 'Guardar cambios' : 'Crear equipo'}
          </button>
        </>
      }
    >
      <form id="team-form" className="teams-form" onSubmit={handleSubmit}>
        <div className="team-form__hero-grid">
          <div className="field team-form__name-field">
            <label htmlFor="team-name">Nombre *</label>
            <input
              id="team-name"
              name="name"
              value={values.name}
              onChange={(event) =>
                setValues((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
          </div>

          <div className="field team-form__logo-field">
            <label
              htmlFor="team-logo-file"
              className={`image-picker image-picker--team${logoPreviewUrl ? ' image-picker--filled' : ''}`}
            >
              <span className="sr-only">Seleccionar logo</span>
              <input
                id="team-logo-file"
                name="logo_file"
                className="image-picker__input"
                type="file"
                accept="image/png,image/jpg,image/jpeg,image/webp"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0] ?? null

                  if (!nextFile) {
                    setValues((current) => ({ ...current, logo_file: null }))
                    setLogoPreviewUrl(team?.logo_url ?? null)
                    setErrorMessage(null)
                    return
                  }

                  try {
                    validateImageFile(nextFile)
                    setValues((current) => ({ ...current, logo_file: nextFile }))
                    setErrorMessage(null)
                  } catch (error) {
                    setValues((current) => ({ ...current, logo_file: null }))
                    setLogoPreviewUrl(team?.logo_url ?? null)
                    setErrorMessage(
                      error instanceof Error
                        ? error.message
                        : 'No pudimos validar el archivo seleccionado.',
                    )
                    event.target.value = ''
                  }
                }}
              />

              <span className="image-picker__surface">
                {logoPreviewUrl ? (
                  <img
                    className="image-picker__preview"
                    src={logoPreviewUrl}
                    alt={team ? `Logo actual de ${team.name}` : 'Preview del logo'}
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
            {submitStatusMessage ? (
              <p className="field-status">{submitStatusMessage}</p>
            ) : null}
          </div>
        </div>

        <div className="field">
          <label htmlFor="team-description">Descripción</label>
          <textarea
            id="team-description"
            name="description"
            rows={4}
            value={values.description}
            onChange={(event) =>
              setValues((current) => ({ ...current, description: event.target.value }))
            }
          />
        </div>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      </form>
    </TeamDialog>
  )
}
