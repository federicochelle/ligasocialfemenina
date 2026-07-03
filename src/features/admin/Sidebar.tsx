import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import logoSrc from '../../../logo.webp'
import { supabase } from '../../lib/supabaseClient.ts'
import { adminNavigationItems } from './adminNavigation.ts'

function SidebarIcon({ icon }: { icon: (typeof adminNavigationItems)[number]['icon'] }) {
  switch (icon) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
        </svg>
      )
    case 'teams':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'players':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M5 21a7 7 0 0 1 14 0" />
        </svg>
      )
    case 'matches':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
          <path d="M8 4v16" />
          <path d="M16 4v16" />
        </svg>
      )
    case 'statistics':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20V10" />
          <path d="M10 20V4" />
          <path d="M16 20v-7" />
          <path d="M22 20v-11" />
        </svg>
      )
    case 'news':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 5h11a3 3 0 0 1 3 3v11H8a3 3 0 0 1-3-3V5Z" />
          <path d="M8 9h8" />
          <path d="M8 13h8" />
          <path d="M8 17h5" />
          <path d="M5 5v11a3 3 0 0 0 3 3" />
        </svg>
      )
  }
}

export function Sidebar() {
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    setErrorMessage(null)

    const { error } = await supabase.auth.signOut()

    if (error) {
      setErrorMessage('No pudimos cerrar la sesión. Intentá nuevamente.')
      setIsSigningOut(false)
      return
    }

    navigate('/login', { replace: true })
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <img className="sidebar__logo" src={logoSrc} alt="Liga Social Femenina" />
      </div>

      <div className="sidebar__divider" aria-hidden="true" />

      <nav className="sidebar__nav" aria-label="Navegación principal">
        {adminNavigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
            }
          >
            <span className="sidebar__link-icon" aria-hidden="true">
              <SidebarIcon icon={item.icon} />
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        <button
          className="secondary-button sidebar__signout"
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? 'Cerrando...' : 'Cerrar sesión'}
        </button>
      </div>
    </aside>
  )
}
