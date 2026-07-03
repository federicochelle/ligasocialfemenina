import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth.ts'

export function ProtectedRoute() {
  const { loading, session } = useAuth()

  if (loading) {
    return (
      <main className="auth-shell">
        <div className="loading-card" role="status" aria-live="polite">
          Cargando sesión...
        </div>
      </main>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
