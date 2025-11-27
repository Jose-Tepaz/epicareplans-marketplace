import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // 'invite', 'recovery', etc.
  const next = searchParams.get('next') ?? '/enrollment'

  console.log('🔐 Marketplace callback recibido:', { code: code ? 'presente' : 'ausente', type, next, origin })

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Sync basic profile fields (first_name, last_name, email) into public.users
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const meta: any = user.user_metadata || {}
          const firstName = meta.first_name || meta.given_name || null
          const lastName = meta.last_name || meta.family_name || null
          
          // Verificar si el usuario ya existe
          const { data: existingUser } = await supabase
            .from('users')
            .select('id, role, agent_id')
            .eq('id', user.id)
            .single()
          
          // Determinar si es un usuario nuevo del marketplace (no invitado)
          const isNewMarketplaceUser = !existingUser && type !== 'invite' && !meta.role
          
          const payload: any = {
            id: user.id,
            email: user.email,
            first_name: firstName,
            last_name: lastName,
          }
          
          // Si es un usuario nuevo del marketplace, establecer role='client' y created_via='marketplace'
          // El trigger asignará el agente automáticamente
          if (isNewMarketplaceUser) {
            payload.role = 'client'
            payload.created_via = 'marketplace'
            console.log('👤 Usuario nuevo del marketplace detectado, estableciendo role=client y created_via=marketplace')
          }
          
          // Si el usuario existe pero no tiene role, establecer role='client' para que el trigger funcione
          if (existingUser) {
            if (!existingUser.role && type !== 'invite' && !meta.role) {
              payload.role = 'client'
              payload.created_via = payload.created_via || 'marketplace'
              console.log('👤 Usuario existente sin role, estableciendo role=client')
            }
            
            // Si el usuario existe y tiene role='client' pero no tiene agente, asegurar que el role esté en el payload
            // para que el trigger de UPDATE funcione
            if (existingUser.role === 'client' && !existingUser.agent_id) {
              payload.role = 'client' // Asegurar que el role esté en el payload para el UPDATE
              console.log('👤 Usuario con role=client pero sin agente, actualizando para disparar trigger')
            }
          }
          
          // Upsert to ensure row exists and names are stored
          const { error: upsertError } = await supabase
            .from('users')
            .upsert(payload, { onConflict: 'id' })
          if (upsertError) {
            console.error('Failed to upsert users profile in callback:', upsertError)
          } else {
            // Verificar y asignar agente si no tiene (fallback manual)
            const { data: updatedUser } = await supabase
              .from('users')
              .select('agent_id, role')
              .eq('id', user.id)
              .single()
            
            if (updatedUser && updatedUser.role === 'client' && !updatedUser.agent_id) {
              console.log('⚠️ Usuario sin agente después del upsert, asignando agente por defecto manualmente...')
              
              // Buscar agente por defecto
              const { data: defaultAgent } = await supabase
                .from('agents')
                .select('id')
                .eq('agent_code', 'DEFAULT-ALLSTATE')
                .eq('is_active', true)
                .single()
              
              if (defaultAgent) {
                // Asignar agente al usuario
                const { error: assignError } = await supabase
                  .from('users')
                  .update({ agent_id: defaultAgent.id })
                  .eq('id', user.id)
                
                if (!assignError) {
                  console.log('✅ Agente asignado manualmente:', defaultAgent.id)
                } else {
                  console.error('❌ Error asignando agente:', assignError)
                }
              } else {
                console.warn('⚠️ No se encontró agente DEFAULT-ALLSTATE')
              }
            } else if (updatedUser?.agent_id) {
              console.log('✅ Usuario ya tiene agente asignado:', updatedUser.agent_id)
            }
          }

          // Si es una invitación, determinar a dónde redirigir según el rol
          if (type === 'invite' || meta.role) {
            try {
              // Obtener los roles del usuario
              const { data: userRoles } = await supabase
                .from('user_roles')
                .select(`
                  roles:role_id (
                    name
                  )
                `)
                .eq('user_id', user.id)

              const roles = userRoles?.map((ur: any) => ur.roles?.name).filter(Boolean) || []
              const roleName = roles[0] || meta.role || 'cliente'

              console.log('📋 Rol del usuario detectado:', roleName)

              // Normalizar el nombre del rol (puede ser 'cliente' o 'client')
              const normalizedRole = roleName.toLowerCase()
              const isClientRole = normalizedRole === 'cliente' || normalizedRole === 'client'

              // Redirigir según el rol a la página de establecer contraseña
              if (isClientRole) {
                const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3001'
                console.log('✅ Redirigiendo cliente a:', `${dashboardUrl}/set-password`)
                return NextResponse.redirect(`${dashboardUrl}/set-password`)
              } else {
                // Otros roles van al dashboard de administración
                const adminDashboardUrl = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL || 'http://localhost:3002'
                console.log('✅ Redirigiendo admin a:', `${adminDashboardUrl}/admin/set-password`)
                return NextResponse.redirect(`${adminDashboardUrl}/admin/set-password`)
              }
            } catch (roleError) {
              console.error('Error obteniendo roles:', roleError)
              // Si hay error, redirigir al dashboard de usuario por defecto a establecer contraseña
              const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3001'
              return NextResponse.redirect(`${dashboardUrl}/set-password`)
            }
          }
        }
      } catch (e) {
        console.error('Profile sync error in callback:', e)
      }
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('❌ Error en exchangeCodeForSession:', error)
    }
  } else {
    console.error('❌ No se recibió código en el callback')
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth`)
}

