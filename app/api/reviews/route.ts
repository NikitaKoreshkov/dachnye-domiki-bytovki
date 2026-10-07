import { collectionRoute } from '@/lib/content/route'
import { REVIEW_DEFAULTS } from '@/lib/content/specs'

export const dynamic = 'force-dynamic'

export const { GET } = collectionRoute({
  model: 'review',
  tag: 'REVIEWS',
  orderBy: { date: 'desc' },
  defaults: REVIEW_DEFAULTS,
})
