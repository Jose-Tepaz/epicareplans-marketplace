'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Página de landing del agente
 * Captura el código único del agente y lo guarda en una cookie
 * Luego redirige al usuario al inicio del marketplace
 */
export default function AgentLandingPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const code = params?.code as string

  useEffect(() => {
    const handleAgentCode = async () => {
      if (!code) {
        setError('Código de agente no válido')
        setLoading(false)
        return
      }

      try {
        // Verificar que el agente existe y está activo usando función RPC
        const supabase = createClient()
        const { data: agentProfile, error: agentError } = await supabase
          .rpc('verify_agent_code', { link_code: code })
          .maybeSingle()

        // Guardar el código del agente en una cookie que expire en 30 días
        // Lo guardamos siempre, el callback del servidor verificará al registrarse
        const expires = new Date()
        expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 días
        document.cookie = `agent_referral_code=${code}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`

        if (agentError) {
          console.error('Error verificando agente:', agentError)
          console.log('💾 Cookie guardada de todas formas, el servidor verificará al registrarse')
          // Redirigir al inicio (no mostrar error, solo redirigir silenciosamente)
          router.push('/')
          return
        }

        if (!agentProfile || !agentProfile.is_valid) {
          console.warn('⚠️ Agente no encontrado o inactivo con código:', code)
          console.log('💾 Cookie guardada de todas formas, el servidor verificará al registrarse')
          // Redirigir al inicio (no mostrar error, solo redirigir silenciosamente)
          router.push('/')
          return
        }

        console.log('✅ Código de agente verificado y guardado en cookie:', code)
        console.log('👤 Agente:', agentProfile.business_name || 'Agente verificado')

        // Redirigir al inicio del marketplace
        router.push('/')
      } catch (err) {
        console.error('Error procesando código de agente:', err)
        setError('Error al procesar el código de agente')
        setLoading(false)
        setTimeout(() => {
          router.push('/')
        }, 3000)
      }
    }

    handleAgentCode()
  }, [code, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Procesando...</CardTitle>
            <CardDescription>Verificando código de agente</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Serás redirigido al inicio en unos segundos...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}

