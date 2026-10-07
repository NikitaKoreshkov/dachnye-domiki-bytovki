import { prisma } from '@/lib/prisma'
import { currentUser, json, serverError } from '@/lib/api'

export const dynamic = 'force-dynamic'

type FavoriteItem = {
  id: string
  slug: string
  title: string
  image: string
  images: string[]
  priceFrom: number
  priceTo: number | null
  area: number
  material: string
}

/**
 * The list of the signed-in user's favourite projects. Guests get an empty
 * list rather than a 401 so the header badge can render without a session.
 */
export async function GET() {
  const user = await currentUser()
  if (!user) return json({ favorites: [] as FavoriteItem[] })

  try {
    const record = await prisma.user.findUnique({
      where: { email: user.email },
      include: {
        favorites: {
          select: {
            id: true,
            slug: true,
            title: true,
            image: true,
            images: true,
            priceFrom: true,
            priceTo: true,
            area: true,
            material: true,
          },
        },
      },
    })
    if (!record) return json({ favorites: [] as FavoriteItem[] })

    // Overlay any custom panel copy (PopularItem) and drop favourites whose
    // project was deleted meanwhile.
    const enriched = await Promise.all(
      record.favorites.map(async (project): Promise<FavoriteItem | null> => {
        const stillExists = await prisma.project.findUnique({
          where: { slug: project.slug },
          select: { slug: true },
        })
        if (!stillExists) return null

        const popular = await prisma.popularItem.findFirst({ where: { projectSlug: project.slug } })
        const base: FavoriteItem = {
          id: project.slug,
          slug: project.slug,
          title: project.title,
          image: project.image,
          images: project.images,
          priceFrom: project.priceFrom,
          priceTo: project.priceTo,
          area: project.area,
          material: project.material,
        }
        if (!popular) return base

        return {
          ...base,
          title: popular.title || project.title,
          image: popular.image || project.image,
          priceFrom: popular.priceFrom || project.priceFrom,
          priceTo: popular.priceTo ?? project.priceTo,
          material: popular.material || project.material,
        }
      }),
    )

    const favorites = enriched.filter((item): item is FavoriteItem => item !== null)

    // Prune dangling favourites so the next read is cheap.
    if (favorites.length !== record.favorites.length) {
      await prisma.user.update({
        where: { id: record.id },
        data: { favorites: { set: favorites.map(item => ({ slug: item.slug })) } },
      })
    }

    return json({ favorites })
  } catch (error) {
    return serverError('PROFILE_FAVORITES', error)
  }
}
