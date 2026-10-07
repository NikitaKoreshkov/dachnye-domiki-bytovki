import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  }
}

