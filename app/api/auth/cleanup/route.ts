import { timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/prisma'
import { json, unauthorized, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

/** Constant-time bearer-token comparison; never `===` on a secret. */
function tokenMatches(provided: string, expected: string): boolean {
  const left = Buffer.from(provided)
  const right = Buffer.from(expected)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

/**
 * Cron endpoint that prunes expired verification tokens.
 *
 * Fails closed: with `CRON_SECRET` unset (the shipped default) the endpoint
 * does nothing and answers 401, so the previously hard-coded `secret-key`
 * fallback can no longer let anyone with repo access wipe the table.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return unauthorized()

  const header = request.headers.get('authorization') ?? ''
  const provided = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''
  if (!provided || !tokenMatches(provided, secret)) return unauthorized()

  try {
    const now = new Date()
    const { count } = await prisma.verificationToken.deleteMany({ where: { expires: { lt: now } } })

    return json({
      message: 'Cleanup completed',
      timestamp: now.toISOString(),
      deletedTokens: count,
      activeUsers: await prisma.user.count({ where: { isActive: true } }),
      inactiveUsers: await prisma.user.count({ where: { isActive: false } }),
    })
  } catch (error) {
    return serverError('AUTH_CLEANUP', error)
  }
}
