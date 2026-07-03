import { useEffect, useState } from 'react'

export type AdminToastVariant = 'success' | 'error' | 'info'

export type AdminToastItem = {
  id: string
  message: string | null
  variant: AdminToastVariant
  onClose: () => void
}

type AdminToastViewportProps = {
  items: AdminToastItem[]
}

const TOAST_DURATION_MS = 3000
const TOAST_EXIT_MS = 220

export function AdminToastViewport({ items }: AdminToastViewportProps) {
  const visibleItems = items.filter((item) => item.message)

  if (visibleItems.length === 0) {
    return null
  }

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {visibleItems.map((item) => (
        <AdminToastNotice
          key={`${item.id}-${item.message}`}
          message={item.message ?? ''}
          variant={item.variant}
          onClose={item.onClose}
        />
      ))}
    </div>
  )
}

type AdminToastNoticeProps = {
  message: string
  variant: AdminToastVariant
  onClose: () => void
}

function AdminToastNotice({ message, variant, onClose }: AdminToastNoticeProps) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    setIsClosing(false)

    const dismissTimer = window.setTimeout(() => {
      setIsClosing(true)
    }, TOAST_DURATION_MS)

    return () => window.clearTimeout(dismissTimer)
  }, [message])

  useEffect(() => {
    if (!isClosing) {
      return
    }

    const closeTimer = window.setTimeout(() => {
      onClose()
    }, TOAST_EXIT_MS)

    return () => window.clearTimeout(closeTimer)
  }, [isClosing, onClose])

  return (
    <div
      className={`admin-toast admin-toast--${variant} ${
        isClosing ? 'admin-toast--closing' : 'admin-toast--open'
      }`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <p className="admin-toast__message">{message}</p>
      <button
        type="button"
        className="admin-toast__close"
        onClick={() => setIsClosing(true)}
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  )
}
