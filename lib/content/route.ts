import { prisma } from '../prisma'
import { badRequest, json, readJson, requireAdmin, serverError } from '../api'

/**
 * Every CMS block in this app is one row with the same lifecycle: read it, and
 * if nobody has saved it yet fall back to a default. That lifecycle used to be
 * written fifteen times over, and each copy stored its default text inline, so
 * `/api/calculator` and `/api/admin/calculator` disagreed about the wording, and
 * reading a block wrote it back to the database.
 *
 * One implementation now serves all of them: `GET` is read-only, defaults come
 * from `lib/content`, and `POST` is admin-only and field-checked.
 */

type Row = Record<string, unknown> & { id: string }

type Delegate = {
  findFirst: () => Promise<Row | null>
  create: (args: { data: Record<string, unknown> }) => Promise<Row>
  update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<Row>
  findMany: (args: { orderBy: Record<string, 'asc' | 'desc'> }) => Promise<Row[]>
}

function delegate(model: string): Delegate {
  const candidate = (prisma as unknown as Record<string, Delegate | undefined>)[model]
  if (!candidate) throw new Error(`unknown CMS model "${model}"`)
  return candidate
}

export type ConfigSpec = {
  model: string
  /** Prefix for the server-side log line. */
  tag: string
  /** Fallback row used when the table is empty; also what the seed writes. */
  defaults: Record<string, unknown>
  /** Body keys an admin may save. Anything else is ignored. */
  fields: string[]
  /** Keys where an empty string is stored as NULL rather than "". */
  nullable?: string[]
  /** Last chance to coerce or validate before writing. Throw `ConfigRejected` for a 400. */
  prepare?: (data: Record<string, unknown>, body: Record<string, unknown>) => Record<string, unknown>
  /** Reshape the row for the client. */
  shape?: (row: Record<string, unknown>) => unknown
}

/** Thrown from `prepare` to answer 400 with the reason. */
export class ConfigRejected extends Error {}

function toResponse(row: Row | null, spec: ConfigSpec) {
  const data = row ?? spec.defaults
  return json(spec.shape ? spec.shape(data) : data)
}

export async function readConfig(spec: ConfigSpec) {
  try {
    return toResponse(await delegate(spec.model).findFirst(), spec)
  } catch (error) {
    return serverError(`${spec.tag} GET`, error)
  }
}

export async function saveConfig(spec: ConfigSpec, request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const body = await readJson(request)
  if (!body) return badRequest('Ожидается JSON')

  const picked: Record<string, unknown> = {}
  for (const field of spec.fields) {
    if (!(field in body)) continue
    const value = body[field]
    picked[field] = spec.nullable?.includes(field) && value === '' ? null : value
  }

  try {
    const data = spec.prepare ? spec.prepare(picked, body) : picked
    const table = delegate(spec.model)
    const existing = await table.findFirst()
    const row = existing
      ? await table.update({ where: { id: existing.id }, data })
      : await table.create({ data: { ...spec.defaults, ...data } })
    return json(spec.shape ? spec.shape(row) : row)
  } catch (error) {
    if (error instanceof ConfigRejected) return badRequest(error.message)
    return serverError(`${spec.tag} POST`, error)
  }
}

export function configRoute(spec: ConfigSpec) {
  return {
    GET: () => readConfig(spec),
    POST: (request: Request) => saveConfig(spec, request),
  }
}

/** Read-only list block (FAQ items, reviews): defaults stand in for an empty table. */
export function collectionRoute(options: {
  model: string
  tag: string
  orderBy: Record<string, 'asc' | 'desc'>
  defaults: Record<string, unknown>[]
}) {
  return {
    GET: async () => {
      try {
        const rows = await delegate(options.model).findMany({ orderBy: options.orderBy })
        return json(rows.length ? rows : options.defaults)
      } catch (error) {
        return serverError(`${options.tag} GET`, error)
      }
    },
  }
}
