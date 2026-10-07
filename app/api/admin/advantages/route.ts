import { configRoute } from '@/lib/content/route'
import { advantagesSpec } from '@/lib/content/specs'

export const dynamic = 'force-dynamic'

const handlers = configRoute(advantagesSpec)

export const GET = handlers.GET
export const POST = handlers.POST
