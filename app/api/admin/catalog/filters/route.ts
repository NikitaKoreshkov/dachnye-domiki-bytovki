import { configRoute } from '@/lib/content/route'
import { catalogFiltersSpec } from '@/lib/content/specs'

export const dynamic = 'force-dynamic'

const handlers = configRoute(catalogFiltersSpec)

export const GET = handlers.GET
export const POST = handlers.POST
