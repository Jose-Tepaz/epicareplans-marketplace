# Dashboard Authentication Setup

El dashboard debe usar el MISMO proyecto de Supabase para compartir autenticación con el marketplace.

## Variables de Entorno (Dashboard)

Crea un archivo `.env.local` en el proyecto del dashboard con las MISMAS credenciales del marketplace:

```bash
NEXT_PUBLIC_SUPABASE_URL=[mismo-url-del-marketplace]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[mismo-anon-key-del-marketplace]
```

## Configuración de Clientes de Supabase

### Cliente del Navegador (`lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        domain: process.env.NODE_ENV === 'production' 
          ? '.epicareplans.com'  // Con punto al inicio para compartir con subdominios
          : undefined,           // En desarrollo usar default
      },
    }
  )
}
```

### Cliente del Servidor (`lib/supabase/server.ts`)

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, {
              ...options,
              domain: process.env.NODE_ENV === 'production'
                ? '.epicareplans.com'
                : undefined,
            })
          } catch (error) {
            // Ignorar errores en Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete(name)
          } catch (error) {
            // Ignorar errores en Server Components
          }
        },
      },
    }
  )
}
```

## Context de Autenticación

Crear el mismo `AuthContext` que en el marketplace para acceder al usuario:

```typescript
// contexts/auth-context.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

## Middleware de Protección

Crear middleware para proteger rutas del dashboard:

```typescript
// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Si no está autenticado, redirigir al marketplace para login
  if (!user && !request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('https://epicareplans.com/login?redirect=dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

## Link de Retorno al Marketplace

Agregar botón en el dashboard para volver al marketplace:

```tsx
// components/back-to-marketplace.tsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function BackToMarketplace() {
  return (
    <Link href="https://epicareplans.com">
      <Button variant="outline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Marketplace
      </Button>
    </Link>
  )
}
```

## Testing

### Probar Autenticación Compartida

1. **Login en Marketplace:**
   - Ve a `https://epicareplans.com`
   - Inicia sesión con tu cuenta
   - Verifica que estés autenticado

2. **Acceder al Dashboard:**
   - Abre una nueva pestaña
   - Ve a `https://dashboard.epicareplans.com`
   - Deberías estar automáticamente autenticado sin necesidad de volver a iniciar sesión

3. **Verificar Cookies:**
   - Abre DevTools > Application > Cookies
   - Busca cookies de Supabase (sb-*)
   - Verifica que el domain sea `.epicareplans.com` (con punto al inicio)

## Notas Importantes

- ✅ Ambos proyectos DEBEN usar el MISMO proyecto de Supabase
- ✅ Las cookies DEBEN configurarse con domain `.epicareplans.com` (con punto)
- ✅ En desarrollo local, las cookies funcionarán solo en cada localhost por separado
- ✅ Para testing local de subdominios, usar herramientas como `ngrok` o editar `/etc/hosts`

## Troubleshooting

### Error: "Usuario no autenticado en dashboard"

- Verificar que ambos proyectos usen las mismas credenciales de Supabase
- Verificar que el domain de cookies esté configurado correctamente
- Limpiar cookies del navegador y volver a intentar

### Error: "Cookies no se comparten"

- Asegurarse que ambos dominios estén bajo el mismo dominio padre (epicareplans.com)
- Verificar en DevTools que las cookies tengan domain `.epicareplans.com`
- En producción, verificar que SSL esté configurado correctamente

