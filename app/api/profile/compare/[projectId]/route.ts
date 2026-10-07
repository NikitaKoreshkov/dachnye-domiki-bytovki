import { prisma } from '@/lib/prisma'
import { currentUser, json, notFound, unauthorized, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ projectId: string }> | { projectId: string } }

/**
 * The compare list. There is no `app/api/profile/compare/route.ts` (the list
 * route is missing), so the provider still calls `/api/profile/compare/none`,
 * which Next resolves to this `[projectId]` handler — the literal `none` is a
 * leftover bug, not a real project slug. Left functional rather than guessing
 * a replacement list route.
 */
export async function GET() {
  const user = await currentUser()
  if (!user) return unauthorized()

  try {
    const record = await prisma.user.findUnique({
      where: { email: user.email },
      include: {
        compareProjects: { select: { id: true, slug: true, title: true, image: true, priceFrom: true } },
      },
    })
    return json({ compare: record?.compareProjects ?? [] })
  } catch (error) {
    return serverError('PROFILE_COMPARE_LIST', error)
  }
}

/** Connect a project (by slug) to the current user's comparison tray. */
export async function POST(_request: Request, { params }: Context) {
  const user = await currentUser()
  if (!user) return unauthorized()

  const { projectId } = await Promise.resolve(params)
  try {
    const project = await prisma.project.findUnique({ where: { slug: projectId }, select: { slug: true } })
    if (!project) return notFound('Проект не найден')

    await prisma.user.update({
      where: { email: user.email },
      data: { compareProjects: { connect: { slug: projectId } } },
    })
    return json({ success: true })
  } catch (error) {
    return serverError('PROFILE_COMPARE_ADD', error)
  }
}

/** Disconnect a project (by slug) from the current user's comparison tray. */
export async function DELETE(_request: Request, { params }: Context) {
  const user = await currentUser()
  if (!user) return unauthorized()

  const { projectId } = await Promise.resolve(params)
  try {
    const project = await prisma.project.findUnique({ where: { slug: projectId }, select: { slug: true } })
    if (!project) return notFound('Проект не найден')

    await prisma.user.update({
      where: { email: user.email },
      data: { compareProjects: { disconnect: { slug: projectId } } },
    })
    return json({ success: true })
  } catch (error) {
    return serverError('PROFILE_COMPARE_REMOVE', error)
  }
}
