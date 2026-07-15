import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { MatchDialog } from './MatchDialog.tsx'
import type { Match, MatchFormValues, MatchTeamOption } from './matches.types.ts'

const matchFieldOptions = ['Welcome', 'Colón'] as const

type MatchFormProps = {
  open: boolean
  match?: Match | null
  teamOptions: MatchTeamOption[]
  teamsLoading: boolean
  submitting: boolean
  onClose: () => void
  onSubmit: (values: MatchFormValues) => Promise<void>
}

const defaultValues: MatchFormValues = {
  home_team_id: '',
  away_team_id: '',
  match_date: '',
  field: '',
  venue: '',
  home_score: '',
  away_score: '',
  season_label: '',
}

function mapMatchToFormValues(match: Match | null | undefined): MatchFormValues {
  if (!match) {
    return defaultValues
  }

  return {
    home_team_id: match.home_team_id,
    away_team_id: match.away_team_id,
    match_date: toDateTimeLocal(match.match_date),
    field: match.field ?? '',
    venue: match.venue ?? '',
    home_score: match.home_score?.toString() ?? '',
    away_score: match.away_score?.toString() ?? '',
    season_label: match.season_label ?? '',
  }
}

function toDateTimeLocal(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const pad = (unit: number) => unit.toString().padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function MatchForm({
  open,
  match,
  teamOptions,
  teamsLoading,
  submitting,
  onClose,
  onSubmit,
}: MatchFormProps) {
  const [values, setValues] = useState<MatchFormValues>(defaultValues)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    setValues(mapMatchToFormValues(match))
    setErrorMessage(null)
  }, [match, open])

  const awayTeamOptions = useMemo(() => {
    return teamOptions.filter((team) => team.id !== values.home_team_id)
  }, [teamOptions, values.home_team_id])

  const homeTeamOptions = useMemo(() => {
    return teamOptions.filter((team) => team.id !== values.away_team_id)
  }, [teamOptions, values.away_team_id])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!values.home_team_id) {
      setErrorMessage('El equipo local es obligatorio.')
      return
    }

    if (!values.away_team_id) {
      setErrorMessage('El equipo visitante es obligatorio.')
      return
    }

    if (values.home_team_id === values.away_team_id) {
      setErrorMessage('El equipo local y visitante no pueden ser iguales.')
      return
    }

    if (!values.match_date) {
      setErrorMessage('La fecha y hora es obligatoria.')
      return
    }

    if (!values.field) {
      setErrorMessage('La cancha es obligatoria.')
      return
    }

    const hasHomeScore = values.home_score.trim() !== ''
    const hasAwayScore = values.away_score.trim() !== ''
    const homeScore = hasHomeScore ? Number(values.home_score) : 0
    const awayScore = hasAwayScore ? Number(values.away_score) : 0

    if ((hasHomeScore && homeScore < 0) || (hasAwayScore && awayScore < 0)) {
      setErrorMessage('Los puntajes no pueden ser negativos.')
      return
    }

    setErrorMessage(null)
    await onSubmit({
      ...values,
      venue: values.venue.trim(),
      season_label: values.season_label.trim(),
      home_score: values.home_score.trim(),
      away_score: values.away_score.trim(),
    })
  }

  return (
    <MatchDialog
      open={open}
      title={match ? 'Editar partido' : 'Nuevo partido'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className="primary-button"
            form="match-form"
            disabled={submitting || teamsLoading}
          >
            {submitting ? 'Guardando...' : match ? 'Guardar cambios' : 'Crear partido'}
          </button>
        </>
      }
    >
      <form id="match-form" className="teams-form" onSubmit={handleSubmit}>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="match-home-team">Equipo local *</label>
            <select
              id="match-home-team"
              name="home_team_id"
              value={values.home_team_id}
              onChange={(event) =>
                setValues((current) => ({ ...current, home_team_id: event.target.value }))
              }
              required
              disabled={teamsLoading}
            >
              <option value="">
                {teamsLoading ? 'Cargando equipos...' : 'Seleccioná el equipo local'}
              </option>
              {homeTeamOptions.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="match-away-team">Equipo visitante *</label>
            <select
              id="match-away-team"
              name="away_team_id"
              value={values.away_team_id}
              onChange={(event) =>
                setValues((current) => ({ ...current, away_team_id: event.target.value }))
              }
              required
              disabled={teamsLoading}
            >
              <option value="">
                {teamsLoading ? 'Cargando equipos...' : 'Seleccioná el equipo visitante'}
              </option>
              {awayTeamOptions.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="match-date">Fecha y hora *</label>
            <input
              id="match-date"
              name="match_date"
              type="datetime-local"
              value={values.match_date}
              onChange={(event) =>
                setValues((current) => ({ ...current, match_date: event.target.value }))
              }
              required
            />
          </div>

          <div className="field">
            <label htmlFor="match-field">Cancha *</label>
            <select
              id="match-field"
              name="field"
              value={values.field}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  field: event.target.value as MatchFormValues['field'],
                }))
              }
              required
            >
              <option value="">Seleccioná una cancha</option>
              {matchFieldOptions.map((fieldOption) => (
                <option key={fieldOption} value={fieldOption}>
                  {fieldOption}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      </form>
    </MatchDialog>
  )
}
