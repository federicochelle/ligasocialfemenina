import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const missingEnvVars = [
  !supabaseUrl ? 'VITE_SUPABASE_URL' : null,
  !supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : null,
].filter((value): value is string => value !== null)

if (missingEnvVars.length > 0) {
  const message = [
    `Missing Supabase environment variables: ${missingEnvVars.join(', ')}`,
    'Define them in the project root .env file and restart the Vite dev server.',
  ].join(' ')

  if (import.meta.env.DEV) {
    throw new Error(message)
  }

  console.error(message)
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')
