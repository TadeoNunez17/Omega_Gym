import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

function createFallbackClient() {
  const handler: ProxyHandler<object> = {
    get() {
      return new Proxy(() => Promise.resolve({ data: null, error: new Error('Supabase no disponible') }), handler)
    },
    apply(_target, _thisArg, _args) {
      return Promise.resolve({ data: null, error: new Error('Supabase no disponible') })
    },
  }
  return new Proxy({}, handler) as unknown as ReturnType<typeof createClientComponentClient>
}

export const supabase = (() => {
  try {
    return createClientComponentClient()
  } catch {
    return createFallbackClient()
  }
})()
