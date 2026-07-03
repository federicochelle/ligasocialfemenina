import { supabase } from '../../lib/supabaseClient.ts'
import type {
  CreatePlayerInput,
  Player,
  PlayerRecentMatch,
  PlayerStatsSummary,
  PlayerTeamOption,
  UpdatePlayerInput,
} from './players.types.ts'

type PlayerRow = Omit<Player, 'team'> & {
  team: PlayerTeamOption | PlayerTeamOption[] | null
}

type PlayerStatsRow = {
  points: number
  three_pointers: number
  rebounds: number
  assists: number
  blocks: number
  fouls: number
}

type MatchTeamNameRow = {
  name: string
}

type MatchReferenceRow = {
  id: string
  match_date: string
  home_team: MatchTeamNameRow | MatchTeamNameRow[] | null
  away_team: MatchTeamNameRow | MatchTeamNameRow[] | null
}

type PlayerRecentMatchRow = PlayerStatsRow & {
  id: string
  match_id: string
  match: MatchReferenceRow | MatchReferenceRow[] | null
}

const playerColumns = `
  id,
  team_id,
  name,
  jersey_number,
  identity_document,
  phone,
  medical_insurance,
  emergency_contact_name,
  emergency_phone,
  photo_url,
  position,
  active,
  created_at,
  updated_at,
  team:teams(id, name)
`

export async function getPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select(playerColumns)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('No pudimos obtener las jugadoras.')
  }

  return data.map(mapPlayerRow) satisfies Player[]
}

export async function createPlayer(input: CreatePlayerInput) {
  const { data, error } = await supabase
    .from('players')
    .insert(input)
    .select(playerColumns)
    .single()

  if (error) {
    throw new Error('No pudimos crear la jugadora.')
  }

  return mapPlayerRow(data) satisfies Player
}

export async function getPlayerById(playerId: string) {
  const { data, error } = await supabase
    .from('players')
    .select(playerColumns)
    .eq('id', playerId)
    .single()

  if (error) {
    throw new Error('No pudimos obtener la jugadora.')
  }

  return mapPlayerRow(data) satisfies Player
}

export async function updatePlayer(playerId: string, input: UpdatePlayerInput) {
  const { data, error } = await supabase
    .from('players')
    .update(input)
    .eq('id', playerId)
    .select(playerColumns)
    .single()

  if (error) {
    throw new Error('No pudimos actualizar la jugadora.')
  }

  return mapPlayerRow(data) satisfies Player
}

export async function deletePlayer(playerId: string) {
  const { error } = await supabase.from('players').delete().eq('id', playerId)

  if (error) {
    throw new Error('No pudimos eliminar la jugadora.')
  }
}

export async function togglePlayerActive(playerId: string, active: boolean) {
  const { data, error } = await supabase
    .from('players')
    .update({ active })
    .eq('id', playerId)
    .select(playerColumns)
    .single()

  if (error) {
    throw new Error('No pudimos actualizar el estado de la jugadora.')
  }

  return mapPlayerRow(data) satisfies Player
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

  return data satisfies PlayerTeamOption[]
}

export async function getPlayerStatsSummary(playerId: string) {
  const { data, error } = await supabase
    .from('player_match_stats')
    .select('points, three_pointers, rebounds, assists, blocks, fouls')
    .eq('player_id', playerId)

  if (error) {
    throw new Error('No pudimos obtener el resumen estadístico de la jugadora.')
  }

  return buildPlayerStatsSummary(data satisfies PlayerStatsRow[])
}

export async function getPlayerRecentMatches(playerId: string) {
  const { data, error } = await supabase
    .from('player_match_stats')
    .select(
      `
        id,
        match_id,
        points,
        three_pointers,
        rebounds,
        assists,
        blocks,
        fouls,
        match:matches!player_match_stats_match_id_fkey(
          id,
          match_date,
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name)
        )
      `,
    )
    .eq('player_id', playerId)

  if (error) {
    throw new Error('No pudimos obtener los últimos partidos de la jugadora.')
  }

  return (data satisfies PlayerRecentMatchRow[])
    .map(mapPlayerRecentMatch)
    .sort((left, right) => right.match_date.localeCompare(left.match_date))
}

function mapPlayerRow(player: PlayerRow): Player {
  return {
    ...player,
    team: normalizeTeamRelation(player.team),
  }
}

function normalizeTeamRelation(
  relation: PlayerTeamOption | PlayerTeamOption[] | null,
) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation
}

function buildPlayerStatsSummary(rows: PlayerStatsRow[]): PlayerStatsSummary {
  const gamesPlayed = rows.length
  const totals = rows.reduce(
    (accumulator, row) => ({
      points: accumulator.points + row.points,
      three_pointers: accumulator.three_pointers + row.three_pointers,
      rebounds: accumulator.rebounds + row.rebounds,
      assists: accumulator.assists + row.assists,
      blocks: accumulator.blocks + row.blocks,
      fouls: accumulator.fouls + row.fouls,
    }),
    {
      points: 0,
      three_pointers: 0,
      rebounds: 0,
      assists: 0,
      blocks: 0,
      fouls: 0,
    },
  )

  return {
    gamesPlayed,
    totalPoints: totals.points,
    averagePoints: calculateAverage(totals.points, gamesPlayed),
    totalThreePointers: totals.three_pointers,
    averageThreePointers: calculateAverage(totals.three_pointers, gamesPlayed),
    totalRebounds: totals.rebounds,
    averageRebounds: calculateAverage(totals.rebounds, gamesPlayed),
    totalAssists: totals.assists,
    averageAssists: calculateAverage(totals.assists, gamesPlayed),
    totalBlocks: totals.blocks,
    averageBlocks: calculateAverage(totals.blocks, gamesPlayed),
    totalFouls: totals.fouls,
    averageFouls: calculateAverage(totals.fouls, gamesPlayed),
  }
}

function calculateAverage(total: number, gamesPlayed: number) {
  if (gamesPlayed === 0) {
    return 0
  }

  return Number((total / gamesPlayed).toFixed(1))
}

function mapPlayerRecentMatch(row: PlayerRecentMatchRow): PlayerRecentMatch {
  const match = normalizeMatchRelation(row.match)
  const homeTeam = normalizeNameRelation(match?.home_team ?? null)?.name ?? 'Local'
  const awayTeam = normalizeNameRelation(match?.away_team ?? null)?.name ?? 'Visitante'

  return {
    stat_id: row.id,
    match_id: row.match_id,
    match_date: match?.match_date ?? '',
    matchup: `${homeTeam} vs ${awayTeam}`,
    points: row.points,
    three_pointers: row.three_pointers,
    rebounds: row.rebounds,
    assists: row.assists,
    blocks: row.blocks,
    fouls: row.fouls,
  }
}

function normalizeMatchRelation(
  relation: MatchReferenceRow | MatchReferenceRow[] | null,
) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation
}

function normalizeNameRelation(
  relation: MatchTeamNameRow | MatchTeamNameRow[] | null,
) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation
}
