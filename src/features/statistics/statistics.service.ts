import { supabase } from '../../lib/supabaseClient.ts'
import type {
  LeadersQueryResult,
  PlayerLeader,
  StandingRow,
  StatisticsCategory,
  StatisticsTeamFilter,
  StatisticsTeamOption,
} from './statistics.types.ts'

type StatRow = {
  id: string
  match_id: string
  points: number
  three_pointers: number
  rebounds: number
  assists: number
  blocks: number
  fouls: number
  player: {
    id: string
    name: string
    team_id: string | null
    team: {
      id: string
      name: string
    } | null
  } | null
}

type StatRowRelation = Omit<StatRow, 'player'> & {
  player:
    | Array<{
        id: string
        name: string
        team_id: string | null
        team: Array<{
          id: string
          name: string
        }> | {
          id: string
          name: string
        } | null
      }>
    | {
        id: string
        name: string
        team_id: string | null
        team: Array<{
          id: string
          name: string
        }> | {
          id: string
          name: string
        } | null
      }
    | null
}

type PlayerAccumulator = Omit<PlayerLeader, 'rank'> & {
  matchIds: Set<string>
}

type StandingAccumulator = Omit<StandingRow, 'rank' | 'pointDifferential' | 'standingsPoints'>

type TeamRow = {
  id: string
  name: string
}

type StandingMatchRow = {
  home_team_id: string
  away_team_id: string
  home_score: number | null
  away_score: number | null
}

type LeaderStatisticsCategory = Exclude<StatisticsCategory, 'standings'>

const statColumnsByCategory: Record<LeaderStatisticsCategory, keyof StatRow> = {
  points: 'points',
  three_pointers: 'three_pointers',
  rebounds: 'rebounds',
  assists: 'assists',
  blocks: 'blocks',
  fouls: 'fouls',
}

const playerMatchStatsSelect = `
  id,
  match_id,
  points,
  three_pointers,
  rebounds,
  assists,
  blocks,
  fouls,
  player:players!inner(
    id,
    name,
    team_id,
    team:teams(id, name)
  )
`

export async function getAvailableTeams(): Promise<StatisticsTeamOption[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('id, name')
    .order('name', { ascending: true })

  if (error) {
    throw new Error('No pudimos cargar los equipos disponibles.')
  }

  return [
    { value: 'all', label: 'Todos los equipos' },
    ...data.map((team) => ({
      value: team.id,
      label: team.name,
    })),
  ]
}

export async function getLeaders(
  category: LeaderStatisticsCategory,
  teamId: StatisticsTeamFilter,
): Promise<LeadersQueryResult> {
  const { count, error: countError } = await supabase
    .from('player_match_stats')
    .select('id', { count: 'exact', head: true })

  if (countError) {
    throw new Error('No pudimos consultar el resumen de estadísticas.')
  }

  const hasStats = (count ?? 0) > 0

  if (!hasStats) {
    return { leaders: [], hasStats: false }
  }

  const { data, error } = await supabase
    .from('player_match_stats')
    .select(playerMatchStatsSelect)

  if (error) {
    throw new Error('No pudimos obtener los rankings de estadísticas.')
  }

  const normalizedRows = normalizeStatRows(data as StatRowRelation[])
  const filteredRows =
    teamId === 'all' ? normalizedRows : normalizedRows.filter((row) => row.player?.team_id === teamId)
  const leaders = buildLeaders(filteredRows, category)

  return {
    leaders,
    hasStats: true,
  }
}

export async function getStandings(): Promise<StandingRow[]> {
  const [{ data: teams, error: teamsError }, { data: matches, error: matchesError }] =
    await Promise.all([
      supabase.from('teams').select('id, name').order('name', { ascending: true }),
      supabase
        .from('matches')
        .select('home_team_id, away_team_id, home_score, away_score')
        .eq('status', 'finished'),
    ])

  if (teamsError) {
    throw new Error('No pudimos cargar los equipos para la tabla de posiciones.')
  }

  if (matchesError) {
    throw new Error('No pudimos calcular la tabla de posiciones.')
  }

  return buildStandings(teams satisfies TeamRow[], matches satisfies StandingMatchRow[])
}

