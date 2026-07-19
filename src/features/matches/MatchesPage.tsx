import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CrudCard } from '../admin/crud/CrudCard.tsx'
import { CrudToolbar } from '../admin/crud/CrudToolbar.tsx'
import { AdminToastViewport } from '../admin/toast/AdminToastViewport.tsx'
import { MatchDialog } from './MatchDialog.tsx'
import { MatchForm } from './MatchForm.tsx'
import { MatchTable } from './MatchTable.tsx'
import {
  createMatch,
  deleteMatch,
  getActiveTeams,
  getMatchdays,
  getMatches,
  updateMatch,
} from './matches.service.ts'
import type { Match, MatchFormValues, MatchTeamOption, MatchdayOption } from './matches.types.ts'
import { matchStatusOptions } from './matches.types.ts'

function mapFormValues(values: MatchFormValues) {
  const home_score = values.home_score.trim() === '' ? null : Number(values.home_score)
  const away_score = values.away_score.trim() === '' ? null : Number(values.away_score)

  return {
    matchday_id: values.matchday_id,
    home_team_id: values.home_team_id,
    away_team_id: values.away_team_id,
    match_date: new Date(values.match_date).toISOString(),
    field: values.field || null,
    venue: values.venue || null,
    status: 'scheduled' as const,
    home_score,
    away_score,
    season_label: values.season_label || null,
  }
}

function hasDrawScores(values: ReturnType<typeof mapFormValues>) {
  return values.home_score !== null && values.away_score !== null && values.home_score === values.away_score
}

