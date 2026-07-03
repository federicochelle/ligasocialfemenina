import type { StandingRow } from './statistics.types.ts'

type StandingsTableProps = {
  standings: StandingRow[]
}

export function StandingsTable({ standings }: StandingsTableProps) {
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="teams-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Equipo</th>
              <th>PJ</th>
              <th>PG</th>
              <th>PP</th>
              <th>PF</th>
              <th>PC</th>
              <th>DIF</th>
              <th>PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => (
              <tr key={row.teamId}>
                <td>
                  <div className="statistics-rank">{row.rank}</div>
                </td>
                <td>
                  <div className="teams-table__name">{row.teamName}</div>
                </td>
                <td>
                  <div className="statistics-value">{row.gamesPlayed}</div>
                </td>
                <td>
                  <div className="statistics-value">{row.wins}</div>
                </td>
                <td>
                  <div className="statistics-value">{row.losses}</div>
                </td>
                <td>
                  <div className="statistics-value">{row.pointsFor}</div>
                </td>
                <td>
                  <div className="statistics-value">{row.pointsAgainst}</div>
                </td>
                <td>
                  <div className="statistics-value">{row.pointDifferential}</div>
                </td>
                <td>
                  <div className="statistics-value statistics-value--strong">
                    {row.standingsPoints}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
