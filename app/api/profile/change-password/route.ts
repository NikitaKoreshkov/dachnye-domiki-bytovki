import { prisma } from '@/lib/prisma'
import { currentUser, json, badRequest, notFound, unauthorized, readJson, serverError } from '@/lib/api'
import { hashPassword, verifyPassword } from '@/lib/passwords'

export const dynamic = 'force-dynamic'

const MIN_LENGTH = 12

/**
 * Change the signed-in user's password. The identity comes from the session,
 * never from the request body, so nobody can target another account by posting
 * an email.
 *
 * NOTE: sessions are JWTs (see `lib/auth.ts`) — there is no server-side session
 * store to purge, so this route cannot invalidate other devices. Their existing
 * tokens stay valid until the 30-day `maxAge` expires.
 */
export async function POST(request: Request) {
  const user = await currentUser()
  if (!user) return unauthorized()

  const body = await readJson(request)
  if (!body) return badRequest('Некорректный запрос')

  const oldPassword = typeof body.oldPassword === 'string' ? body.oldPassword : ''
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : ''

  if (!oldPassword || !newPassword) return badRequest('Укажите текущий и новый пароль')
  if (newPassword.length < MIN_LENGTH) {
    return badRequest(`Новый пароль должен содержать не менее ${MIN_LENGTH} символов`)
  }

  try {
    const record = await prisma.user.findUnique({ where: { email: user.email } })
    if (!record?.passwordHash) return notFound('Пользователь не найден')

    if (!(await verifyPassword(record.passwordHash, oldPassword))) {
      return badRequest('Текущий пароль неверен')
    }

    await prisma.user.update({
      where: { id: record.id },
      data: { passwordHash: await hashPassword(newPassword) },
    })
    return json({ success: true })
  } catch (error) {
    return serverError('PROFILE_CHANGE_PASSWORD', error)
  }
}
