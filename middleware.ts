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
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Route protection based on path
  const path = request.nextUrl.pathname

  // Public routes
  if (path.startsWith('/api/webhooks') || path.startsWith('/api/public')) {
    return response
  }

  // Marketing routes are public
  if (path.startsWith('/(marketing)') || path === '/') {
    return response
  }

  // Protected routes require authentication
  if (path.startsWith('/(parent)') || path.startsWith('/(pro)')) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/'
      return NextResponse.redirect(redirectUrl)
    }

    // Check phone verification (Ghost Block)
    const { data: userData } = await supabase
      .from('users')
      .select('phone_verified, role')
      .eq('id', user.id)
      .single()

    if (!userData?.phone_verified) {
      // Allow access to phone verification page only
      if (!path.includes('/verify-phone')) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = path.startsWith('/(parent)') 
          ? '/(parent)/verify-phone' 
          : '/(pro)/verify-phone'
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Role-based route protection
    if (path.startsWith('/(parent)') && userData?.role !== 'parent') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/(pro)/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    if (path.startsWith('/(pro)') && userData?.role !== 'professional') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/(parent)/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

