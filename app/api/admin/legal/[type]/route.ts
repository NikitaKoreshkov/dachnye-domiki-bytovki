import { notFound } from '@/lib/api'
import { readConfig, saveConfig } from '@/lib/content/route'
import { LEGAL_SPECS } from '@/lib/content/specs'

export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ type: string }> | { type: string } }

async function resolveSpec({ params }: Context) {
  const { type } = await Promise.resolve(params)
  return LEGAL_SPECS[type]
}

export async function GET(_request: Request, context: Context) {
  const spec = await resolveSpec(context)
  if (!spec) return notFound()
  return readConfig(spec)
}

export async function POST(request: Request, context: Context) {
  const spec = await resolveSpec(context)
  if (!spec) return notFound()
  return saveConfig(spec, request)
}
