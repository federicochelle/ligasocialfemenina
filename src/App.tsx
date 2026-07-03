import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AdminLayout } from './features/admin/AdminLayout.tsx'
import { DashboardPage } from './features/admin/DashboardPage.tsx'
import { AuthProvider } from './features/auth/AuthProvider.tsx'
import { LoginPage } from './features/auth/LoginPage.tsx'
import { MatchStatsPage } from './features/matchStats/MatchStatsPage.tsx'
import { ProtectedRoute } from './features/auth/ProtectedRoute.tsx'
import { MatchesPage } from './features/matches/MatchesPage.tsx'
import { NewsPage } from './features/news/NewsPage.tsx'
import { PlayerDetailPage } from './features/players/PlayerDetailPage.tsx'
import { PlayersPage } from './features/players/PlayersPage.tsx'
import { StatisticsPage } from './features/statistics/StatisticsPage.tsx'
import { TeamsPage } from './features/teams/TeamsPage.tsx'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="equipos" element={<TeamsPage />} />
            <Route path="jugadores" element={<PlayersPage />} />
            <Route path="jugadores/:playerId" element={<PlayerDetailPage />} />
            <Route path="partidos" element={<MatchesPage />} />
            <Route path="estadisticas" element={<StatisticsPage />} />
            <Route path="partidos/:matchId/estadisticas" element={<MatchStatsPage />} />
            <Route path="noticias" element={<NewsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
