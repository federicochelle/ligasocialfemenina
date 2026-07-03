import type { Team } from './teams.types.ts'
import {
  EditIcon,
  TableActionButton,
  TrashIcon,
} from '../admin/crud/TableActionButton.tsx'

type TeamTableProps = {
  teams: Team[]
  busyTeamId?: string | null
  onEdit: (team: Team) => void
  onDelete: (team: Team) => void
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function TeamTable({
  teams,
  busyTeamId,
  onEdit,
  onDelete,
}: TeamTableProps) {
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="teams-table">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => {
              const isBusy = busyTeamId === team.id

              return (
                <tr key={team.id}>
                  <td className="teams-table__logo-cell">
                    {team.logo_url ? (
                      <div className="team-logo-image-wrapper">
                        <img
                          className="team-logo-image"
                          src={team.logo_url}
                          alt={`Logo de ${team.name}`}
                        />
                      </div>
                    ) : (
                      <div className="team-logo-fallback" aria-hidden="true">
                        {getInitials(team.name)}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="teams-table__name">{team.name}</div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <TableActionButton
                        label="Editar"
                        icon={<EditIcon />}
                        onClick={() => onEdit(team)}
                      />
                      <TableActionButton
                        label="Eliminar"
                        icon={<TrashIcon />}
                        variant="danger"
                        onClick={() => onDelete(team)}
                        disabled={isBusy}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
