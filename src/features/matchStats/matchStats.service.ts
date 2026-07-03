import { supabase } from '../../lib/supabaseClient.ts'
import type {
  MatchPlayer,
  MatchStatRow,
  MatchWithTeams,
  MatchTeamReference,
  UpsertMatchStatPayload,
} from './matchStats.types.ts'

type MatchWithTeamsRow = Omit<MatchWithTeams, 'home_team' | 'away_team'> & {
  home_team: MatchTeamReference | MatchTeamReference[] | null
  away_team: MatchTeamReference | MatchTeamReference[] | null
}

const matchColumns = `
  id,
  home_team_id,
  away_team_id,
  match_date,
  venue,
  status,
  home_score,
  away_score,
  season_label,
  home_team:teams!matches_home_team_id_fkey(id, name, logo_url),
  away_team:teams!matches_away_team_id_fkey(id, name, logo_url)
`

export async function getMatchWithTeams(matchId: string) {
  const { data, error } = await supabase
    .from('matches')
    .select(matchColumns)
    .eq('id', matchId)
    .single()

  if (error) {
    throw new Error('No pudimos obtener el partido.')
  }

  return mapMatchRow(data as MatchWithTeamsRow) satisfies MatchWithTeams
}

export async function getPlayersForMatch(homeTeamId: string, awayTeamId: string) {
  const { data, error } = await supabase
    .from('players')
    .select('id, team_id, name, jersey_number, position, active')
    .eq('active', true)
    .in('team_id', [homeTeamId, awayTeamId])
    .order('team_id', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    throw new Error('No pudimos obtener las jugadoras del partido.')
  }

  return data satisfies MatchPlayer[]
}

export async function getStatsByMatch(matchId: string) {
  const { data, error } = await supabase
    .from('player_match_stats')
    .select(
      'id, match_id, player_id, points, three_pointers, rebounds, assists, blocks, fouls, minutes_played, starter, created_at, updated_at',
    )
    .eq('match_id', matchId)

  if (error) {
    throw new Error('No pudimos obtener las estadísticas del partido.')
  }

  return data satisfies MatchStatRow[]
}

export async function upsertMatchStats(
  matchId: string,
  stats: UpsertMatchStatPayload[],
) {
  if (stats.length === 0) {
    return
  }

  const payload = stats.map((stat) => ({
    match_id: matchId,
    ...stat,
  }))

  const { error } = await supabase
    .from('player_match_stats')
    .upsert(payload, { onConflict: 'match_id,player_id' })

  if (error) {
    throw new Error('No pudimos guardar las estadísticas del partido.')
  }
}

export async function updateMatchScore(
  matchId: string,
  input: { home_score: number; away_score: number; status: 'finished' },
) {
  const { error } = await supabase.from('matches').update(input).eq('id', matchId)

  if (error) {
    throw new Error('No pudimos guardar el tanteador del partido.')
  }
}

function mapMatchRow(match: MatchWithTeamsRow): MatchWithTeams {
  return {
    ...match,
    home_team: normalizeTeamRelation(match.home_team),
    away_team: normalizeTeamRelation(match.away_team),
  }
}

function normalizeTeamRelation(
  relation: MatchTeamReference | MatchTeamReference[] | null,
) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation
}
