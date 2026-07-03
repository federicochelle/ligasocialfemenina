import { StatCard } from './StatCard.tsx'

const stats = [
  {
    title: 'Equipos',
    value: '12',
    description: 'Clubes activos registrados en la temporada actual.',
  },
  {
    title: 'Jugadores',
    value: '184',
    description: 'Perfiles de jugadoras disponibles para administración.',
  },
  {
    title: 'Partidos',
    value: '36',
    description: 'Encuentros planificados o cargados como referencia inicial.',
  },
  {
    title: 'Noticias',
    value: '08',
    description: 'Publicaciones editoriales previstas para el panel.',
  },
]

export function DashboardPage() {
  return (
    <section className="admin-page">
      <div className="admin-page__intro">
        <div>
          <p className="admin-page__eyebrow">Vista general</p>
          <h1 className="admin-page__title">Inicio</h1>
        </div>
        <p className="admin-page__description">
          Resumen visual del entorno de administración. Los datos son placeholders
          mientras terminamos la estructura base del panel.
        </p>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
          />
        ))}
      </div>
    </section>
  )
}
