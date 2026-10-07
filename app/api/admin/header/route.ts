import { configRoute } from '@/lib/content/route'
import { headerSpec } from '@/lib/content/specs'

export const dynamic = 'force-dynamic'

const handlers = configRoute(headerSpec)

export const GET = handlers.GET
export const POST = handlers.POST
