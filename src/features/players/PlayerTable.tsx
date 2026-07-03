import type { KeyboardEvent, MouseEvent } from 'react'
import type { Player } from './players.types.ts'
import {
  EditIcon,
  TableActionButton,
  TrashIcon,
} from '../admin/crud/TableActionButton.tsx'

type PlayerTableProps = {
  players: Player[]
  busyPlayerId?: string | null
  onOpenDetails: (player: Player) => void
  onEdit: (player: Player) => void
  onDelete: (player: Player) => void
}

export function PlayerTable({
  players,
  busyPlayerId,
  onOpenDetails,
  onEdit,
  onDelete,
}: PlayerTableProps) {
  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, player: Player) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpenDetails(player)
    }
  }

  const stopPropagation = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
  }

  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="teams-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Equipo</th>
              <th>N°</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => {
              const isBusy = busyPlayerId === player.id

              return (
                <tr
                  key={player.id}
                  className="clickable-row"
                  tabIndex={0}
                  onClick={() => onOpenDetails(player)}
                  onKeyDown={(event) => handleRowKeyDown(event, player)}
                >
                  <td>
                    <div className="teams-table__name">{player.name}</div>
                  </td>
                  <td>
                    <div className="teams-table__description">
                      {player.team?.name ?? 'Sin equipo'}
                    </div>
                  </td>
                  <td>{player.jersey_number ?? 'Sin asignar'}</td>
                  <td>
                    <div className="table-actions">
                      <TableActionButton
                        label="Editar"
                        icon={<EditIcon />}
                        onClick={(event) => {
                          stopPropagation(event)
                          onEdit(player)
                        }}
                      />
                      <TableActionButton
                        label="Eliminar"
                        icon={<TrashIcon />}
                        variant="danger"
                        onClick={(event) => {
                          stopPropagation(event)
                          onDelete(player)
                        }}
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
