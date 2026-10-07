import { prisma } from '@/lib/prisma'
import { badRequest, conflict, json, readJson, serverError } from '@/lib/api'
import { hashPassword } from '@/lib/passwords'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

/** Create an account. Used by `/auth/register`. */
export async function POST(request: Request) {
  const body = await readJson(request)
  if (!body) return badRequest('Некорректный запрос')

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) return badRequest('Проверьте имя, email и пароль')
  const { name, email, password } = parsed.data

  try {
    const normalizedEmail = email.toLowerCase()
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) return conflict('Пользователь с таким email уже существует')

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash: await hashPassword(password),
        isActive: true,
      },
      select: { id: true, name: true, email: true },
    })

    return json({ message: 'User created successfully', userId: user.id }, {}, { status: 201 })
  } catch (error) {
    return serverError('AUTH_REGISTER', error)
  }
}
