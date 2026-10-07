import { prisma } from '@/lib/prisma'
import { currentUser, json, notFound, unauthorized, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ projectId: string }> | { projectId: string } }

/** Connect a project (by slug) to the current user's favourites. */
export async function POST(_request: Request, { params }: Context) {
  const user = await currentUser()
  if (!user) return unauthorized()

  const { projectId } = await Promise.resolve(params)
  try {
    const project = await prisma.project.findUnique({ where: { slug: projectId }, select: { slug: true } })
    if (!project) return notFound('Проект не найден')

    await prisma.user.update({
      where: { email: user.email },
      data: { favorites: { connect: { slug: projectId } } },
    })
    return json({ success: true })
  } catch (error) {
    return serverError('PROFILE_FAVORITE_ADD', error)
  }
}

/** Disconnect a project (by slug) from the current user's favourites. */
export async function DELETE(_request: Request, { params }: Context) {
  const user = await currentUser()
  if (!user) return unauthorized()

  const { projectId } = await Promise.resolve(params)
  try {
    const project = await prisma.project.findUnique({ where: { slug: projectId }, select: { slug: true } })
    if (!project) return notFound('Проект не найден')

    await prisma.user.update({
      where: { email: user.email },
      data: { favorites: { disconnect: { slug: projectId } } },
    })
    return json({ success: true })
  } catch (error) {
    return serverError('PROFILE_FAVORITE_REMOVE', error)
  }
}
