import { configRoute } from '@/lib/content/route'
import { metadataSpec } from '@/lib/content/specs'

export const dynamic = 'force-dynamic'

const handlers = configRoute(metadataSpec)

export const GET = handlers.GET
export const POST = handlers.POST
