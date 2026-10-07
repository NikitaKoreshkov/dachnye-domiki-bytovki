import { prisma } from '@/lib/prisma'
import { json, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const panels = await prisma.popularPanel.findMany({
      orderBy: { order: 'asc' },
      include: { items: { orderBy: { order: 'asc' } } },
    })
    return json(panels)
  } catch (error) {
    return serverError('POPULAR GET', error)
  }
}
