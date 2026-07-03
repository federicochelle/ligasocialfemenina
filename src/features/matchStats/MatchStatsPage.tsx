import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AdminToastViewport } from '../admin/toast/AdminToastViewport.tsx'
import { MatchStatsTable } from './MatchStatsTable.tsx'
import {
  getMatchWithTeams,
  getPlayersForMatch,
  getStatsByMatch,
  updateMatchScore,
  upsertMatchStats,
} from './matchStats.service.ts'
import type {
  MatchPlayer,
  MatchStatRow,
  MatchStatsFormState,
  MatchStatsFormValue,
  MatchWithTeams,
  UpsertMatchStatPayload,
} from './matchStats.types.ts'

function sanitizeNumericInput(value: string) {
  return value.replace(/[^\d]/g, '')
}

function getTeamInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function buildDefaultState(players: MatchPlayer[], stats: MatchStatRow[]) {
  const statsByPlayerId = new Map(stats.map((stat) => [stat.player_id, stat]))

  return players.reduce<MatchStatsFormState>((accumulator, player) => {
    const stat = statsByPlayerId.get(player.id)

    accumulator[player.id] = {
      player_id: player.id,
      team_id: player.team_id,
      starter: stat?.starter ?? false,
      minutes_played: stat?.minutes_played?.toString() ?? '0',
      points: stat?.points.toString() ?? '0',
      three_pointers: stat?.three_pointers.toString() ?? '0',
      rebounds: stat?.rebounds.toString() ?? '0',
      assists: stat?.assists.toString() ?? '0',
      blocks: stat?.blocks.toString() ?? '0',
      fouls: stat?.fouls.toString() ?? '0',
    }

    return accumulator
  }, {})
}

function mapFormStateToPayload(
  match: MatchWithTeams,
  players: MatchPlayer[],
  formState: MatchStatsFormState,
) {
  const allowedPlayerIds = new Set(players.map((player) => player.id))
  const allowedTeamIds = new Set([match.home_team?.id, match.away_team?.id].filter(Boolean))

  return Object.values(formState).map((row) => {
    if (!allowedPlayerIds.has(row.player_id) || !allowedTeamIds.has(row.team_id)) {
      throw new Error('Hay jugadoras fuera del partido actual. Recargá la pantalla e intentá de nuevo.')
    }

    return {
      player_id: row.player_id,
      starter: row.starter,
      minutes_played: row.minutes_played ? Number(row.minutes_played) : null,
      points: Number(row.points || '0'),
      three_pointers: Number(row.three_pointers || '0'),
      rebounds: Number(row.rebounds || '0'),
      assists: Number(row.assists || '0'),
      blocks: Number(row.blocks || '0'),
      fouls: Number(row.fouls || '0'),
    } satisfies UpsertMatchStatPayload
  })
}