export function MatchesPage() {
  const navigate = useNavigate()
  const [matches, setMatches] = useState<Match[]>([])
  const [teamOptions, setTeamOptions] = useState<MatchTeamOption[]>([])
  const [matchdayOptions, setMatchdayOptions] = useState<MatchdayOption[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [teamsLoading, setTeamsLoading] = useState(true)
  const [matchdaysLoading, setMatchdaysLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [matchdaysErrorMessage, setMatchdaysErrorMessage] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [busyMatchId, setBusyMatchId] = useState<string | null>(null)

  const loadMatches = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const nextMatches = await getMatches()
      setMatches(nextMatches)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No pudimos cargar los partidos.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  const loadActiveTeams = useCallback(async () => {
    setTeamsLoading(true)

    try {
      const nextTeams = await getActiveTeams()
      setTeamOptions(nextTeams)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No pudimos cargar los equipos activos.',
      )
    } finally {
      setTeamsLoading(false)
    }
  }, [])

  const loadMatchdays = useCallback(async () => {
    setMatchdaysLoading(true)
    setMatchdaysErrorMessage(null)

    try {
      const nextMatchdays = await getMatchdays()
      setMatchdayOptions(nextMatchdays)
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : 'No pudimos cargar las fechas.'
      setMatchdayOptions([])
      setMatchdaysErrorMessage(nextMessage)
      setErrorMessage(nextMessage)
    } finally {
      setMatchdaysLoading(false)
    }
  }, [])

  useEffect(() => {
    void Promise.all([loadMatches(), loadActiveTeams(), loadMatchdays()])
  }, [loadActiveTeams, loadMatchdays, loadMatches])

  const filteredMatches = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return matches
    }

    return matches.filter((match) => {
      const statusLabel =
        matchStatusOptions.find((option) => option.value === match.status)?.label ?? match.status

      const searchableContent = [
        match.home_team?.name ?? '',
        match.away_team?.name ?? '',
        match.field ?? '',
        match.venue ?? '',
        match.season_label ?? '',
        match.matchday ? `fecha ${match.matchday.round_number}` : '',
        match.matchday?.phase ?? '',
        match.status,
        statusLabel,
      ]
        .join(' ')
        .toLowerCase()

      return searchableContent.includes(normalizedSearch)
    })
  }, [matches, searchTerm])

  const openCreateDialog = () => {
    setSelectedMatch(null)
    setIsFormOpen(true)
  }

  const handleEdit = (match: Match) => {
    setSelectedMatch(match)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (values: MatchFormValues) => {
    setErrorMessage(null)
    const payload = mapFormValues(values)

    if (hasDrawScores(payload)) {
      setErrorMessage('No pueden haber partidos con empates.')
      return
    }

    setSubmitting(true)

    try {
      if (selectedMatch) {
        await updateMatch(selectedMatch.id, payload)
        setFeedbackMessage('Partido actualizado correctamente.')
      } else {
        await createMatch(payload)
        setFeedbackMessage('Partido creado correctamente.')
      }

      setIsFormOpen(false)
      setSelectedMatch(null)
      await loadMatches()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No pudimos guardar el partido.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!matchToDelete) {
      return
    }

    setSubmitting(true)
    setBusyMatchId(matchToDelete.id)
    setErrorMessage(null)

    try {
      await deleteMatch(matchToDelete.id)
      setMatchToDelete(null)
      setFeedbackMessage('Partido eliminado correctamente.')
      await loadMatches()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No pudimos eliminar el partido.',
      )
    } finally {
      setSubmitting(false)
      setBusyMatchId(null)
    }
  }

  const handleStatsClick = (match: Match) => {
    navigate(`/admin/partidos/${match.id}/estadisticas`)
  }

  return (
    <section className="admin-page teams-page">
      <AdminToastViewport
        items={[
          {
            id: 'matches-feedback',
            message: feedbackMessage,
            variant: 'success',
            onClose: () => setFeedbackMessage(null),
          },
          {
            id: 'matches-error',
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
            searchPlaceholder="Buscar por equipos, fecha, cancha, temporada o estado"
            primaryAction={openCreateDialog}
            primaryLabel="+ Nuevo partido"
          />
        }
      >
        {loading ? (
          <div className="placeholder-panel crud-card__state">
            <h2 className="placeholder-panel__title">Cargando partidos...</h2>
            <p className="placeholder-panel__text">
              Estamos consultando Supabase para traer el fixture actualizado.
            </p>
          </div>
        ) : matches.length === 0 ? (
          <div className="placeholder-panel crud-card__state">
            <h2 className="placeholder-panel__title">Todavía no hay partidos</h2>
            <p className="placeholder-panel__text">
              Creá el primer partido para empezar a construir el fixture de la liga.
            </p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="placeholder-panel crud-card__state">
            <h2 className="placeholder-panel__title">Sin resultados</h2>
            <p className="placeholder-panel__text">
              No encontramos partidos que coincidan con la búsqueda actual.
            </p>
          </div>
        ) : (
          <MatchTable
            matches={filteredMatches}
            busyMatchId={busyMatchId}
            onEdit={handleEdit}
            onDelete={setMatchToDelete}
            onStats={handleStatsClick}
          />
        )}
      </CrudCard>

      <MatchForm
        open={isFormOpen}
        match={selectedMatch}
        teamOptions={teamOptions}
        matchdayOptions={matchdayOptions}
        teamsLoading={teamsLoading}
        matchdaysLoading={matchdaysLoading}
        matchdaysErrorMessage={matchdaysErrorMessage}
        submitting={submitting}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedMatch(null)
        }}
        onSubmit={handleFormSubmit}
      />

      <MatchDialog
        open={matchToDelete !== null}
        title="Eliminar partido"
        description="Esta acción elimina el registro del partido. Podés volver a crearlo más adelante si lo necesitás."
        onClose={() => setMatchToDelete(null)}
        footer={
          <>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setMatchToDelete(null)}
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
          ¿Seguro que querés eliminar el partido entre{' '}
          <strong>
            {matchToDelete?.home_team?.name ?? 'Local'} vs {matchToDelete?.away_team?.name ?? 'Visitante'}
          </strong>
          ?
        </p>
      </MatchDialog>
    </section>
  )
}
