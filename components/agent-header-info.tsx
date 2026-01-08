"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { UserCheck } from "lucide-react"


interface AgentProfile {
  is_valid: boolean
  business_name: string | null
  name: string | null
}

export function AgentHeaderInfo() {
  const [agentName, setAgentName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAgentInfo = async () => {
      // 1. Obtener cookie
      // Nota: document.cookie no siempre tiene todas las cookies si son HttpOnly, 
      // pero agent_referral_code se setea en cliente (AgentLandingPage) o servidor con acceso JS (normalmente)
      // En AgentLandingPage: document.cookie = ...; path=/
      
      const agentCode = document.cookie
        .split('; ')
        .find(row => row.startsWith('agent_referral_code='))
        ?.split('=')[1]

      if (!agentCode) {
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .rpc('verify_agent_code', { link_code: agentCode })
          .maybeSingle()
        
        const agentProfile = data as AgentProfile | null

        if (error) {
          console.error('Error fetching agent info:', error)
          setLoading(false)
          return
        }

        if (agentProfile && agentProfile.is_valid) {
          // Preferimos nombre y apellido, pero usamos business_name como fallback
          // Asumimos que business_name es el nombre a mostrar según el código existente
          setAgentName(agentProfile.business_name || agentProfile.name || 'Agente')
        }
      } catch (err) {
        console.error('Unexpected error fetching agent info:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAgentInfo()
  }, [])

  if (loading || !agentName) {
    return null
  }

  return (
    <div className="flex items-center gap-2 mr-4">
      <Badge variant="secondary" className="bg-cyan/10 text-cyan hover:bg-cyan/20 border-cyan/20 px-3 py-1 gap-1.5 flex items-center transition-colors">
        <UserCheck className="h-3.5 w-3.5" />
        <span className="text-sm font-medium">
          Assisted by: <span className="font-bold">{agentName}</span>
        </span>
      </Badge>
    </div>
  )
}
