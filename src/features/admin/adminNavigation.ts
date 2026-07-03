export type AdminNavigationItem = {
  label: string
  path: string
  shortLabel?: string
  icon: 'home' | 'teams' | 'players' | 'matches' | 'statistics' | 'news'
}

export const adminNavigationItems: AdminNavigationItem[] = [
  { label: 'Inicio', path: '/admin', shortLabel: 'Inicio', icon: 'home' },
  { label: 'Equipos', path: '/admin/equipos', icon: 'teams' },
  { label: 'Jugadoras', path: '/admin/jugadores', icon: 'players' },
  { label: 'Partidos', path: '/admin/partidos', icon: 'matches' },
  { label: 'Estadísticas', path: '/admin/estadisticas', icon: 'statistics' },
  { label: 'Noticias', path: '/admin/noticias', icon: 'news' },
]

export function getAdminPageTitle(pathname: string) {
  if (pathname.startsWith('/admin/partidos/') && pathname.endsWith('/estadisticas')) {
    return 'Estadísticas del partido'
  }

  const matchedItem = adminNavigationItems.find((item) => item.path === pathname)

  if (matchedItem?.path === '/admin') {
    return 'Inicio'
  }

  return matchedItem?.label ?? 'Inicio'
}
