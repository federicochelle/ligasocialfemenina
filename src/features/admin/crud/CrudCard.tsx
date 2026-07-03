import type { ReactNode } from 'react'

type CrudCardProps = {
  toolbar: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function CrudCard({
  toolbar,
  children,
  footer,
}: CrudCardProps) {
  return (
    <section className="crud-card">
      <div className="crud-card__toolbar">{toolbar}</div>
      <div className="crud-card__content">{children}</div>
      {footer ? <div className="crud-card__footer">{footer}</div> : null}
    </section>
  )
}
