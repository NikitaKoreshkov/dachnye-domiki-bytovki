import { configRoute } from '@/lib/content/route'
import { processStepsSpec } from '@/lib/content/specs'

export const dynamic = 'force-dynamic'

const handlers = configRoute(processStepsSpec)

export const GET = handlers.GET
export const POST = handlers.POST
