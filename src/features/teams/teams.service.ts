import { supabase } from '../../lib/supabaseClient.ts'
import { uploadTeamLogo as uploadTeamLogoImage } from '../images/image-upload.service.ts'
import type { CreateTeamInput, Team, UpdateTeamInput } from './teams.types.ts'

const teamColumns = 'id, name, logo_url, description, active, created_at, updated_at'
const TEAM_HAS_MATCHES_MESSAGE =
  'No podés eliminar este equipo porque tiene partidos asociados.'

type ServiceErrorLike = {
  code?: string
  message?: string
  details?: string
}

function isForeignKeyConstraintError(error: ServiceErrorLike | null | undefined) {
  if (!error) {
    return false
  }

  const normalizedMessage = [error.message, error.details].join(' ').toLowerCase()

  return error.code === '23503' || normalizedMessage.includes('foreign key')
}

export async function getTeams() {
  const { data, error } = await supabase
    .from('teams')
    .select(teamColumns)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('No pudimos obtener los equipos.')
  }

  return data satisfies Team[]
}

export async function createTeam(input: CreateTeamInput) {
  const { data, error } = await supabase
    .from('teams')
    .insert(input)
    .select(teamColumns)
    .single()

  if (error) {
    throw new Error('No pudimos crear el equipo.')
  }

  return data satisfies Team
}

export async function updateTeam(teamId: string, input: UpdateTeamInput) {
  const { data, error } = await supabase
    .from('teams')
    .update(input)
    .eq('id', teamId)
    .select(teamColumns)
    .single()

  if (error) {
    throw new Error('No pudimos actualizar el equipo.')
  }

  return data satisfies Team
}

export async function deleteTeam(teamId: string) {
  const { error } = await supabase.from('teams').delete().eq('id', teamId)

  if (error) {
    if (isForeignKeyConstraintError(error)) {
      throw new Error(TEAM_HAS_MATCHES_MESSAGE)
    }

    throw new Error('No pudimos eliminar el equipo.')
  }
}

export async function teamHasAssociatedMatches(teamId: string) {
  const { count, error } = await supabase
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)

  if (error) {
    throw new Error('No pudimos verificar si el equipo tiene partidos asociados.')
  }

  return (count ?? 0) > 0
}

export async function toggleTeamActive(teamId: string, active: boolean) {
  const { data, error } = await supabase
    .from('teams')
    .update({ active })
    .eq('id', teamId)
    .select(teamColumns)
    .single()

  if (error) {
    throw new Error('No pudimos actualizar el estado del equipo.')
  }

  return data satisfies Team
}

export async function uploadTeamLogo(file: File) {
  return uploadTeamLogoImage(file)
}
