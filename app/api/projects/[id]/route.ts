import { json, notFound, serverError } from '@/lib/api'
import { findProject, projectPayload } from '@/lib/content/mappers'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> | { id: string } }

async function resolve({ params }: Params) {
  return (params instanceof Promise ? await params : params).id
}

export async function HEAD(_req: Request, query: Params) {
  try {
    const id = await resolve(query)
    if (!id) return new Response(null, { status: 400 })
    const { project, overlay } = await findProject(id)
    return new Response(null, { status: project || overlay ? 200 : 404 })
  } catch (error) {
    return serverError('PROJECT HEAD', error)
  }
}

export async function GET(_req: Request, query: Params) {
  try {
    const id = await resolve(query)
    if (!id) return notFound()

    const { project, overlay } = await findProject(id)
    if (!project && !overlay) return notFound()

    const card = projectPayload(project, overlay)
    const specs = (card.specs && typeof card.specs === 'object' ? card.specs : {}) as Record<string, unknown>

    return json({
      ...card,
      description: card.description || `Проект: ${card.title}`,
      images: card.images.length ? card.images : [card.image],
      specs: {
        ...specs,
        completionOptions: Array.isArray(specs.completionOptions) ? specs.completionOptions : [],
        additionalOptions: Array.isArray(specs.additionalOptions) ? specs.additionalOptions : [],
      },
    })
  } catch (error) {
    return serverError('PROJECT GET', error)
  }
}
