import { collectionRoute } from '@/lib/content/route'
import { FAQ_DEFAULTS } from '@/lib/content/specs'

export const dynamic = 'force-dynamic'

export const { GET } = collectionRoute({
  model: 'fAQItem',
  tag: 'FAQ',
  orderBy: { order: 'asc' },
  defaults: FAQ_DEFAULTS,
})
