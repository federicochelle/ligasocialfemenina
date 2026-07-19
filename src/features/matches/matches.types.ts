export type MatchTeamOption = {
  id: string
  name: string
}

export type MatchdayOption = {
  id: string
  round_number: number
  match_date: string
  venue: string | null
  season_label: string | null
  phase: string | null
  bye_team_id: string | null
}

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'cancelled'
export type MatchField = 'Welcome' | 'Colón'

export type Match = {
  id: string
  home_team_id: string
  away_team_id: string
  matchday_id: string | null
  match_date: string
  field: MatchField | null
  venue: string | null
  status: MatchStatus
  home_score: number | null
  away_score: number | null
  season_label: string | null
  created_at: string
  updated_at: string
  home_team: MatchTeamOption | null
  away_team: MatchTeamOption | null
  matchday: Omit<MatchdayOption, 'bye_team_id'> | null
}

export type MatchFormValues = {
  matchday_id: string
  home_team_id: string
  away_team_id: string
  match_date: string
  field: MatchField | ''
  venue: string
  home_score: string
  away_score: string
  season_label: string
}

export type CreateMatchInput = {
  matchday_id: string
  home_team_id: string
  away_team_id: string
  match_date: string
  field: MatchField | null
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
