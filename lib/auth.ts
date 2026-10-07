import { timingSafeEqual } from 'crypto'
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma, hasDatabase } from '@/lib/prisma'
import { verifyPassword } from '@/lib/passwords'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
    }
  }
}

const DEMO_ID = 'demo-admin'

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

/**
 * Without a database there is nobody to look up, so the demo build accepts one
 * login read from `DEMO_ADMIN_EMAIL` / `DEMO_ADMIN_PASSWORD`. Both must be set,
 * and the branch is compiled out as soon as `DATABASE_URL` exists.
 */
async function demoLogin(email: string, password: string) {
  if (hasDatabase) return null
  const demoEmail = process.env.DEMO_ADMIN_EMAIL
  const demoPassword = process.env.DEMO_ADMIN_PASSWORD
  if (!demoEmail || !demoPassword) return null
  if (!safeEqual(email.trim().toLowerCase(), demoEmail.trim().toLowerCase())) return null
  if (!safeEqual(password, demoPassword)) return null
  return { id: DEMO_ID, email: demoEmail, name: 'Демо-администратор', role: 'SUPER_ADMIN' as const }
}

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const email = credentials.email.toLowerCase()

        const demo = await demoLogin(email, credentials.password)
        if (demo) return demo

        try {
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user?.passwordHash) return null
          if (!user.isActive) return null
          if (!(await verifyPassword(user.passwordHash, credentials.password))) return null
          return { id: user.id, email: user.email, name: user.name, role: user.role }
        } catch (error) {
          console.error('[AUTH] authorize failed', error)
          return null
        }
      },
    }),
  ],
  pages: { signIn: '/auth/signin' },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  jwt: { maxAge: 30 * 24 * 60 * 60 },
  useSecureCookies: process.env.NEXTAUTH_URL?.startsWith('https://') ?? true,
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = (user as { id?: string }).id
        const role = (user as { role?: string }).role
        if (role === 'USER' || role === 'ADMIN' || role === 'SUPER_ADMIN') {
          token.role = role
        } else {
          token.role = 'USER'
        }
        token.email = user.email ?? undefined
        token.name = user.name ?? undefined
        return token
      }
      // the demo login has no row to refresh, and a password change should
      // take the next request off the cached role
      if (token?.id && token.id !== DEMO_ID && (trigger === 'update' || !token.role)) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, email: true, name: true },
          })
          if (dbUser) {
            token.role = dbUser.role
            token.email = dbUser.email
            token.name = dbUser.name ?? undefined
          }
        } catch {
          /* a transient database failure keeps the cached identity */
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN'
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
