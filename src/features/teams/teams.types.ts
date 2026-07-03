export type Team = {
  id: string
  name: string
  logo_url: string | null
  description: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export type TeamFormValues = {
  name: string
  description: string
  active: boolean
  logo_file: File | null
}

export type CreateTeamInput = {
  name: string
  logo_url: string | null
  description: string | null
  active: boolean
}

export type UpdateTeamInput = CreateTeamInput
