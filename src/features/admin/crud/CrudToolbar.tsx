import type { ReactNode } from 'react'

type CrudToolbarProps = {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  primaryAction?: () => void
  primaryLabel?: string
  primaryDisabled?: boolean
  children?: ReactNode
}

export function CrudToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  primaryAction,
  primaryLabel,
  primaryDisabled,
  children,
}: CrudToolbarProps) {
  return (
    <div className="crud-toolbar">
      {children ? (
        children
      ) : (
        <label className="search-input crud-toolbar__search" htmlFor="crud-search">
          <span className="search-input__label">Buscar</span>
          <input
            id="crud-search"
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
          />
        </label>
      )}

      {primaryAction && primaryLabel ? (
        <button type="button" className="primary-button" onClick={primaryAction} disabled={primaryDisabled}>
          {primaryLabel}
        </button>
      ) : null}
    </div>
  )
}
