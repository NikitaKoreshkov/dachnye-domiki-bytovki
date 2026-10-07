import { prisma } from '@/lib/prisma'

/**
 * A product can be reached by its own slug or by the slug of the popular slot
 * that features it, and the popular row may override title, price and image.
 * This module resolves either form to one card shape that both the catalogue and
 * the product page render.
 */

export type ProjectRow = {
  slug: string
  title: string
  area: number
  priceFrom: number
  priceTo: number | null
  floors: number
  material: string
  buildTime: number
  completion: string
  region: string
  image: string
  images?: string[]
  tags?: string[]
  hasTerrasse?: boolean
  hasBath?: boolean
  hasGarage?: boolean
  features?: string[]
  description: string | null
  advantages?: string[]
  technicalSpecs: string | null
  specs?: unknown
  filterValues?: unknown
}

export type PopularRow = Partial<ProjectRow> & { 
  id: string 
  projectSlug?: string | null 
  slug?: string | null
  title: string
  area: number
  priceFrom: number
  priceTo?: number | null
  floors: number
  material: string
  buildTime: number
  completion: string
  region: string
  image: string
  images?: string[]
  tags?: string[]
  hasTerrasse?: boolean
  hasBath?: boolean
  hasGarage?: boolean
  features?: string[]
  description?: string | null
  advantages?: string[]
  technicalSpecs?: string | null
  specs?: unknown
}

/** The catalogue key is the slug; the landing page links popular slots the same way. */
export function popularSlug(item: PopularRow): string {
  if (item.slug) return item.slug
  const base = item.title
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
  return `${base}-${item.id.slice(0, 8)}`
}

/** Popular overrides win, the project fills the gaps. */
export function projectPayload(project: ProjectRow | null, overlay?: PopularRow | null) {
  if (!project && !overlay) throw new Error('projectPayload needs a project or a popular row')
  const pick = <T>(override: T | undefined, fallback: T): T => {
    if (override === undefined || override === null) return fallback
    return override
  }
  const source = (project ?? overlay) as ProjectRow & { title: string; area: number; priceFrom: number }

  return {
    id: project?.slug ?? (overlay ? popularSlug(overlay) : ''),
    slug: project?.slug ?? overlay?.projectSlug ?? null,
    title: pick(overlay?.title, source.title),
    area: pick(overlay?.area, source.area),
    priceFrom: pick(overlay?.priceFrom, source.priceFrom),
    priceTo: pick(overlay?.priceTo, source.priceTo ?? null),
    floors: pick(overlay?.floors, source.floors),
    material: pick(overlay?.material, source.material),
    buildTime: pick(overlay?.buildTime, source.buildTime),
    completion: pick(overlay?.completion, source.completion),
    region: pick(overlay?.region, source.region),
    image: pick(overlay?.image, source.image),
    images: pick(overlay?.images, source.images ?? []),
    tags: pick(overlay?.tags, source.tags ?? []),
    hasTerrasse: pick(overlay?.hasTerrasse, source.hasTerrasse ?? false),
    hasBath: pick(overlay?.hasBath, source.hasBath ?? false),
    hasGarage: pick(overlay?.hasGarage, source.hasGarage ?? false),
    features: pick(overlay?.features, source.features ?? []),
    description: pick(overlay?.description, source.description ?? null),
    advantages: pick(overlay?.advantages, source.advantages ?? []),
    technicalSpecs: pick(overlay?.technicalSpecs, source.technicalSpecs ?? null),
    specs: pick(overlay?.specs, source.specs ?? null),
    filterValues: pick(overlay?.filterValues, source.filterValues ?? null),
  }
}

export async function findProject(id: string) {
  const project = await prisma.project.findUnique({ where: { slug: id } })
  if (project) {
    const overlay = await prisma.popularItem.findFirst({ where: { projectSlug: id } })
    return { project, overlay: overlay as PopularRow | null }
  }

  // popular slots are linked by their own slug, and older links carry a
  // `popular-<uuid>` prefix
  const candidates = [
    await prisma.popularItem.findFirst({ where: { slug: id } }),
    id.startsWith('popular-') ? await prisma.popularItem.findUnique({ where: { id: id.slice('popular-'.length) } }) : null,
  ].filter(Boolean) as PopularRow[]

  if (!candidates.length) {
    const all = await prisma.popularItem.findMany()
    const match = all.find(item => popularSlug(item as PopularRow) === id)
    if (match) candidates.push(match as PopularRow)
  }

  const overlay = candidates[0]
  if (!overlay) return { project: null, overlay: null }

  const linked = overlay.projectSlug
    ? await prisma.project.findUnique({ where: { slug: overlay.projectSlug } })
    : null
  return { project: linked, overlay }
}

/** Rows the catalogue can render: a popular slot without a live project is invisible. */
export function isRendered(card: { title?: unknown; priceFrom?: unknown }): boolean {
  return typeof card.title === 'string' && card.title.length > 0 && Number.isFinite(Number(card.priceFrom))
}
