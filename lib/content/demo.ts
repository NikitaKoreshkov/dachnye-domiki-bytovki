import { randomUUID } from 'crypto'
import { FAQ_DEFAULTS, REVIEW_DEFAULTS } from './specs'
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
} from './configs'
import { CATALOG_FILTERS_DEFAULT, PROJECT_OPTIONS_DEFAULT, PROJECTS } from './catalog'
import { LEGAL_DEFAULTS } from './legal'

/**
 * An in-memory stand-in for the Prisma client, used when `DATABASE_URL` is not
 * set. It implements the subset of the query API the routes rely on (equality,
 * `in`, `OR`, `AND`, `orderBy`, `select`, `include`, `connect`/`disconnect` and
 * the write methods) over the same fixtures `prisma/seed.ts` writes, so a hosted
 * demo and a seeded PostgreSQL render identical pages.
 *
 * Writes are kept in module scope: the admin panel stays usable for the
 * lifetime of one instance, and a cold start resets it.
 */

type Row = Record<string, unknown> & { id: string }
type Where = Record<string, unknown>
type Order = Record<string, 'asc' | 'desc'>
type Args = {
  where?: Where
  orderBy?: Order | Order[]
  select?: Record<string, unknown>
  include?: Record<string, unknown>
  take?: number
  skip?: number
  data?: Record<string, unknown>
}

type Relation =
  | { kind: 'many'; target: string; foreignKey: string; localKey: string }
  | { kind: 'one'; target: string; foreignKey: string; localKey: string }
  | { kind: 'manyToMany'; target: string; foreignKey: string; localKey: string }

const RELATIONS: Record<string, Record<string, Relation>> = {
  popularPanel: {
    items: { kind: 'many', target: 'popularItem', foreignKey: 'panelId', localKey: 'id' },
  },
  popularItem: {
    panel: { kind: 'one', target: 'popularPanel', foreignKey: 'id', localKey: 'panelId' },
  },
  user: {
    favorites: { kind: 'manyToMany', target: 'project', foreignKey: 'id', localKey: 'id' },
    compareProjects: { kind: 'manyToMany', target: 'project', foreignKey: 'id', localKey: 'id' },
    documents: { kind: 'many', target: 'estimateDocument', foreignKey: 'userId', localKey: 'id' },
    leads: { kind: 'many', target: 'whatsAppLead', foreignKey: 'userId', localKey: 'id' },
  },
  project: {
    favoritedBy: { kind: 'manyToMany', target: 'user', foreignKey: 'id', localKey: 'id' },
    comparedBy: { kind: 'manyToMany', target: 'user', foreignKey: 'id', localKey: 'id' },
  },
  estimateDocument: {
    user: { kind: 'one', target: 'user', foreignKey: 'id', localKey: 'userId' },
  },
}

function matchesValue(value: unknown, condition: unknown): boolean {
  if (condition && typeof condition === 'object' && !Array.isArray(condition) && !(condition instanceof Date)) {
    const filters = condition as Record<string, unknown>
    if ('in' in filters) return (filters.in as unknown[]).includes(value)
    if ('notIn' in filters) return !(filters.notIn as unknown[]).includes(value)
    if ('lt' in filters) return Number(value) < Number(filters.lt)
    if ('lte' in filters) return Number(value) <= Number(filters.lte)
    if ('gt' in filters) return Number(value) > Number(filters.gt)
    if ('gte' in filters) return Number(value) >= Number(filters.gte)
    if ('not' in filters) return !matchesValue(value, filters.not)
    if ('contains' in filters) return String(value ?? '').toLowerCase().includes(String(filters.contains).toLowerCase())
    if ('equals' in filters) return value === filters.equals
  }
  return value === condition
}

