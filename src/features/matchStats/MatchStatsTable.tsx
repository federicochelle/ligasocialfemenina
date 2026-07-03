import type {
  MatchPlayer,
  MatchStatsFormState,
  MatchStatsFormValue,
  MatchWithTeams,
} from './matchStats.types.ts'

type MatchStatsTableProps = {
  match: MatchWithTeams
  players: MatchPlayer[]
  formState: MatchStatsFormState
  disabled?: boolean
  onChange: (
    playerId: string,
    field: keyof MatchStatsFormValue,
    value: string | boolean,
  ) => void
}

function sanitizeNumericInput(value: string) {
  return value.replace(/[^\d]/g, '')
}

function getPlayerLabel(player: MatchPlayer) {
  const position = player.position?.trim() ? ` · ${player.position}` : ''

  return `${player.name}${position}`
}

function renderTeamTable(
  title: string,
  players: MatchPlayer[],
  formState: MatchStatsFormState,
  disabled: boolean | undefined,
  onChange: MatchStatsTableProps['onChange'],
) {
  return (
    <section className="stats-section">
      <h3 className="stats-section__title">{title}</h3>

      <div className="table-card">
        <div className="table-scroll">
          <table className="teams-table match-stats-table">
            <thead>
              <tr>
                <th>Jugadora</th>
                <th>Puntos</th>
                <th>Triples</th>
                <th>Rebotes</th>
                <th>Asistencias</th>
                <th>Tapones</th>
                <th>Faltas</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => {
                const row = formState[player.id]

                return (
                  <tr key={player.id}>
                    <td>
                      <div className="teams-table__name">{getPlayerLabel(player)}</div>
                    </td>
                    <td>
                      <input
                        className="stats-cell-input"
                        inputMode="numeric"
                        value={row.points}
                        disabled={disabled}
                        onChange={(event) =>
                          onChange(player.id, 'points', sanitizeNumericInput(event.target.value))
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="stats-cell-input"
                        inputMode="numeric"
                        value={row.three_pointers}
                        disabled={disabled}
                        onChange={(event) =>
                          onChange(
                            player.id,
                            'three_pointers',
                            sanitizeNumericInput(event.target.value),
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="stats-cell-input"
                        inputMode="numeric"
                        value={row.rebounds}
                        disabled={disabled}
                        onChange={(event) =>
                          onChange(
                            player.id,
                            'rebounds',
                            sanitizeNumericInput(event.target.value),
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="stats-cell-input"
                        inputMode="numeric"
                        value={row.assists}
                        disabled={disabled}
                        onChange={(event) =>
                          onChange(
                            player.id,
                            'assists',
                            sanitizeNumericInput(event.target.value),
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="stats-cell-input"
                        inputMode="numeric"
                        value={row.blocks}
                        disabled={disabled}
                        onChange={(event) =>
                          onChange(player.id, 'blocks', sanitizeNumericInput(event.target.value))
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="stats-cell-input"
                        inputMode="numeric"
                        value={row.fouls}
                        disabled={disabled}
                        onChange={(event) =>
                          onChange(player.id, 'fouls', sanitizeNumericInput(event.target.value))
                        }
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export function MatchStatsTable({
  match,
  players,
  formState,
  disabled,
  onChange,
}: MatchStatsTableProps) {
  const homePlayers = players.filter((player) => player.team_id === match.home_team?.id)
  const awayPlayers = players.filter((player) => player.team_id === match.away_team?.id)

  return (
    <div className="stats-layout">
      {renderTeamTable(match.home_team?.name ?? 'Equipo local', homePlayers, formState, disabled, onChange)}
      {renderTeamTable(match.away_team?.name ?? 'Equipo visitante', awayPlayers, formState, disabled, onChange)}
    </div>
  )
}
