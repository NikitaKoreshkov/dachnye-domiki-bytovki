import { configRoute } from '@/lib/content/route'
import { projectOptionsSpec } from '@/lib/content/specs'

export const dynamic = 'force-dynamic'

const handlers = configRoute(projectOptionsSpec)

export const GET = handlers.GET
export const POST = handlers.POST