function matches(row: Row, where: Where | undefined, store: DemoStore): boolean {
  if (!where) return true
  for (const [key, condition] of Object.entries(where)) {
    if (key === 'OR' && Array.isArray(condition)) {
      if (!condition.some(branch => matches(row, branch as Where, store))) return false
      continue
    }
    if (key === 'AND' && Array.isArray(condition)) {
      if (!condition.every(branch => matches(row, branch as Where, store))) return false
      continue
    }
    if (key === 'favorites' || key === 'compareProjects') {
      // some={slug} style filters on a join column
      const ids = (row[key] as string[] | undefined) ?? []
      const target = store.table('project')
      const wanted = target.rows.filter(child => ids.includes(child.id) && matches(child, condition as Where, store))
      if (!wanted.length) return false
      continue
    }
    if (!matchesValue(row[key], condition)) return false
  }
  return true
}

function byField(field: string, a: Row, b: Row): number {
  const left = a[field]
  const right = b[field]
  if (left === right) return 0
  if (left === null || left === undefined) return -1
  if (right === null || right === undefined) return 1
  if (typeof left === 'number' || typeof right === 'number') return Number(left) - Number(right)
  if (left instanceof Date || right instanceof Date) return Number(left) - Number(right)
  return String(left).localeCompare(String(right))
}

function sort(rows: Row[], order: Order | Order[] | undefined): Row[] {
  if (!order) return rows
  const clauses = (Array.isArray(order) ? order : [order]).flatMap(clause => Object.entries(clause))
  return [...rows].sort((a, b) => {
    for (const [field, direction] of clauses) {
      const result = byField(field, a, b)
      if (result !== 0) return direction === 'desc' ? -result : result
    }
    return 0
  })
}

function timestamps() {
  const now = new Date()
  return { createdAt: now, updatedAt: now }
}

class Table {
  rows: Row[]
  private name: string

  constructor(private store: DemoStore, name: string, seed: Row[]) {
    this.rows = seed
    this.name = name
  }

  private shape(row: Row, args: Args): Row {
    let out = row
    if (args.select) {
      out = {} as Row
      for (const key of Object.keys(args.select)) {
        if (key in row) out[key] = row[key]
      }
      if (!('id' in out) && 'id' in row) out.id = row.id
    }
    if (args.include) {
      out = { ...out }
      for (const [relationName, options] of Object.entries(args.include)) {
        const relation = RELATIONS[this.name]?.[relationName]
        if (!relation) continue
        const target = this.store.table(relation.target)
        const nested = (options && typeof options === 'object' ? options : {}) as Args

        if (relation.kind === 'manyToMany') {
          const ids = ((row[relationName] as string[] | undefined) ?? [])
          let children = target.rows.filter(child => ids.includes(child.id))
          if (nested.where) children = children.filter(child => matches(child, nested.where, this.store))
          children = sort(children, nested.orderBy)
          out[relationName] = children.map(child => target.shape(child, nested))
          continue
        }
        if (relation.kind === 'one') {
          const parent = target.rows.find(child => child[relation.foreignKey] === row[relation.localKey])
          out[relationName] = parent ? target.shape(parent, nested) : null
          continue
        }
        let children = target.rows.filter(child => child[relation.foreignKey] === row[relation.localKey])
        if (nested.where) children = children.filter(child => matches(child, nested.where, this.store))
        children = sort(children, nested.orderBy)
        if (nested.take !== undefined) children = children.slice(0, nested.take)
        out[relationName] = children.map(child => target.shape(child, nested))
      }
    }
    return out
  }

  /** Applies `connect` / `disconnect` / `set` writes on a join field. */
  private applyRelations(row: Row, data: Record<string, unknown>) {
    for (const [field, value] of Object.entries(data)) {
      const relation = RELATIONS[this.name]?.[field]
      if (!relation) continue
      const spec = value as { connect?: unknown; disconnect?: unknown; set?: unknown } | undefined
      if (!spec || typeof spec !== 'object') continue
      const target = this.store.table(relation.target)
      const current = new Set(((row[field] as string[] | undefined) ?? []))
      const resolve = (filter: unknown): string[] => {
        const list = Array.isArray(filter) ? filter : [filter]
        return list
          .map(entry => target.rows.find(child => matches(child, entry as Where, this.store))?.id)
          .filter((id): id is string => Boolean(id))
      }
      if (spec.set) {
        current.clear()
        for (const id of resolve(spec.set)) current.add(id)
      }
      if (spec.connect) for (const id of resolve(spec.connect)) current.add(id)
      if (spec.disconnect) for (const id of resolve(spec.disconnect)) current.delete(id)
      row[field] = [...current]
    }
  }

