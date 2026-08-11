import logoSrc from '../../../logo.webp'

type HeaderProps = {
  isMobileMenuOpen: boolean
  onToggleMobileMenu: () => void
}

export function Header({ isMobileMenuOpen, onToggleMobileMenu }: HeaderProps) {
  return (
    <header className="admin-header">
      <div className="admin-header__mobile-bar">
        <img className="admin-header__mobile-logo" src={logoSrc} alt="Liga Social Femenina" />

        <button
          className="admin-header__menu-button"
          type="button"
          onClick={onToggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="admin-sidebar-navigation"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
