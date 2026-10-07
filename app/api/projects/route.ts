import { prisma } from '@/lib/prisma'
import { json, serverError } from '@/lib/api'
import { projectPayload } from '@/lib/content/mappers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [projects, popularItems] = await Promise.all([
      prisma.project.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.popularItem.findMany({ where: { projectSlug: null } }),
    ])

    // a popular slot with no project of its own is a catalogue entry like any other
    const bySlug = new Map(projects.map(project => [project.slug, project]))
    const orphans = popularItems
      .filter(item => !item.projectSlug || !bySlug.has(item.projectSlug))
      .map(item => {
        const mapped = item as any & { slug?: string; projectSlug?: string | null }
        return projectPayload(null, mapped)
      })

    return json([...projects.map(project => projectPayload(project)), ...orphans])
  } catch (error) {
    return serverError('PROJECTS GET', error)
  }
}
