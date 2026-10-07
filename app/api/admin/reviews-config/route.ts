import { configRoute } from '@/lib/content/route'
import { reviewsConfigSpec } from '@/lib/content/specs'

export const dynamic = 'force-dynamic'

const handlers = configRoute(reviewsConfigSpec)

export const GET = handlers.GET
export const POST = handlers.POST