  async findMany(args: Args = {}): Promise<Row[]> {
    let result = this.rows.filter(row => matches(row, args.where, this.store))
    result = sort(result, args.orderBy)
    if (args.skip) result = result.slice(args.skip)
    if (args.take !== undefined) result = result.slice(0, args.take)
    return result.map(row => this.shape(row, args))
  }

  async findFirst(args: Args = {}): Promise<Row | null> {
    return (await this.findMany({ ...args, take: 1 }))[0] ?? null
  }

  async findUnique(args: Args): Promise<Row | null> {
    const found = this.rows.find(row => matches(row, args.where, this.store))
    return found ? this.shape(found, args) : null
  }

  async count(args: Args = {}): Promise<number> {
    return this.rows.filter(row => matches(row, args.where, this.store)).length
  }

  async create(args: Args): Promise<Row> {
    const data = { ...(args.data ?? {}) }
    this.applyPendingRelations(data)
    const row = { ...timestamps(), ...data, id: (data.id as string) ?? randomUUID() } as Row
    this.rows.push(row)
    return this.shape(row, args)
  }

  /** `create` may carry `connect` blocks; they become id arrays on the new row. */
  private applyPendingRelations(data: Record<string, unknown>) {
    const scratch: Row = { id: '' }
    for (const [field, value] of Object.entries(data)) {
      if (!RELATIONS[this.name]?.[field]) continue
      scratch[field] = []
      this.applyRelations(scratch, { [field]: value })
      data[field] = scratch[field]
    }
  }

  async update(args: Args): Promise<Row> {
    const index = this.rows.findIndex(row => matches(row, args.where, this.store))
    if (index === -1) throw new Error(`P2025: no ${this.name} row matches the update filter`)
    const data = { ...(args.data ?? {}) }
    const relations: Record<string, unknown> = {}
    for (const key of Object.keys(data)) {
      if (RELATIONS[this.name]?.[key]) {
        relations[key] = data[key]
        delete data[key]
      }
    }
    const next = { ...this.rows[index], ...data, updatedAt: new Date() }
    this.applyRelations(next, relations)
    this.rows[index] = next
    return this.shape(next, args)
  }

  async upsert(args: Args & { create?: Record<string, unknown>; update?: Record<string, unknown> }): Promise<Row> {
    const existing = this.rows.find(row => matches(row, args.where, this.store))
    if (!existing) return this.create({ data: { ...(args.create ?? {}), ...(args.where ?? {}) } })
    return this.update({ where: args.where, data: args.update ?? {}, select: args.select, include: args.include })
  }

  async delete(args: Args): Promise<Row> {
    const index = this.rows.findIndex(row => matches(row, args.where, this.store))
    if (index === -1) throw new Error(`P2025: no ${this.name} row matches the delete filter`)
    return this.rows.splice(index, 1)[0]
  }

  async deleteMany(args: Args = {}): Promise<{ count: number }> {
    const keep = this.rows.filter(row => !matches(row, args.where, this.store))
    const count = this.rows.length - keep.length
    this.rows.length = 0
    this.rows.push(...keep)
    return { count }
  }

  async updateMany(args: Args): Promise<{ count: number }> {
    const targets = this.rows.filter(row => matches(row, args.where, this.store))
    for (const row of targets) Object.assign(row, args.data ?? {}, { updatedAt: new Date() })
    return { count: targets.length }
  }
}

const DEMO_TABLES = [
  'project', 'popularPanel', 'popularItem', 'review', 'fAQItem', 'user',
  'verificationToken', 'account', 'session', 'newsletterSubscriber', 'estimateDocument',
  'whatsAppLead', 'heroConfig', 'headerConfig', 'footerConfig', 'advantagesConfig',
  'processStepsConfig', 'calculatorConfig', 'catalogSeoTextConfig', 'catalogFiltersConfig',
  'siteMetadataConfig', 'reviewsConfig', 'projectOptionsConfig', 'contractTemplateConfig',
  'privacyConfig', 'termsConfig', 'cookiesConfig',
]