function buildLeaders(
  rows: StatRow[],
  category: LeaderStatisticsCategory,
) {
  const statKey = statColumnsByCategory[category]
  const leadersByPlayer = new Map<string, PlayerAccumulator>()

  for (const row of rows) {
    if (!row.player) {
      continue
    }

    const currentValue = Number(row[statKey] ?? 0)
    const existing = leadersByPlayer.get(row.player.id)

    if (existing) {
      existing.total += currentValue
      existing.matchIds.add(row.match_id)
      continue
    }

    leadersByPlayer.set(row.player.id, {
      playerId: row.player.id,
      playerName: row.player.name,
      teamId: row.player.team?.id ?? row.player.team_id,
      teamName: row.player.team?.name ?? 'Sin equipo',
      gamesPlayed: 0,
      total: currentValue,
      average: 0,
      matchIds: new Set([row.match_id]),
    })
  }

  return Array.from(leadersByPlayer.values())
    .map((leader) => {
      const gamesPlayed = leader.matchIds.size
      const average = gamesPlayed > 0 ? leader.total / gamesPlayed : 0

      return {
        rank: 0,
        playerId: leader.playerId,
        playerName: leader.playerName,
        teamId: leader.teamId,
        teamName: leader.teamName,
        gamesPlayed,
        total: leader.total,
        average,
      } satisfies PlayerLeader
    })
    .sort((left, right) => {
      if (right.total !== left.total) {
        return right.total - left.total
      }

      if (right.average !== left.average) {
        return right.average - left.average
      }

      if (right.gamesPlayed !== left.gamesPlayed) {
        return right.gamesPlayed - left.gamesPlayed
      }

      return left.playerName.localeCompare(right.playerName, 'es')
    })
    .map((leader, index) => ({
      ...leader,
      rank: index + 1,
    }))
}

function normalizeStatRows(rows: StatRowRelation[]) {
  return rows.map((row) => {
    const player = Array.isArray(row.player) ? (row.player[0] ?? null) : row.player
    const team = Array.isArray(player?.team) ? (player?.team[0] ?? null) : player?.team ?? null

    return {
      ...row,
      player: player
        ? {
            ...player,
            team,
          }
        : null,
    } satisfies StatRow
  })
}

function buildStandings(teams: TeamRow[], matches: StandingMatchRow[]) {
  const standingsByTeam = new Map<string, StandingAccumulator>(
    teams.map((team) => [
      team.id,
      {
        teamId: team.id,
        teamName: team.name,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
      },
    ]),
  )

  for (const match of matches) {
    const home = standingsByTeam.get(match.home_team_id)
    const away = standingsByTeam.get(match.away_team_id)

    if (!home || !away) {
      continue
    }

    const homeScore = Number(match.home_score ?? 0)
    const awayScore = Number(match.away_score ?? 0)

    home.gamesPlayed += 1
    away.gamesPlayed += 1
    home.pointsFor += homeScore
    home.pointsAgainst += awayScore
    away.pointsFor += awayScore
    away.pointsAgainst += homeScore

    if (homeScore > awayScore) {
      home.wins += 1
      away.losses += 1
      continue
    }

    if (awayScore > homeScore) {
      away.wins += 1
      home.losses += 1
      continue
    }

    // Defensive fallback for unexpected tied finished matches.
    home.losses += 1
    away.losses += 1
  }

  return Array.from(standingsByTeam.values())
    .map((team) => {
      const pointDifferential = team.pointsFor - team.pointsAgainst
      const standingsPoints = team.wins * 2 + team.losses

      return {
        ...team,
        rank: 0,
        pointDifferential,
        standingsPoints,
      } satisfies StandingRow
    })
    .sort((left, right) => {
      if (right.standingsPoints !== left.standingsPoints) {
        return right.standingsPoints - left.standingsPoints
      }

      if (right.pointDifferential !== left.pointDifferential) {
        return right.pointDifferential - left.pointDifferential
      }

      if (right.pointsFor !== left.pointsFor) {
        return right.pointsFor - left.pointsFor
      }

      return left.teamName.localeCompare(right.teamName, 'es')
    })
    .map((team, index) => ({
      ...team,
      rank: index + 1,
    }))
}
