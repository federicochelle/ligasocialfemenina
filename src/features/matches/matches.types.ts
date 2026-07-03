export type MatchTeamOption = {
  id: string
  name: string
}

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'cancelled'

export type Match = {
  id: string
  home_team_id: string
  away_team_id: string
  match_date: string
  venue: string | null
  status: MatchStatus
  home_score: number | null
  away_score: number | null
  season_label: string | null
  created_at: string
  updated_at: string
  home_team: MatchTeamOption | null
  away_team: MatchTeamOption | null
}

export type MatchFormValues = {
  home_team_id: string
  away_team_id: string
  match_date: string
  venue: string
  home_score: string
  away_score: string
  season_label: string
}

export type CreateMatchInput = {
  home_team_id: string
  away_team_id: string
  match_date: string
  venue: string | null
  status: MatchStatus
  home_score: number | null
  away_score: number | null
  season_label: string | null
}

export type UpdateMatchInput = CreateMatchInput

export const matchStatusOptions: Array<{ value: MatchStatus; label: string }> = [
  { value: 'scheduled', label: 'Programado' },
  { value: 'live', label: 'En vivo' },
  { value: 'finished', label: 'Finalizado' },
  { value: 'cancelled', label: 'Cancelado' },
]
