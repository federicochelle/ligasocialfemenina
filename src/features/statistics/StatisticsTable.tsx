import type { PlayerLeader } from './statistics.types.ts'

type StatisticsTableProps = {
  leaders: PlayerLeader[]
}

export function StatisticsTable({ leaders }: StatisticsTableProps) {
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="teams-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Jugadora</th>
              <th>Equipo</th>
              <th>PJ</th>
              <th>Total</th>
              <th>Promedio</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((leader) => (
              <tr key={leader.playerId}>
                <td>
                  <div className="statistics-rank">{leader.rank}</div>
                </td>
                <td>
                  <div className="teams-table__name">{leader.playerName}</div>
                </td>
                <td>
                  <div className="teams-table__description">{leader.teamName}</div>
                </td>
                <td>
                  <div className="statistics-value">{leader.gamesPlayed}</div>
                </td>
                <td>
                  <div className="statistics-value statistics-value--strong">{leader.total}</div>
                </td>
                <td>
                  <div className="statistics-value">{leader.average.toFixed(1)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
