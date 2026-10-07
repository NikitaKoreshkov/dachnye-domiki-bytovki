import { prisma } from '@/lib/prisma'
import { currentUser, json, notFound, unauthorized, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ id: string }> | { id: string } }

/** Read a single estimate document. Ownership is part of the lookup, so a
 *  document that belongs to someone else (or is gone) yields a 404. */
export async function GET(_request: Request, { params }: Context) {
  const user = await currentUser()
  if (!user) return unauthorized()

  const { id } = await Promise.resolve(params)
  try {
    const document = await prisma.estimateDocument.findFirst({ where: { id, userId: user.id } })
    if (!document) return notFound('Документ не найден')
    return json({ document })
  } catch (error) {
    return serverError('PROFILE_DOCUMENT_GET', error)
  }
}

/** Delete a single estimate document the user owns. */
export async function DELETE(_request: Request, { params }: Context) {
  const user = await currentUser()
  if (!user) return unauthorized()

  const { id } = await Promise.resolve(params)
  try {
    const document = await prisma.estimateDocument.findFirst({ where: { id, userId: user.id } })
    if (!document) return notFound('Документ не найден')

    await prisma.estimateDocument.delete({ where: { id: document.id } })
    return json({ ok: true })
  } catch (error) {
    return serverError('PROFILE_DOCUMENT_DELETE', error)
  }
}
