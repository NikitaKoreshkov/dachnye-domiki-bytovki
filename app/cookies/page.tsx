import LegalPage, { generateLegalMetadata } from '@/components/LegalPage'

export const dynamic = 'force-dynamic'

export const metadata = generateLegalMetadata('cookies')

export default function Page() {
  return <LegalPage type="cookies" />
}
