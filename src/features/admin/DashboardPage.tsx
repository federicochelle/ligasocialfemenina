import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminToastViewport } from './toast/AdminToastViewport.tsx'
import { getDashboardStats } from './dashboard.service.ts'
import { StatCard } from './StatCard.tsx'
import type { DashboardStats } from './dashboard.types.ts'

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadDashboardStats = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const nextStats = await getDashboardStats()
      setStats(nextStats)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No pudimos cargar el resumen del dashboard.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadDashboardStats()
  }, [loadDashboardStats])

  const statCards = useMemo(() => {
    if (!stats) {
      return []
    }

    return [
      {
        title: 'Equipos',
        value: stats.teams.toString(),
        description: 'Clubes registrados en el panel administrativo.',
      },
      {
        title: 'Jugadoras',
        value: stats.players.toString(),
        description: 'Perfiles de jugadoras disponibles para administración.',
      },
      {
        title: 'Partidos',
        value: stats.matches.toString(),
        description: 'Encuentros creados dentro del fixture de la liga.',
      },
      {
        title: 'Noticias',
        value: stats.news.toString(),
        description: 'Publicaciones editoriales registradas en el panel.',
      },
    ]
  }, [stats])

  return (
    <section className="admin-page">
      <AdminToastViewport
        items={[
          {
            id: 'dashboard-error',
            message: errorMessage,
            variant: 'error',
            onClose: () => setErrorMessage(null),
          },
        ]}
      />

      

      {loading ? (
        <div className="placeholder-panel">
          <h2 className="placeholder-panel__title">Cargando dashboard...</h2>
          <p className="placeholder-panel__text">
            Estamos consultando Supabase para traer el resumen general del panel.
          </p>
        </div>
      ) : statCards.length === 0 ? (
        <div className="placeholder-panel">
          <h2 className="placeholder-panel__title">Sin datos</h2>
          <p className="placeholder-panel__text">
            Todavía no hay información suficiente para mostrar indicadores.
          </p>
        </div>
      ) : (
        <div className="stats-grid">
          {statCards.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              description={stat.description}
            />
          ))}
        </div>
      )}
    </section>
  )
}
