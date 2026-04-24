import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip internationalization for API routes (direct or localized)
  if (pathname.startsWith('/api') || pathname.includes('/api/')) {
    return NextResponse.next();
  }

  // 2. Manejar el ruteo de internacionalización
  const response = intlMiddleware(request);

  // Si next-intl ya decidió redirigir (p.ej. / → /es) o reescribir,
  // devolverlo tal cual. Si seguimos, Supabase puede pisar la respuesta
  // al refrescar cookies (setAll recrea NextResponse.next) y el redirect se pierde.
  if (response.headers.get('location') || response.headers.get('x-middleware-rewrite')) {
    return response;
  }

  // 3. Crear el cliente de Supabase para actualizar la sesión
  let supabaseResponse = response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Obtener el usuario
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. Protección de rutas
  const isAdminPath  = pathname.match(/\/(es|en)\/admin/);
  const isPortalPath = pathname.match(/\/(es|en)\/mi-cuenta/);
  const isLoginPath  = pathname.match(/\/(es|en)\/login/);

  const locale = pathname.split('/')[1] || 'es';
  const role = user?.user_metadata?.role as string | undefined;

  if (process.env.NODE_ENV === 'development' && (isAdminPath || isPortalPath)) {
    console.log('[middleware]', { pathname, userId: user?.id, role });
  }

  // Sin sesión → redirigir a login
  if ((isAdminPath || isPortalPath) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    if (isPortalPath) url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Con sesión pero sin rol admin en rutas de admin → redirigir al portal
  if (isAdminPath && user && role !== 'admin') {
    const url = request.nextUrl.clone();
    url.pathname = role === 'responsable_comite'
      ? `/${locale}/mi-cuenta/mis-comites`
      : `/${locale}/mi-cuenta/dashboard`;
    return NextResponse.redirect(url);
  }

  // El portal solo requiere sesión activa; el rol se valida dentro de cada sección.

  // Con sesión en login → redirigir según rol
  if (isLoginPath && user) {
    const url = request.nextUrl.clone();
    const redirectTo = request.nextUrl.searchParams.get('redirect');
    if (redirectTo) {
      url.pathname = redirectTo;
    } else if (role === 'admin') {
      url.pathname = `/${locale}/admin`;
    } else if (role === 'responsable_comite') {
      url.pathname = `/${locale}/mi-cuenta/mis-comites`;
    } else {
      url.pathname = `/${locale}/mi-cuenta/dashboard`;
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Match locales prefix
    '/', 
    '/(es|en)/:path*',
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
