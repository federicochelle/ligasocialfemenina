import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CrudCard } from '../admin/crud/CrudCard.tsx'
import { CrudToolbar } from '../admin/crud/CrudToolbar.tsx'
import { AdminToastViewport } from '../admin/toast/AdminToastViewport.tsx'
import { PlayerDialog } from './PlayerDialog.tsx'
import { PlayerForm } from './PlayerForm.tsx'
import { PlayerTable } from './PlayerTable.tsx'
import {
  createPlayer,
  deletePlayer,
  getActiveTeams,
  getPlayers,
  updatePlayer,
} from './players.service.ts'
import type {
  CreatePlayerInput,
  Player,
  PlayerFormValues,
  PlayerTeamOption,
  UpdatePlayerInput,
} from './players.types.ts'

function normalizeOptionalString(value: string): string | null {
  return value || null
}

function mapCreateFormValues(values: PlayerFormValues): CreatePlayerInput {
  return {
    team_id: values.team_id,
    name: values.name,
    jersey_number: values.jersey_number ? Number(values.jersey_number) : null,
    identity_document: normalizeOptionalString(values.identity_document),
    phone: normalizeOptionalString(values.phone),
    medical_insurance: normalizeOptionalString(values.medical_insurance),
    emergency_contact_name: null,
    emergency_phone: normalizeOptionalString(values.emergency_phone),
    position: null,
    photo_url: null,
    active: true,
  }
}

function mapUpdateFormValues(
  values: PlayerFormValues,
  player: Player,
): UpdatePlayerInput {
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

export function PlayersPage() {
  const navigate = useNavigate()
  const [players, setPlayers] = useState<Player[]>([])
  const [teamOptions, setTeamOptions] = useState<PlayerTeamOption[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [teamsLoading, setTeamsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadPlayers = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const nextPlayers = await getPlayers()
      setPlayers(nextPlayers)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No pudimos cargar las jugadoras.',
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

  useEffect(() => {
    void Promise.all([loadPlayers(), loadActiveTeams()])
  }, [loadActiveTeams, loadPlayers])

  const filteredPlayers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return players
    }

    return players.filter((player) => {
      const searchableContent = [player.name, player.team?.name ?? '']
        .join(' ')
        .toLowerCase()

      return searchableContent.includes(normalizedSearch)
    })
  }, [players, searchTerm])

  const openCreateDialog = () => {
    setSelectedPlayer(null)
    setIsFormOpen(true)
  }

  const handleEdit = (player: Player) => {
    setSelectedPlayer(player)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (values: PlayerFormValues) => {
    setSubmitting(true)
    setErrorMessage(null)

    try {
      if (selectedPlayer) {
        await updatePlayer(selectedPlayer.id, mapUpdateFormValues(values, selectedPlayer))
        setFeedbackMessage('Jugadora actualizada correctamente.')
      } else {
        await createPlayer(mapCreateFormValues(values))
        setFeedbackMessage('Jugadora creada correctamente.')
      }

      setIsFormOpen(false)
      setSelectedPlayer(null)
      await loadPlayers()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No pudimos guardar la jugadora.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!playerToDelete) {
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      await deletePlayer(playerToDelete.id)
      setPlayerToDelete(null)
      setFeedbackMessage('Jugadora eliminada correctamente.')
      await loadPlayers()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No pudimos eliminar la jugadora.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="admin-page teams-page">
      <AdminToastViewport
        items={[
          {
            id: 'players-feedback',
            message: feedbackMessage,
            variant: 'success',
            onClose: () => setFeedbackMessage(null),
          },
          {
            id: 'players-error',
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
            searchPlaceholder="Buscar por nombre o equipo"
            primaryAction={openCreateDialog}
            primaryLabel="+ Nueva jugadora"
          />
        }
      >
        {loading ? (
          <div className="placeholder-panel crud-card__state">
            <h2 className="placeholder-panel__title">Cargando jugadoras...</h2>
            <p className="placeholder-panel__text">
              Estamos consultando Supabase para traer el listado actualizado.
            </p>
          </div>
        ) : players.length === 0 ? (
          <div className="placeholder-panel crud-card__state">
            <h2 className="placeholder-panel__title">Todavía no hay jugadoras</h2>
            <p className="placeholder-panel__text">
              Creá la primera jugadora para empezar a poblar la base administrativa.
            </p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="placeholder-panel crud-card__state">
            <h2 className="placeholder-panel__title">Sin resultados</h2>
            <p className="placeholder-panel__text">
              No encontramos jugadoras que coincidan con la búsqueda actual.
            </p>
          </div>
        ) : (
          <PlayerTable
            players={filteredPlayers}
            onOpenDetails={(player) => navigate(`/admin/jugadores/${player.id}`)}
            onEdit={handleEdit}
            onDelete={setPlayerToDelete}
          />
        )}
      </CrudCard>

      <PlayerForm
        open={isFormOpen}
        player={selectedPlayer}
        teamOptions={teamOptions}
        teamsLoading={teamsLoading}
        submitting={submitting}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedPlayer(null)
        }}
        onSubmit={handleFormSubmit}
      />

      <PlayerDialog
        open={playerToDelete !== null}
        title="Eliminar jugadora"
        description="Esta acción elimina el registro de la jugadora. Podés volver a crearla más adelante si lo necesitás."
        onClose={() => setPlayerToDelete(null)}
        footer={
          <>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setPlayerToDelete(null)}
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
          ¿Seguro que querés eliminar <strong>{playerToDelete?.name}</strong>?
        </p>
      </PlayerDialog>
    </section>
  )
}
