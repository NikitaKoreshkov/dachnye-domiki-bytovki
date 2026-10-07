import { readConfig } from '@/lib/content/route'
import { advantagesSpec } from '@/lib/content/specs'

export const dynamic = 'force-dynamic'

export function GET() {{
  return readConfig(advantagesSpec)
}}
