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
      
      // Cuando un usuario hace login (SIGNED_IN), verificar si hay cookie de agente
      // y asignar el agente a agent_clients si el cliente ya existe
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Verificar si hay cookie de agente referral
          const agentReferralCode = document.cookie
            .split('; ')
            .find(row => row.startsWith('agent_referral_code='))
            ?.split('=')[1]
          
          if (agentReferralCode) {
            console.log('🔗 Cookie de agente detectada después del login, asignando agente...')
            
            // Llamar al endpoint para asignar el agente
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
              console.log('✅ Agente asignado correctamente después del login:', result)
            } else {
              console.log('ℹ️ No se pudo asignar agente (puede ser normal):', result.message || result.error)
            }
          }
        } catch (error) {
          // No mostrar error al usuario, solo log
          console.error('⚠️ Error al asignar agente después del login:', error)
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

