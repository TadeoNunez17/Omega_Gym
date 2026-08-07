import { createClient } from '@supabase/supabase-js'

function createFallbackClient() {
  const handler: ProxyHandler<object> = {
    get() {
      return new Proxy(() => Promise.resolve({ data: null, error: new Error('Supabase no disponible') }), handler)
    },
    apply() {
      return Promise.resolve({ data: null, error: new Error('Supabase no disponible') })
    },
  }
  return new Proxy({}, handler) as unknown as ReturnType<typeof createClient>
}

export const supabase = (() => {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!url || !anonKey) throw new Error('Missing env vars')
    return createClient(url, anonKey, {
      auth: { detectSessionInUrl: false },
    })
  } catch {
    return createFallbackClient()
  }
})()
