import { configRoute } from '@/lib/content/route'
import { heroSpec } from '@/lib/content/specs'

export const dynamic = 'force-dynamic'

const handlers = configRoute(heroSpec)

export const GET = handlers.GET
export const POST = handlers.POST
