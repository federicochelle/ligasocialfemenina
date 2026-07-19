import { supabase } from '../../lib/supabaseClient.ts'
import type {
  CreateMatchInput,
  Match,
  MatchdayOption,
  MatchTeamOption,
  UpdateMatchInput,
} from './matches.types.ts'

type MatchRow = Omit<Match, 'home_team' | 'away_team' | 'matchday'> & {
  home_team: MatchTeamOption | MatchTeamOption[] | null
  away_team: MatchTeamOption | MatchTeamOption[] | null
  matchday: Omit<MatchdayOption, 'bye_team_id'> | Omit<MatchdayOption, 'bye_team_id'>[] | null
}

const matchColumns = `
  id,
  home_team_id,
  away_team_id,
  matchday_id,
  match_date,
  field,
  venue,
  status,
  home_score,
  away_score,
  season_label,
  created_at,
  updated_at,
  matchday:matchdays!matches_matchday_id_fkey(id, round_number, match_date, venue, season_label, phase),
  home_team:teams!matches_home_team_id_fkey(id, name),
  away_team:teams!matches_away_team_id_fkey(id, name)
`

function resolveMatchStatus(
  homeScore: number | null,
  awayScore: number | null,
): CreateMatchInput['status'] {
  return homeScore !== null && awayScore !== null ? 'finished' : 'scheduled'
}

function normalizeMatchInputStatus<T extends CreateMatchInput | UpdateMatchInput>(input: T): T {
  return {
    ...input,
    status: resolveMatchStatus(input.home_score, input.away_score),
  }
}

export async function getMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select(matchColumns)
    .order('match_date', { ascending: false })

  if (error) {
    throw new Error('No pudimos obtener los partidos.')
  }

  return data.map(mapMatchRow) satisfies Match[]
}

export async function createMatch(input: CreateMatchInput) {
  const normalizedInput = normalizeMatchInputStatus(input)
  console.log('Payload createMatch:', normalizedInput)

  const { data, error } = await supabase
    .from('matches')
    .insert(normalizedInput)
    .select(matchColumns)
    .single()

  if (error) {
    console.error(error)
    console.error({
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    })
    throw new Error('No pudimos crear el partido.')
  }

  return mapMatchRow(data) satisfies Match
}

export async function updateMatch(matchId: string, input: UpdateMatchInput) {
  const normalizedInput = normalizeMatchInputStatus(input)
  const { data, error } = await supabase
    .from('matches')
    .update(normalizedInput)
    .eq('id', matchId)
    .select(matchColumns)
    .single()

  if (error) {
    throw new Error('No pudimos actualizar el partido.')
  }

  return mapMatchRow(data) satisfies Match
}

export async function deleteMatch(matchId: string) {
  const { error } = await supabase.from('matches').delete().eq('id', matchId)

  if (error) {
    throw new Error('No pudimos eliminar el partido.')
  }
}

export async function getActiveTeams() {
  const { data, error } = await supabase
    .from('teams')
    .select('id, name')
    .eq('active', true)
    .order('name', { ascending: true })

  if (error) {
    throw new Error('No pudimos cargar los equipos activos.')
  }

  return data satisfies MatchTeamOption[]
}

export async function getMatchdays() {
  const { data, error } = await supabase
    .from('matchdays')
    .select('id, round_number, match_date, venue, season_label, phase, bye_team_id')
    .eq('season_label', 'LSF 2026')
    .eq('phase', 'regular')
    .order('season_label', { ascending: true })
    .order('phase', { ascending: true })
    .order('round_number', { ascending: true })

  if (error) {
    throw new Error('No pudimos cargar las fechas.')
  }

  return data satisfies MatchdayOption[]
}

function mapMatchRow(match: MatchRow): Match {
  return {
    ...match,
    matchday: normalizeMatchdayRelation(match.matchday),
    home_team: normalizeTeamRelation(match.home_team),
    away_team: normalizeTeamRelation(match.away_team),
  }
}

function normalizeTeamRelation(
  relation: MatchTeamOption | MatchTeamOption[] | null,
) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation
}

function normalizeMatchdayRelation(
  relation: Omit<MatchdayOption, 'bye_team_id'> | Omit<MatchdayOption, 'bye_team_id'>[] | null,
) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation
}
