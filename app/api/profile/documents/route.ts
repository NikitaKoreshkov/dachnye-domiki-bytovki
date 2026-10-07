import { prisma } from '@/lib/prisma'
import { currentUser, json, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

/** The signed-in user's saved estimate documents, newest first. */
export async function GET() {
  const user = await currentUser()
  if (!user) return json({ documents: [] })

  try {
    const documents = await prisma.estimateDocument.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })
    return json({ documents })
  } catch (error) {
    return serverError('PROFILE_DOCUMENTS_LIST', error)
  }
}
