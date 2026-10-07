import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Здесь можно добавить дополнительную логику проверки
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Публичные страницы - доступны без авторизации
        const publicPages = ['/auth/', '/api/auth/']
        if (publicPages.some(page => pathname.startsWith(page))) {
          return true
        }
        
        // Приватные страницы - требуют авторизацию (/profile и /profile/)
        if (pathname === '/profile' || pathname.startsWith('/profile/')) {
          return !!token
        }

        // Админ-панель: требуется роль ADMIN или SUPER_ADMIN
        if (pathname.startsWith('/admin')) {
          return !!token && (token as any).role && ['ADMIN', 'SUPER_ADMIN'].includes((token as any).role)
        }
        
        // Все остальные страницы (главная, каталог и т.д.) - публичные
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/public (public API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - uploads (uploaded files in public directory)
     * - images (images in public directory)
     * - favicon.ico (favicon file)
     */
    '/((?!api/public|_next/static|_next/image|uploads|images|favicon.ico).*)',
  ],
}

