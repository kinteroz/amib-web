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

  // 2. Crear el cliente de Supabase para actualizar la sesión
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

  // 4. Protección de rutas administrativas
  // Detectar si estamos en una ruta /admin (considerando el localeprefix /es/admin o /en/admin)
  const isAdminPath = pathname.match(/\/(es|en)\/admin/);
  const isLoginPath = pathname.match(/\/(es|en)\/login/);

  if (isAdminPath && !user) {
    // Redirigir a login si no hay sesión
    const locale = pathname.split('/')[1] || 'es';
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  if (isLoginPath && user) {
      // Redirigir a admin si ya hay sesión
      const locale = pathname.split('/')[1] || 'es';
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/admin`;
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
