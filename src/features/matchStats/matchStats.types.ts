import type { MatchStatus } from '../matches/matches.types.ts'

export type MatchTeamReference = {
  id: string
  name: string
  logo_url: string | null
}

export type MatchWithTeams = {
  id: string
  home_team_id: string
  away_team_id: string
  match_date: string
  venue: string | null
  status: MatchStatus
  home_score: number | null
  away_score: number | null
  season_label: string | null
  home_team: MatchTeamReference | null
  away_team: MatchTeamReference | null
}

export type MatchPlayer = {
  id: string
  team_id: string
  name: string
  jersey_number: number | null
  position: string | null
  active: boolean
}

export type MatchStatRow = {
  id: string
  match_id: string
  player_id: string
  points: number
  three_pointers: number
  rebounds: number
  assists: number
  blocks: number
  fouls: number
  minutes_played: number | null
  starter: boolean
  created_at: string
  updated_at: string
}

export type MatchStatsFormValue = {
  player_id: string
  team_id: string
  starter: boolean
  minutes_played: string
  points: string
  three_pointers: string
  rebounds: string
  assists: string
  blocks: string
  fouls: string
}

export type MatchStatsFormState = Record<string, MatchStatsFormValue>

export type UpsertMatchStatPayload = {
  player_id: string
  points: number
  three_pointers: number
  rebounds: number
  assists: number
  blocks: number
  fouls: number
  minutes_played: number | null
  starter: boolean
}
