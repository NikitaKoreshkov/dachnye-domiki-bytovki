import { PrismaClient } from '@prisma/client'
import { createDemoStore } from './content/demo'

export const hasDatabase = Boolean(process.env.DATABASE_URL)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function client(): PrismaClient {
  if (!hasDatabase) {
    // No connection string means the demo build: the same routes read an
    // in-memory store seeded from the fixtures the SQL seed writes.
    return createDemoStore() as unknown as PrismaClient
  }
  return (
    globalForPrisma.prisma ??
    new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] })
  )
}

export const prisma = client()

if (hasDatabase && process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
