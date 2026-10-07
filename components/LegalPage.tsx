import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { LEGAL_DEFAULTS } from '@/lib/content/legal'
import { BRAND } from '@/lib/content/configs'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

type Block = { id: string; title: string; defaults: { title: string; content: string } }

const BLOCKS: Record<string, Block> = {
  privacy: { id: 'privacyConfig', title: 'Политика конфиденциальности', defaults: LEGAL_DEFAULTS.privacy },
  terms: { id: 'termsConfig', title: 'Условия использования', defaults: LEGAL_DEFAULTS.terms },
  cookies: { id: 'cookiesConfig', title: 'Политика Cookie', defaults: LEGAL_DEFAULTS.cookies },
}

/** Section headings are authored as `<h2>` inside the stored HTML; reuse them for the index. */
function outline(html: string) {
  return [...html.matchAll(/<h2>(.*?)<\/h2>/g)].map((match, index) => ({
    id: `section-${index + 1}`,
    title: match[1].replace(/<[^>]+>/g, ''),
  }))
}

function anchorised(html: string) {
  let index = 0
  return html.replace(/<h2>/g, () => {
    index += 1
    return `<h2 id="section-${index}">`
  })
}

export function generateLegalMetadata(type: keyof typeof BLOCKS) {
  const block = BLOCKS[type]
  return {
    title: `${block.defaults.title} | ${BRAND.name}`,
    description: `${block.defaults.title}. Документ сайта ${BRAND.name}.`,
    robots: { index: false, follow: true },
  }
}

export default async function LegalPage({ type }: { type: keyof typeof BLOCKS }) {
  const block = BLOCKS[type]
  const table = (prisma as unknown as Record<string, { findFirst: () => Promise<{ title?: string; content?: string } | null> }>)[block.id]
  const stored = await table.findFirst().catch(() => null)
  const title = stored?.title || block.defaults.title
  const content = stored?.content || block.defaults.content
  const sections = outline(content)

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="bg-[#1F2937] pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← На главную
          </Link>
          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold text-white tracking-tight">{title}</h1>
          <p className="mt-4 text-gray-300 max-w-2xl">
            Документ сайта {BRAND.name}. Действующая редакция публикуется на этой странице.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12">
          <nav aria-label="Разделы документа" className="lg:sticky lg:top-28 self-start">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Содержание</p>
            <ol className="space-y-3 text-sm">
              {sections.map(section => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="text-gray-700 hover:text-[#5D4E37] transition-colors">
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="legal-prose bg-white rounded-2xl border border-gray-200 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)] p-6 sm:p-10">
            <div dangerouslySetInnerHTML={{ __html: anchorised(content) }} />
            <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-600 space-y-1">
              <p className="font-semibold text-gray-900">{BRAND.legalName}</p>
              <p>ИНН {BRAND.inn}</p>
              <p>
                {BRAND.address.line1} {BRAND.address.line2} {BRAND.address.line3}
              </p>
              <p>
                {BRAND.email} · {BRAND.phone}
              </p>
            </div>
          </article>
        </div>
      </div>
      <Footer />
    </main>
  )
}
