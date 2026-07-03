import { supabase } from '../../lib/supabaseClient.ts'
import type { DashboardStats } from './dashboard.types.ts'

async function getTableCount(table: 'teams' | 'players' | 'matches' | 'news') {
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })

  if (error) {
    throw new Error('No pudimos cargar el resumen del dashboard.')
  }

  return count ?? 0
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [teams, players, matches, news] = await Promise.all([
    getTableCount('teams'),
    getTableCount('players'),
    getTableCount('matches'),
    getTableCount('news'),
  ])

  return {
    teams,
    players,
    matches,
    news,
  }
}
