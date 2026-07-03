import type { ButtonHTMLAttributes, ReactNode } from 'react'

type TableActionButtonProps = {
  label: string
  icon: ReactNode
  variant?: 'default' | 'accent' | 'danger'
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

export function TableActionButton({
  label,
  icon,
  variant = 'default',
  className,
  type = 'button',
  ...props
}: TableActionButtonProps) {
  const classes = ['action-icon-button', `action-icon-button--${variant}`]

  if (className) {
    classes.push(className)
  }

  return (
    <button type={type} className={classes.join(' ')} aria-label={label} title={label} {...props}>
      <span className="action-icon-button__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="action-icon-button__tooltip" aria-hidden="true">
        {label}
      </span>
    </button>
  )
}

type IconProps = {
  className?: string
}

export function EditIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="m16.5 3.5 4 4L8 20l-5 1 1-5 12.5-12.5Z" />
    </svg>
  )
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

export function PowerIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v10" />
      <path d="M7.8 4.8a8 8 0 1 0 8.4 0" />
    </svg>
  )
}

export function ChartIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20V10" />
      <path d="M12 20V4" />
      <path d="M20 20v-7" />
      <path d="M3 20h18" />
    </svg>
  )
}
