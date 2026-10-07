import { readConfig } from '@/lib/content/route'
import { metadataSpec } from '@/lib/content/specs'

export const dynamic = 'force-dynamic'

export function GET() {
  return readConfig(metadataSpec)
}
