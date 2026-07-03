import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header.tsx'
import { Sidebar } from './Sidebar.tsx'
import { getAdminPageTitle } from './adminNavigation.ts'

export function AdminLayout() {
  const location = useLocation()
  const pageTitle = getAdminPageTitle(location.pathname)

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <Header pageTitle={pageTitle} pathname={location.pathname} />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
