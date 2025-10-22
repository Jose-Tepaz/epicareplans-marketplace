import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/enrollment'

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
        }
      } catch (e) {
        console.error('Profile sync error in callback:', e)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth`)
}

