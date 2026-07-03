import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { EditIcon } from '../admin/crud/TableActionButton.tsx'
import { CrudCard } from '../admin/crud/CrudCard.tsx'
import { AdminToastViewport } from '../admin/toast/AdminToastViewport.tsx'
import { PlayerForm } from './PlayerForm.tsx'
import {
  getActiveTeams,
  getPlayerById,
  updatePlayer,
} from './players.service.ts'
import type {
  Player,
  PlayerFormValues,
  PlayerTeamOption,
  UpdatePlayerInput,
} from './players.types.ts'

function normalizeOptionalString(value: string): string | null {
  return value || null
}

function mapUpdateFormValues(values: PlayerFormValues, player: Player): UpdatePlayerInput {
  return {
    team_id: values.team_id,
    name: values.name,
    jersey_number: values.jersey_number ? Number(values.jersey_number) : null,
    identity_document: normalizeOptionalString(values.identity_document),
    phone: normalizeOptionalString(values.phone),
    medical_insurance: normalizeOptionalString(values.medical_insurance),
    emergency_contact_name: player.emergency_contact_name,
    emergency_phone: normalizeOptionalString(values.emergency_phone),
    position: player.position,
    photo_url: player.photo_url,
    active: player.active,
  }
}

export function PlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>()
  const [player, setPlayer] = useState<Player | null>(null)
  const [teamOptions, setTeamOptions] = useState<PlayerTeamOption[]>([])
  const [loading, setLoading] = useState(true)
  const [teamsLoading, setTeamsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [notFoundMessage, setNotFoundMessage] = useState<string | null>(null)

  const loadPlayerDetail = useCallback(async () => {
    if (!playerId) {
      setNotFoundMessage('No encontramos la jugadora solicitada.')
      setLoading(false)
      return
    }

    setLoading(true)
    setErrorMessage(null)
    setNotFoundMessage(null)

    try {
      const nextPlayer = await getPlayerById(playerId)
      setPlayer(nextPlayer)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No pudimos cargar el detalle de la jugadora.'

      setErrorMessage(message)
      setNotFoundMessage(message)
    } finally {
      setLoading(false)
    }
  }, [playerId])

  const loadTeams = useCallback(async () => {
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

  useEffect(() => {
    void Promise.all([loadPlayerDetail(), loadTeams()])
  }, [loadPlayerDetail, loadTeams])

  const handleSubmit = async (values: PlayerFormValues) => {
    if (!player) {
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      await updatePlayer(player.id, mapUpdateFormValues(values, player))
      setFeedbackMessage('Jugadora actualizada correctamente.')
      setIsFormOpen(false)
      await loadPlayerDetail()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No pudimos actualizar la jugadora.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-page">
      <AdminToastViewport
        items={[
          {
            id: 'player-detail-feedback',
            message: feedbackMessage,
            variant: 'success',
            onClose: () => setFeedbackMessage(null),
          },
          {
            id: 'player-detail-error',
            message: errorMessage,
            variant: 'error',
            onClose: () => setErrorMessage(null),
          },
        ]}
      />

      {loading ? (
        <div className="placeholder-panel">
          <h2 className="placeholder-panel__title">Cargando jugadora...</h2>
          <p className="placeholder-panel__text">
            Estamos preparando la ficha completa de la jugadora y sus estadísticas.
          </p>
        </div>
      ) : !player ? (
        <div className="placeholder-panel">
          <h2 className="placeholder-panel__title">Jugadora no encontrada</h2>
          <p className="placeholder-panel__text">
            {notFoundMessage ?? 'No pudimos ubicar la jugadora solicitada.'}
          </p>
        </div>
      ) : (
        <>
          <CrudCard
            toolbar={
              <div className="player-detail-header">
                <div className="player-detail-header__content">
                  <h1 className="player-detail-header__title">{player.name}</h1>
                </div>

                <button
                  type="button"
                  className="primary-button player-detail-edit-button"
                  onClick={() => setIsFormOpen(true)}
                >
                  <EditIcon className="player-detail-edit-button__icon" />
                  Editar
                </button>
              </div>
            }
          >
            <div className="player-detail-grid player-detail-grid--single">
              <section className="player-detail-section">
                <h2 className="player-detail-card__title">Datos deportivos</h2>
                <div className="player-detail-fields">
                  <DetailField label="Equipo" value={player.team?.name ?? 'Sin equipo'} />
                  <DetailField
                    label="Número de camiseta"
                    value={player.jersey_number?.toString() ?? 'Sin asignar'}
                  />
                </div>
              </section>

              <section className="player-detail-section">
                <h2 className="player-detail-card__title">Datos personales</h2>
                <div className="player-detail-fields">
                  <DetailField
                    label="Cédula de identidad"
                    value={player.identity_document ?? 'Sin dato'}
                  />
                  <DetailField label="Teléfono" value={player.phone ?? 'Sin dato'} />
                  <DetailField
                    label="Emergencia médica"
                    value={player.medical_insurance ?? 'Sin dato'}
                  />
                  <DetailField
                    label="Teléfono de emergencia"
                    value={player.emergency_phone ?? 'Sin dato'}
                  />
                </div>
              </section>
            </div>
          </CrudCard>
        </>
      )}

      <PlayerForm
        open={isFormOpen}
        player={player}
        teamOptions={teamOptions}
        teamsLoading={teamsLoading}
        submitting={submitting}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </section>
  )
}

type DetailFieldProps = {
  label: string
  value: string
}

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="player-detail-field">
      <span className="player-detail-field__label">{label}</span>
      <strong className="player-detail-field__value">{value}</strong>
    </div>
  )
}
