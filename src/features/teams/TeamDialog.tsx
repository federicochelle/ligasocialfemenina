import { type ReactNode } from 'react'

type TeamDialogProps = {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  panelClassName?: string
  onClose: () => void
}

export function TeamDialog({
  open,
  title,
  description,
  children,
  footer,
  panelClassName,
  onClose,
}: TeamDialogProps) {
  if (!open) {
    return null
  }

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <section
        className={panelClassName ? `dialog-panel ${panelClassName}` : 'dialog-panel'}
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="dialog-header">
          <div>
            <h2 id="team-dialog-title" className="dialog-title">
              {title}
            </h2>
            {description ? <p className="dialog-description">{description}</p> : null}
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </header>

        <div className="dialog-body">{children}</div>

        {footer ? <footer className="dialog-footer">{footer}</footer> : null}
      </section>
    </div>
  )
}