const configRow = (id: string, data: Record<string, unknown>): Row => ({ id, ...data, ...timestamps() })

const POPULAR_PANEL_ID = 'panel-popular'

export class DemoStore {
  private tables = new Map<string, Table>()

  constructor() {
    const projects: Row[] = PROJECTS.map((project, index) => ({
      ...project,
      id: project.id,
      slug: project.id,
      priceTo: project.priceTo ?? null,
      images: project.images ?? [],
      tags: project.tags ?? [],
      features: project.features ?? [],
      advantages: project.advantages ?? [],
      description: project.description ?? null,
      technicalSpecs: null,
      specs: project.specs ?? null,
      filterValues: {
        price: project.priceFrom,
        area: project.area,
        material: project.material,
        buildTime: project.buildTime,
        features: project.features ?? [],
      },
      order: index,
      ...timestamps(),
    }))

    const popularItems: Row[] = PROJECTS.slice(0, 12).map((project, index) => ({
      id: `popular-${project.id}`,
      panelId: POPULAR_PANEL_ID,
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
      description: null,
      advantages: [],
      technicalSpecs: null,
      specs: null,
      filterValues: null,
      order: index,
      slug: `${project.id}-popular`,
      projectSlug: project.id,
      ...timestamps(),
    }))

    const seeds: Record<string, Row[]> = {
      project: projects,
      popularPanel: [configRow(POPULAR_PANEL_ID, { title: 'Популярные проекты', order: 0 })],
      popularItem: popularItems,
      review: REVIEW_DEFAULTS.map(review => ({ ...review, ...timestamps() })),
      fAQItem: FAQ_DEFAULTS.map(item => ({ ...item, ...timestamps() })),
      user: [],
      verificationToken: [],
      account: [],
      session: [],
      newsletterSubscriber: [],
      estimateDocument: [],
      whatsAppLead: [],
      heroConfig: [configRow('hero-1', HERO_DEFAULT)],
      headerConfig: [configRow('header-1', HEADER_DEFAULT)],
      footerConfig: [configRow('footer-1', FOOTER_DEFAULT)],
      advantagesConfig: [configRow('advantages-1', ADVANTAGES_DEFAULT)],
      processStepsConfig: [configRow('process-1', PROCESS_STEPS_DEFAULT)],
      calculatorConfig: [configRow('calculator-1', CALCULATOR_DEFAULT)],
      catalogSeoTextConfig: [configRow('seo-1', CATALOG_SEO_DEFAULT)],
      catalogFiltersConfig: [configRow('filters-1', { config: CATALOG_FILTERS_DEFAULT })],
      siteMetadataConfig: [configRow('metadata-1', METADATA_DEFAULT)],
      reviewsConfig: [configRow('reviews-config-1', REVIEWS_CONFIG_DEFAULT)],
      projectOptionsConfig: [configRow('options-1', PROJECT_OPTIONS_DEFAULT)],
      contractTemplateConfig: [configRow('contract-1', CONTRACT_TEMPLATE_DEFAULT)],
      privacyConfig: [configRow('privacy-1', LEGAL_DEFAULTS.privacy)],
      termsConfig: [configRow('terms-1', LEGAL_DEFAULTS.terms)],
      cookiesConfig: [configRow('cookies-1', LEGAL_DEFAULTS.cookies)],
    }

    for (const name of DEMO_TABLES) this.tables.set(name, new Table(this, name, seeds[name] ?? []))
  }

  table(name: string): Table {
    const existing = this.tables.get(name)
    if (!existing) throw new Error(`demo store has no "${name}" table`)
    return existing
  }

  async $transaction<T>(fn: (tx: DemoStore) => Promise<T>): Promise<T> {
    return fn(this)
  }

  async $disconnect(): Promise<void> {}
}

export function createDemoStore(): DemoStore & Record<string, Table> {
  const store = new DemoStore()
  for (const name of DEMO_TABLES) {
    Object.defineProperty(store, name, { get: () => store.table(name), enumerable: true })
  }
  return store as DemoStore & Record<string, Table>
}
