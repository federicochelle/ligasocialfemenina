import { useCallback, useEffect, useMemo, useState } from 'react'
import { CrudCard } from '../admin/crud/CrudCard.tsx'
import { CrudToolbar } from '../admin/crud/CrudToolbar.tsx'
import { AdminToastViewport } from '../admin/toast/AdminToastViewport.tsx'
import { TeamDialog } from './TeamDialog.tsx'
import { TeamForm } from './TeamForm.tsx'
import { TeamTable } from './TeamTable.tsx'
import {
  createTeam,
  deleteTeam,
  getTeams,
  teamHasAssociatedMatches,
  uploadTeamImage,
  uploadTeamLogo,
  updateTeam,
} from './teams.service.ts'
import type { Team, TeamFormValues } from './teams.types.ts'

const TEAM_HAS_MATCHES_MESSAGE =
  'No podés eliminar este equipo porque tiene partidos asociados.'

async function mapFormValues(values: TeamFormValues, currentTeam?: Team | null) {
  const logo_url = values.logo_file
    ? await uploadTeamLogo(values.logo_file)
    : currentTeam?.logo_url ?? null
  const image_url = values.image_file
    ? await uploadTeamImage(values.image_file)
    : currentTeam?.image_url ?? null

  return {
    name: values.name,
    description: values.description || null,
    logo_url,
    image_url,
    active: values.active,
  }
}

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitStatusMessage, setSubmitStatusMessage] = useState<string | null>(null)

  const loadTeams = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const nextTeams = await getTeams()
      setTeams(nextTeams)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No pudimos cargar los equipos.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTeams()
  }, [loadTeams])

  const filteredTeams = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return teams
    }

    return teams.filter((team) => {
      const searchableContent = [team.name, team.description ?? '']
        .join(' ')
        .toLowerCase()

      return searchableContent.includes(normalizedSearch)
    })
  }, [searchTerm, teams])

  const openCreateDialog = () => {
    setSelectedTeam(null)
    setIsFormOpen(true)
  }

  const handleEdit = (team: Team) => {
    setSelectedTeam(team)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (values: TeamFormValues) => {
    setSubmitting(true)
    setErrorMessage(null)
    setSubmitStatusMessage(
      values.logo_file || values.image_file ? 'Optimizando y subiendo imágenes...' : null,
    )

    try {
      if (selectedTeam) {
        await updateTeam(selectedTeam.id, await mapFormValues(values, selectedTeam))
        setFeedbackMessage('Equipo actualizado correctamente.')
      } else {
        await createTeam(await mapFormValues(values))
        setFeedbackMessage('Equipo creado correctamente.')
      }

      setIsFormOpen(false)
      setSelectedTeam(null)
      await loadTeams()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No pudimos guardar el equipo.',
      )
    } finally {
      setSubmitting(false)
      setSubmitStatusMessage(null)
    }
  }

  const handleDelete = async () => {
    if (!teamToDelete) {
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      const hasAssociatedMatches = await teamHasAssociatedMatches(teamToDelete.id)

      if (hasAssociatedMatches) {
        setTeamToDelete(null)
        setErrorMessage(TEAM_HAS_MATCHES_MESSAGE)
        return
      }

      await deleteTeam(teamToDelete.id)
      setTeamToDelete(null)
      setFeedbackMessage('Equipo eliminado correctamente.')
      await loadTeams()
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message === TEAM_HAS_MATCHES_MESSAGE
          ? error.message
          : 'No pudimos eliminar el equipo.',
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
            id: 'teams-feedback',
            message: feedbackMessage,
            variant: 'success',
            onClose: () => setFeedbackMessage(null),
          },
          {
            id: 'teams-error',
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
            searchPlaceholder="Buscar por nombre o descripción"
            primaryAction={openCreateDialog}
            primaryLabel="+ Nuevo equipo"
          />
        }
      >
        {loading ? (
          <div className="placeholder-panel crud-card__state">
            <h2 className="placeholder-panel__title">Cargando equipos...</h2>
            <p className="placeholder-panel__text">
              Estamos consultando Supabase para traer el listado actualizado.
            </p>
          </div>
        ) : teams.length === 0 ? (
          <div className="placeholder-panel crud-card__state">
            <h2 className="placeholder-panel__title">Todavía no hay equipos</h2>
            <p className="placeholder-panel__text">
              Creá el primer equipo para empezar a poblar la base administrativa.
            </p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="placeholder-panel crud-card__state">
            <h2 className="placeholder-panel__title">Sin resultados</h2>
            <p className="placeholder-panel__text">
              No encontramos equipos que coincidan con la búsqueda actual.
            </p>
          </div>
        ) : (
          <TeamTable
            teams={filteredTeams}
            onEdit={handleEdit}
            onDelete={setTeamToDelete}
          />
        )}
      </CrudCard>

      <TeamForm
        open={isFormOpen}
        team={selectedTeam}
        submitting={submitting}
        submitStatusMessage={submitStatusMessage}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedTeam(null)
        }}
        onSubmit={handleFormSubmit}
      />

      <TeamDialog
        open={teamToDelete !== null}
        title="Eliminar equipo"
        description=""
        onClose={() => setTeamToDelete(null)}
        footer={
          <>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setTeamToDelete(null)}
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
          ¿Seguro que querés eliminar <strong>{teamToDelete?.name}</strong>?
        </p>
      </TeamDialog>
    </section>
  )
}
