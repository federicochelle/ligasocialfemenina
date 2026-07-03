export type StatisticsCategory =
  | 'standings'
  | 'points'
  | 'three_pointers'
  | 'rebounds'
  | 'assists'
  | 'blocks'
  | 'fouls'

export type StatisticsTeamFilter = 'all' | string

export type StatisticsTeamOption = {
  value: StatisticsTeamFilter
  label: string
}

export type StatisticsCategoryOption = {
  value: StatisticsCategory
  label: string
}

export type PlayerLeader = {
  rank: number
  playerId: string
  playerName: string
  teamId: string | null
  teamName: string
  gamesPlayed: number
  total: number
  average: number
}

export type LeadersQueryResult = {
  leaders: PlayerLeader[]
  hasStats: boolean
}

export type StandingRow = {
  rank: number
  teamId: string
  teamName: string
  gamesPlayed: number
  wins: number
  losses: number
  pointsFor: number
  pointsAgainst: number
  pointDifferential: number
  standingsPoints: number
}
