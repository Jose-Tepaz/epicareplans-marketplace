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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      
          // Cuando un usuario hace login (SIGNED_IN), llamar siempre al endpoint
          // para manejar tanto la asignación por cookie como la asignación por defecto (secundaria)
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('🔐 Usuario logueado, verificando asignación de agente...')
            
            try {
              // Llamar al endpoint para asignar el agente (o el default como secundario)
              // Las cookies se envían automáticamente con credentials: 'include'
              const response = await fetch('/api/auth/assign-agent-from-cookie', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include', // Asegurar que las cookies se envíen
              })
              
              const result = await response.json()
              
              if (result.success) {
                console.log('✅ Proceso de asignación de agente completado:', result)
              } else {
                // Si no era necesario hacer nada, el endpoint puede devolver success: false pero sin error crítico
                console.log('ℹ️ Resultado asignación de agente:', result.message || result.error)
              }
            } catch (error) {
              console.error('⚠️ Error al llamar API de asignación de agente:', error)
            }
          }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

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

