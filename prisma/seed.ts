import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/passwords'
import {
  ADVANTAGES_DEFAULT,
  CALCULATOR_DEFAULT,
  CATALOG_SEO_DEFAULT,
  CONTRACT_TEMPLATE_DEFAULT,
  FOOTER_DEFAULT,
  HEADER_DEFAULT,
  HERO_DEFAULT,
  METADATA_DEFAULT,
  PROCESS_STEPS_DEFAULT,
  REVIEWS_CONFIG_DEFAULT,
} from '../lib/content/configs'
import { CATALOG_FILTERS_DEFAULT, PROJECTS, PROJECT_OPTIONS_DEFAULT } from '../lib/content/catalog'
import { FAQ_DEFAULTS, REVIEW_DEFAULTS } from '../lib/content/specs'
import { LEGAL_DEFAULTS } from '../lib/content/legal'

/**
 * Idempotent seed: every row is upserted by its natural key, so re-running it
 * updates the catalogue and leaves editor changes to the config blocks alone.
 *
 * The admin is created only from the environment. The previous version of this
 * file always upserted a SUPER_ADMIN at `a@gmail.com` with the password `123`
 * and printed both to the console, which is a public backdoor in a repository
 * that also ships the admin panel.
 */

const prisma = new PrismaClient()

const BLOCKS: [string, Record<string, unknown>][] = [
  ['heroConfig', HERO_DEFAULT],
  ['headerConfig', HEADER_DEFAULT],
  ['footerConfig', FOOTER_DEFAULT],
  ['advantagesConfig', ADVANTAGES_DEFAULT],
  ['processStepsConfig', PROCESS_STEPS_DEFAULT],
  ['calculatorConfig', CALCULATOR_DEFAULT],
  ['catalogSeoTextConfig', CATALOG_SEO_DEFAULT],
  ['catalogFiltersConfig', { config: CATALOG_FILTERS_DEFAULT }],
  ['siteMetadataConfig', METADATA_DEFAULT],
  ['reviewsConfig', REVIEWS_CONFIG_DEFAULT],
  ['projectOptionsConfig', PROJECT_OPTIONS_DEFAULT],
  ['contractTemplateConfig', CONTRACT_TEMPLATE_DEFAULT],
  ['privacyConfig', LEGAL_DEFAULTS.privacy],
  ['termsConfig', LEGAL_DEFAULTS.terms],
  ['cookiesConfig', LEGAL_DEFAULTS.cookies],
]

async function seedSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.SUPER_ADMIN_PASSWORD
  if (!email || !password) {
    console.log('SKIP  super admin (set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD)')
    return
  }
  if (password.length < 12) throw new Error('SUPER_ADMIN_PASSWORD must be at least 12 characters')
  const passwordHash = await hashPassword(password)
  await prisma.user.upsert({
    where: { email },
    update: { role: 'SUPER_ADMIN', isActive: true, passwordHash },
    create: { email, passwordHash, isActive: true, role: 'SUPER_ADMIN', name: 'Administrator' },
  })
  console.log(`OK    super admin ${email}`)
}

async function seedProjects() {
  let created = 0
  for (const project of PROJECTS) {
    const data = {
      title: project.title,
      area: project.area,
      priceFrom: project.priceFrom,
      priceTo: project.priceTo ?? null,
      floors: project.floors,
      material: project.material,
      buildTime: project.buildTime,
      completion: project.completion,
      region: project.region,
      image: project.image,
      images: project.images,
      tags: project.tags,
      hasTerrasse: project.hasTerrasse,
      hasBath: project.hasBath,
      hasGarage: project.hasGarage,
      features: project.features,
      description: project.description ?? null,
      advantages: project.advantages ?? [],
      specs: (project.specs ?? null) as never,
      filterValues: {
        price: project.priceFrom,
        area: project.area,
        material: project.material,
        buildTime: project.buildTime,
        features: project.features,
      } as never,
    }
    await prisma.project.upsert({ where: { slug: project.id }, update: data, create: { slug: project.id, ...data } })
    created += 1
  }
  console.log(`OK    ${created} projects`)
}

async function seedPopular() {
  const panel = await prisma.popularPanel.upsert({
    where: { id: 'panel-popular' },
    update: { title: 'Популярные проекты', order: 0 },
    create: { id: 'panel-popular', title: 'Популярные проекты', order: 0 },
  })
  const featured = PROJECTS.filter(project => project.tags.includes('бестселлер')).slice(0, 12)
  const chosen = featured.length ? featured : PROJECTS.slice(0, 12)
  for (const [index, project] of chosen.entries()) {
    const id = `popular-${project.id}`
    const data = {
      panelId: panel.id,
      title: project.title,
      area: project.area,
      priceFrom: project.priceFrom,
      priceTo: project.priceTo ?? null,
      floors: project.floors,
      material: project.material,
      buildTime: project.buildTime,
      completion: project.completion,
      region: project.region,
      image: project.image,
      images: project.images,
      tags: project.tags,
      hasTerrasse: project.hasTerrasse,
      hasBath: project.hasBath,
      hasGarage: project.hasGarage,
      features: project.features,
      order: index,
      slug: `${project.id}-popular`,
      projectSlug: project.id,
    }
    await prisma.popularItem.upsert({ where: { id }, update: data, create: { id, ...data } })
  }
  console.log(`OK    ${chosen.length} popular items`)
}

async function seedLists() {
  for (const review of REVIEW_DEFAULTS) {
    await prisma.review.upsert({
      where: { id: review.id },
      update: { name: review.name, city: review.city, text: review.text, image: review.image, date: review.date },
      create: review,
    })
  }
  for (const item of FAQ_DEFAULTS) {
    await prisma.fAQItem.upsert({
      where: { id: item.id },
      update: { question: item.question, answer: item.answer, order: item.order },
      create: item,
    })
  }
  console.log(`OK    ${REVIEW_DEFAULTS.length} reviews, ${FAQ_DEFAULTS.length} FAQ entries`)
}

async function seedBlocks() {
  let created = 0
  for (const [model, data] of BLOCKS) {
    const table = (prisma as unknown as Record<string, { findFirst: () => Promise<{ id: string } | null>; create: (args: { data: Record<string, unknown> }) => Promise<unknown> }>)[model]
    if (!table) throw new Error(`schema has no "${model}" model — run npx prisma generate`)
    if (await table.findFirst()) continue
    await table.create({ data })
    created += 1
  }
  console.log(`OK    ${created} of ${BLOCKS.length} content blocks created, ${BLOCKS.length - created} left as edited`)
}

async function main() {
  await seedSuperAdmin()
  await seedProjects()
  await seedPopular()
  await seedLists()
  await seedBlocks()
  console.log('done')
}

main()
  .catch(error => {
    console.error('seed failed', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
