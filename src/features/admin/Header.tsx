import { useMemo } from 'react'
import { useAuth } from '../auth/useAuth.ts'
import { adminNavigationItems } from './adminNavigation.ts'

type HeaderProps = {
  pageTitle: string
  pathname: string
}

function getUserDisplayName(email: string | undefined) {
  if (!email) {
    return 'Administrador'
  }

  return email.split('@')[0] ?? email
}

function getBreadcrumb(pathname: string) {
  if (pathname.startsWith('/admin/partidos/') && pathname.endsWith('/estadisticas')) {
    return 'Partidos / Estadísticas'
  }

  const matchedItem = adminNavigationItems.find((item) => item.path === pathname)

  return matchedItem?.shortLabel ?? matchedItem?.label ?? 'Inicio'
}

export function Header({ pageTitle, pathname }: HeaderProps) {
  const { user } = useAuth()

  const breadcrumb = useMemo(() => getBreadcrumb(pathname), [pathname])

  return (
    <header className="admin-header">
      <div>
        <p className="admin-header__breadcrumb">Admin / {breadcrumb}</p>
        <h2 className="admin-header__title">{pageTitle}</h2>
      </div>

      <div className="admin-header__user">
        <span className="admin-header__user-label">Sesión activa</span>
        <strong className="admin-header__user-name">{getUserDisplayName(user?.email)}</strong>
      </div>
    </header>
  )
}
