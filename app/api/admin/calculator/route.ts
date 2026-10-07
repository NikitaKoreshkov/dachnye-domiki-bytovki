import { configRoute } from '@/lib/content/route'
import { calculatorSpec } from '@/lib/content/specs'

export const dynamic = 'force-dynamic'

const handlers = configRoute(calculatorSpec)

export const GET = handlers.GET
export const POST = handlers.POST
