import type { Match } from './matches.types.ts'
import {
  ChartIcon,
  EditIcon,
  TableActionButton,
  TrashIcon,
} from '../admin/crud/TableActionButton.tsx'

type MatchTableProps = {
  matches: Match[]
  busyMatchId?: string | null
  onEdit: (match: Match) => void
  onDelete: (match: Match) => void
  onStats: (match: Match) => void
}

const dateFormatter = new Intl.DateTimeFormat('es-UY', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function getMatchResult(match: Match) {
  if (match.status === 'scheduled') {
    return 'Pendiente'
  }

  return `${match.home_score ?? 0} - ${match.away_score ?? 0}`
}

export function MatchTable({
  matches,
  busyMatchId,
  onEdit,
  onDelete,
  onStats,
}: MatchTableProps) {
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="teams-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Partido</th>
              <th>Estado</th>
              <th>Resultado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => {
              const isBusy = busyMatchId === match.id

              return (
                <tr key={match.id}>
                  <td>
                    <div className="teams-table__description">
                      {dateFormatter.format(new Date(match.match_date))}
                    </div>
                  </td>
                  <td>
                    <div className="teams-table__name">
                      {match.home_team?.name ?? 'Local'} vs {match.away_team?.name ?? 'Visitante'}
                    </div>
                  </td>
                  <td>
                    <div className="teams-table__description">
                      {match.status === 'finished' ? 'Finalizado' : 'Programado'}
                    </div>
                  </td>
                  <td>
                    <div className="teams-table__description">{getMatchResult(match)}</div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <TableActionButton
                        label="Editar"
                        icon={<EditIcon />}
                        onClick={() => onEdit(match)}
                      />
                      <TableActionButton
                        label="Cargar estadísticas"
                        icon={<ChartIcon />}
                        variant="accent"
                        onClick={() => onStats(match)}
                      />
                      <TableActionButton
                        label="Eliminar"
                        icon={<TrashIcon />}
                        variant="danger"
                        onClick={() => onDelete(match)}
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
