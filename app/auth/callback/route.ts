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
          const payload = {
            id: user.id,
            email: user.email,
            first_name: firstName,
            last_name: lastName,
          }
          // Upsert to ensure row exists and names are stored
          const { error: upsertError } = await supabase
            .from('users')
            .upsert(payload, { onConflict: 'id' })
          if (upsertError) {
            console.error('Failed to upsert users profile in callback:', upsertError)
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

