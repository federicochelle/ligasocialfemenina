type StatCardProps = {
  title: string
  value: string
  description: string
}

export function StatCard({ title, value, description }: StatCardProps) {
  return (
    <article className="stat-card">
      <p className="stat-card__title">{title}</p>
      <strong className="stat-card__value">{value}</strong>
      <p className="stat-card__description">{description}</p>
    </article>
  )
}
