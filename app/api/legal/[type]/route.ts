import { notFound } from '@/lib/api'
import { readConfig } from '@/lib/content/route'
import { LEGAL_SPECS } from '@/lib/content/specs'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ type: string }> | { type: string } }) {
  const { type } = await Promise.resolve(params)
  const spec = LEGAL_SPECS[type]
  if (!spec) return notFound()
  return readConfig(spec)
}
