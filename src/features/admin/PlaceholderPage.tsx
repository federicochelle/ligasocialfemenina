type PlaceholderPageProps = {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="admin-page">
      <div className="admin-page__intro">
        <div>
          <p className="admin-page__eyebrow">Sección preparada</p>
          <h1 className="admin-page__title">{title}</h1>
        </div>
        <p className="admin-page__description">{description}</p>
      </div>

      <div className="placeholder-panel">
        <h2 className="placeholder-panel__title">Estructura visual lista</h2>
        <p className="placeholder-panel__text">
          Esta vista confirma la navegación, el layout y la jerarquía visual del panel.
          La lógica funcional y los CRUDs se integrarán en la siguiente etapa.
        </p>
      </div>
    </section>
  )
}
