import { useCallback, useEffect, useMemo, useState } from 'react'
import { CrudCard } from '../admin/crud/CrudCard.tsx'
import { CrudToolbar } from '../admin/crud/CrudToolbar.tsx'
import { AdminToastViewport } from '../admin/toast/AdminToastViewport.tsx'
import { StandingsTable } from './StandingsTable.tsx'
import { StatisticsTable } from './StatisticsTable.tsx'
import { getAvailableTeams, getLeaders, getStandings } from './statistics.service.ts'
import type {
  PlayerLeader,
  StandingRow,
  StatisticsCategory,
  StatisticsCategoryOption,
  StatisticsTeamFilter,
  StatisticsTeamOption,
} from './statistics.types.ts'

const categoryOptions: StatisticsCategoryOption[] = [
  { value: 'standings', label: 'Tabla de posiciones' },
  { value: 'points', label: 'Puntos' },
  { value: 'three_pointers', label: 'Triples' },
  { value: 'rebounds', label: 'Rebotes' },
  { value: 'assists', label: 'Asistencias' },
  { value: 'blocks', label: 'Tapones' },
  { value: 'fouls', label: 'Faltas' },
]

export function StatisticsPage() {
  const [category, setCategory] = useState<StatisticsCategory>('points')
  const [teamFilter, setTeamFilter] = useState<StatisticsTeamFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [teamOptions, setTeamOptions] = useState<StatisticsTeamOption[]>([])
  const [leaders, setLeaders] = useState<PlayerLeader[]>([])
  const [standings, setStandings] = useState<StandingRow[]>([])
  const [hasStats, setHasStats] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isStandingsCategory = category === 'standings'

  const selectedCategoryLabel = useMemo(
    () => categoryOptions.find((option) => option.value === category)?.label ?? 'Puntos',
    [category],
  )

  const filteredLeaders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return leaders
    }

    return leaders.filter((leader) =>
      `${leader.playerName} ${leader.teamName}`.toLowerCase().includes(normalizedSearch),
    )
  }, [leaders, searchTerm])

  const filteredStandings = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return standings
    }

    return standings.filter((row) => row.teamName.toLowerCase().includes(normalizedSearch))
  }, [searchTerm, standings])

  const loadStatistics = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const nextTeams = await getAvailableTeams()
      setTeamOptions(nextTeams)

      if (category === 'standings') {
        const nextStandings = await getStandings()
        setStandings(nextStandings)
        setLeaders([])
        setHasStats(true)
        return
      }

      const leadersResult = await getLeaders(category, teamFilter)
      setLeaders(leadersResult.leaders)
      setStandings([])
      setHasStats(leadersResult.hasStats)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No pudimos cargar las estadísticas de la liga.',
      )
    } finally {
      setLoading(false)
    }
  }, [category, teamFilter])

  useEffect(() => {
    void loadStatistics()
  }, [loadStatistics])

  return (
    <section className="admin-page">
      <AdminToastViewport
        items={[
          {
            id: 'statistics-error',
            message: errorMessage,
            variant: 'error',
            onClose: () => setErrorMessage(null),
          },
        ]}
      />

      <CrudCard
        toolbar={
          <CrudToolbar>
            <div className="statistics-toolbar">
              <label className="field statistics-toolbar__field" htmlFor="statistics-category">
                <span>Categoría</span>
                <select
                  id="statistics-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value as StatisticsCategory)}
                  disabled={loading}
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field statistics-toolbar__field" htmlFor="statistics-team">
                <span>Equipo</span>
                <select
                  id="statistics-team"
                  value={teamFilter}
                  onChange={(event) => setTeamFilter(event.target.value as StatisticsTeamFilter)}
                  disabled={loading || isStandingsCategory}
                >
                  {teamOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="search-input statistics-toolbar__search" htmlFor="statistics-search">
                <span className="search-input__label">Buscar</span>
                <input
                  id="statistics-search"
                  type="search"
                  placeholder={isStandingsCategory ? 'Equipo' : 'Jugadora o equipo'}
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  disabled={loading}
                />
              </label>
            </div>
          </CrudToolbar>
        }
      >
        {loading ? (
          <div className="placeholder-panel crud-card__state">
            <h2 className="placeholder-panel__title">Cargando estadísticas...</h2>
            <p className="placeholder-panel__text">
              Estamos consultando Supabase para construir {isStandingsCategory ? 'la tabla de posiciones.' : `el ranking de ${selectedCategoryLabel.toLowerCase()}.`}
            </p>
          </div>
        ) : !hasStats ? (
          <div className="placeholder-panel crud-card__state">
            <h2 className="placeholder-panel__title">Todavía no hay estadísticas</h2>
            <p className="placeholder-panel__text">
              Cuando se carguen planillas de partidos, acá vas a ver las líderes de la liga.
            </p>
          </div>
        ) : isStandingsCategory ? (
          filteredStandings.length === 0 ? (
            <div className="placeholder-panel crud-card__state">
              <h2 className="placeholder-panel__title">Sin resultados</h2>
              <p className="placeholder-panel__text">
                No encontramos equipos que coincidan con la búsqueda actual.
              </p>
            </div>
          ) : (
            <StandingsTable standings={filteredStandings} />
          )
        ) : filteredLeaders.length === 0 ? (
          <div className="placeholder-panel crud-card__state">
            <h2 className="placeholder-panel__title">Sin resultados</h2>
            <p className="placeholder-panel__text">
              No encontramos jugadoras para la combinación actual de categoría, equipo y búsqueda.
            </p>
          </div>
        ) : (
          <StatisticsTable leaders={filteredLeaders} />
        )}
      </CrudCard>
    </section>
  )
}