export function MatchStatsPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const [match, setMatch] = useState<MatchWithTeams | null>(null)
  const [players, setPlayers] = useState<MatchPlayer[]>([])
  const [formState, setFormState] = useState<MatchStatsFormState>({})
  const [scoreValues, setScoreValues] = useState({ homeScore: '0', awayScore: '0' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!matchId) {
      setErrorMessage('No encontramos el partido solicitado.')
      setLoading(false)
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      const nextMatch = await getMatchWithTeams(matchId)

      if (!nextMatch.home_team || !nextMatch.away_team) {
        throw new Error('El partido no tiene equipos asociados correctamente.')
      }

      const [nextPlayers, nextStats] = await Promise.all([
        getPlayersForMatch(nextMatch.home_team.id, nextMatch.away_team.id),
        getStatsByMatch(matchId),
      ])

      setMatch(nextMatch)
      setPlayers(nextPlayers)
      setFormState(buildDefaultState(nextPlayers, nextStats))
      setScoreValues({
        homeScore: nextMatch.home_score?.toString() ?? '0',
        awayScore: nextMatch.away_score?.toString() ?? '0',
      })
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No pudimos cargar las estadísticas del partido.',
      )
    } finally {
      setLoading(false)
    }
  }, [matchId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const hasPlayers = players.length > 0
  const canSave = !saving && !loading && Boolean(match)

  const handleChange = (
    playerId: string,
    field: keyof MatchStatsFormValue,
    value: string | boolean,
  ) => {
    setFormState((current) => ({
      ...current,
      [playerId]: {
        ...current[playerId],
        [field]: value,
      },
    }))
  }

  const handleScoreChange = (field: 'homeScore' | 'awayScore', value: string) => {
    setScoreValues((current) => ({
      ...current,
      [field]: sanitizeNumericInput(value),
    }))
  }

  const handleSave = async () => {
    if (!matchId || !match) {
      setErrorMessage('No encontramos el partido solicitado.')
      return
    }

    setSaving(true)
    setErrorMessage(null)

    try {
      const homeScore = Number(scoreValues.homeScore || '0')
      const awayScore = Number(scoreValues.awayScore || '0')

      if (homeScore < 0 || awayScore < 0) {
        throw new Error('No se permiten valores negativos en el tanteador.')
      }

      await updateMatchScore(matchId, {
        home_score: homeScore,
        away_score: awayScore,
        status: 'finished',
      })

      if (hasPlayers) {
        const payload = mapFormStateToPayload(match, players, formState)

        if (payload.some((row) =>
          [
            row.points,
            row.three_pointers,
            row.rebounds,
            row.assists,
            row.blocks,
            row.fouls,
            row.minutes_played ?? 0,
          ].some((value) => value < 0),
        )) {
          throw new Error('No se permiten valores negativos en las estadísticas.')
        }

        await upsertMatchStats(matchId, payload)
      }

      setFeedbackMessage('Estadísticas guardadas correctamente.')
      await loadData()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No pudimos guardar las estadísticas.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="admin-page">
      <AdminToastViewport
        items={[
          {
            id: 'match-stats-feedback',
            message: feedbackMessage,
            variant: 'success',
            onClose: () => setFeedbackMessage(null),
          },
          {
            id: 'match-stats-error',
            message: errorMessage,
            variant: 'error',
            onClose: () => setErrorMessage(null),
          },
        ]}
      />

      {loading ? (
        <div className="placeholder-panel">
          <h2 className="placeholder-panel__title">Cargando estadísticas...</h2>
          <p className="placeholder-panel__text">
            Estamos preparando la planilla del partido y trayendo sus datos desde Supabase.
          </p>
        </div>
      ) : !match ? (
        <div className="placeholder-panel">
          <h2 className="placeholder-panel__title">Partido no encontrado</h2>
          <p className="placeholder-panel__text">
            No pudimos ubicar el partido solicitado para cargar estadísticas.
          </p>
        </div>
      ) : (
        <>
          <section className="score-card">
            <div className="score-board" aria-label="Tanteador del partido">
              <div className="score-team score-team--home">
                {match.home_team?.logo_url ? (
                  <img
                    className="team-logo score-team__logo"
                    src={match.home_team.logo_url}
                    alt={`Logo de ${match.home_team.name}`}
                  />
                ) : (
                  <div className="team-logo team-logo--fallback score-team__logo" aria-hidden="true">
                    {getTeamInitials(match.home_team?.name ?? 'Equipo local')}
                  </div>
                )}
                <span className="score-team__name">{match.home_team?.name ?? 'Equipo local'}</span>
              </div>

              <label className="score-input-wrap" htmlFor="home-score">
                <input
                  className="score-input"
                  id="home-score"
                  inputMode="numeric"
                  value={scoreValues.homeScore}
                  disabled={saving}
                  onChange={(event) => handleScoreChange('homeScore', event.target.value)}
                />
              </label>

              <label className="score-input-wrap" htmlFor="away-score">
                <input
                  className="score-input"
                  id="away-score"
                  inputMode="numeric"
                  value={scoreValues.awayScore}
                  disabled={saving}
                  onChange={(event) => handleScoreChange('awayScore', event.target.value)}
                />
              </label>

              <div className="score-team score-team--away">
                <span className="score-team__name">{match.away_team?.name ?? 'Equipo visitante'}</span>
                {match.away_team?.logo_url ? (
                  <img
                    className="team-logo score-team__logo"
                    src={match.away_team.logo_url}
                    alt={`Logo de ${match.away_team.name}`}
                  />
                ) : (
                  <div className="team-logo team-logo--fallback score-team__logo" aria-hidden="true">
                    {getTeamInitials(match.away_team?.name ?? 'Equipo visitante')}
                  </div>
                )}
              </div>
            </div>
          </section>

          {hasPlayers ? (
            <>
              <MatchStatsTable
                match={match}
                players={players}
                formState={formState}
                disabled={saving}
                onChange={handleChange}
              />

              <div className="stats-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleSave}
                  disabled={!canSave}
                >
                  {saving ? 'Guardando...' : 'Guardar estadísticas'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="placeholder-panel">
                <h2 className="placeholder-panel__title">No hay jugadoras activas</h2>
                <p className="placeholder-panel__text">
                  Podés guardar el tanteador del partido ahora. Para cargar estadísticas individuales,
                  activá jugadoras en los equipos de este encuentro.
                </p>
              </div>

              <div className="stats-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleSave}
                  disabled={!canSave}
                >
                  {saving ? 'Guardando...' : 'Guardar estadísticas'}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}
