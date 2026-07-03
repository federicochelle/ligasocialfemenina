import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import logoSrc from '../../../logo.webp'
import { supabase } from '../../lib/supabaseClient.ts'
import { useAuth } from './useAuth.ts'

function getFriendlyAuthError(message: string) {
  const normalizedMessage = message.toLowerCase()

  if (
    normalizedMessage.includes('invalid login credentials') ||
    normalizedMessage.includes('email not confirmed')
  ) {
    return 'El email o la contraseña no son correctos.'
  }

  if (normalizedMessage.includes('failed to fetch')) {
    return 'No se pudo conectar con Supabase. Revisá la configuración e intentá de nuevo.'
  }

  return 'No pudimos iniciar sesión. Revisá los datos e intentá nuevamente.'
}

export function LoginPage() {
  const { loading, session } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!loading && session) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage(getFriendlyAuthError(error.message))
      setSubmitting(false)
      return
    }

    setSubmitting(false)
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="login-title">
        <img className="auth-logo" src={logoSrc} alt="Liga Social Femenina" />

        <header className="auth-header">
          <h1 id="login-title">Panel Administrativo</h1>
          <p>Ingresá con tu cuenta de administrador.</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((currentValue) => !currentValue)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={showPassword}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {showPassword ? (
                    <path d="M3 12s3.75-6 9-6 9 6 9 6-3.75 6-9 6-9-6-9-6Zm9 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                  ) : (
                    <path d="m3 4.27 17.73 17.73-1.41 1.41-2.5-2.5A11.98 11.98 0 0 1 12 18c-5.25 0-9-6-9-6a21.77 21.77 0 0 1 4.46-4.95L1.59 5.68 3 4.27Zm7.88 7.88a2.99 2.99 0 0 0 4.97 2.97l-4.97-4.97Zm9.91 1.78a21.9 21.9 0 0 0-3.98-4.49l-1.45 1.45A9.32 9.32 0 0 1 18.97 12a16.3 16.3 0 0 1-3.05 2.96l-1.46-1.46a2.99 2.99 0 0 0-3.96-3.96L8.83 7.87A9.5 9.5 0 0 1 12 7c5.25 0 9 6 9 6-.06.09-.13.22-.21.39Z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </section>
    </main>
  )
}
