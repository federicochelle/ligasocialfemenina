export type PlayerTeamOption = {
  id: string
  name: string
}

export type Player = {
  id: string
  team_id: string
  name: string
  jersey_number: number | null
  identity_document: string | null
  phone: string | null
  medical_insurance: string | null
  emergency_contact_name: string | null
  emergency_phone: string | null
  photo_url: string | null
  position: string | null
  active: boolean
  created_at: string
  updated_at: string
  team: PlayerTeamOption | null
}

export type PlayerFormValues = {
  team_id: string
  name: string
  jersey_number: string
  identity_document: string
  phone: string
  medical_insurance: string
  emergency_phone: string
}

export type CreatePlayerInput = {
  team_id: string
  name: string
  jersey_number: number | null
  identity_document: string | null
  phone: string | null
  medical_insurance: string | null
  emergency_contact_name: string | null
  emergency_phone: string | null
  photo_url: string | null
  position: string | null
  active: boolean
}

export type UpdatePlayerInput = CreatePlayerInput

export type PlayerStatsSummary = {
  gamesPlayed: number
  totalPoints: number
  averagePoints: number
  totalThreePointers: number
  averageThreePointers: number
  totalRebounds: number
  averageRebounds: number
  totalAssists: number
  averageAssists: number
  totalBlocks: number
  averageBlocks: number
  totalFouls: number
  averageFouls: number
}

export type PlayerRecentMatch = {
  stat_id: string
  match_id: string
  match_date: string
  matchup: string
  points: number
  three_pointers: number
  rebounds: number
  assists: number
  blocks: number
  fouls: number
}
