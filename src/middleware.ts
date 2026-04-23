import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

// Rutas que requieren sesión activa
const PROTECTED_PATTERNS = [
  /^\/[a-z]{2}\/asociados\/portal(\/.*)?$/,
  /^\/[a-z]{2}\/admin(\/.*)?$/,
]

function isProtected(pathname: string): boolean {
  return PROTECTED_PATTERNS.some((re) => re.test(pathname))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Primero aplicar next-intl (agrega el locale si falta)
  const intlResponse = intlMiddleware(request)

  if (!isProtected(pathname)) {
    return intlResponse
  }

  // Para rutas protegidas: verificar sesión de Supabase
  const supabaseResponse = intlResponse ?? NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Extraer el locale del pathname (ej. /es/asociados/... → es)
    const locale = pathname.split('/')[1] ?? routing.defaultLocale
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Excluir archivos estáticos y rutas internas de Next.js
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
