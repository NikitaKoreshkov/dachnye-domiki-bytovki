import { configRoute } from '@/lib/content/route'
import { footerSpec } from '@/lib/content/specs'

export const dynamic = 'force-dynamic'

const handlers = configRoute(footerSpec)

export const GET = handlers.GET
export const POST = handlers.POST
