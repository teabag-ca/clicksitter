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

  // Public routes - API webhooks and public endpoints
  if (path.startsWith('/api/webhooks') || path.startsWith('/api/public')) {
    return response
  }

  // Public routes - marketing pages (landing, auth)
  if (path === '/' || path === '/auth' || path.startsWith('/auth/')) {
    return response
  }

  // Protected routes require authentication
  // Note: Route groups (parent) and (pro) don't appear in URLs
  
  // Pro-specific routes (only exist in pro portal)
  const isProSpecificRoute = path.startsWith('/onboarding') || 
                             (path.startsWith('/verify') && !path.startsWith('/verify-phone')) ||
                             path.startsWith('/profile')
  
  // Parent-specific routes (only exist in parent portal)
  const isParentSpecificRoute = path.startsWith('/search')
  
  // Shared routes (routed by role in single pages)
  const isSharedRoute = path.startsWith('/dashboard') || 
                        path.startsWith('/subscribe') ||
                        path.startsWith('/verify-phone')
  
  // Jobs routes (different paths: /jobs for pro, /jobs/new for parent)
  const isJobsRoute = path.startsWith('/jobs')

  // If it's any protected route
  if (isProSpecificRoute || isParentSpecificRoute || isSharedRoute || isJobsRoute) {
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

    // Pass user role via header to avoid duplicate queries in page components
    if (userData?.role) {
      response.headers.set('x-user-role', userData.role)
    }

    if (!userData?.phone_verified) {
      // Allow access to phone verification page only
      if (!path.includes('/verify-phone')) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/verify-phone'
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Role-based route protection
    // Pro-specific routes require professional role
    if (isProSpecificRoute && userData?.role !== 'professional') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    // Parent-specific routes require parent role
    if (isParentSpecificRoute && userData?.role !== 'parent') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    // For shared routes, we'll let the page components handle role checking
    // since both portals have /dashboard, /jobs, etc. with different layouts
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

