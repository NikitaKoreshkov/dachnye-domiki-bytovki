import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

/**
 * Admin endpoints used to answer with `error.message`, which on a Prisma
 * failure means the connection string and the SQL statement reached the
 * browser. Every 5xx now goes through here instead.
 */
export function serverError(tag: string, error: unknown) {
  console.error(`[${tag}]`, error)
  return NextResponse.json({ error: 'Сервер временно недоступен' }, { status: 500 })
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function notFound(message = 'Не найдено') {
  return NextResponse.json({ error: message }, { status: 404 })
}

/** A natural key taken by another row: the editor can show this one verbatim. */
export function conflict(message: string) {
  return NextResponse.json({ error: message }, { status: 409 })
}

/** Returns a 401 response for anyone but an admin, or `null` when allowed. */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  if (!session?.user?.email || !role || !ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) {
    return unauthorized()
  }
  return null
}

export async function requireSuperAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return unauthorized()
  if (session.user.role !== 'SUPER_ADMIN') return forbidden()
  return null
}

/** The signed-in user, or a 401 response. Profile routes need the identity. */
export async function currentUser() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email?.toLowerCase()
  return email ? { email, id: session.user.id, role: session.user.role } : null
}

/** CMS content is edited at any moment, so none of it may be cached. */
export const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
} as const

export function json<T>(data: T, headers: Record<string, string> = {}, init: { status?: number } = {}) {
  return NextResponse.json(data, { ...init, headers: { ...NO_STORE, ...headers } })
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json()
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : null
  } catch {
    return null
  }
}

const BLOCKED_TAGS = /<\/?(script|iframe|object|embed|link|style|form|base)\b[^>]*>/gi
const BLOCKED_ATTRS = /\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi
const BLOCKED_URLS = /\s(href|src|xlink:href|action|formaction)\s*=\s*("|')?\s*javascript:[^"'>\s]*(("|')>)?/gi

/**
 * Legal and SEO blocks are stored as HTML and rendered with
 * `dangerouslySetInnerHTML`, so anything an admin pastes becomes part of the
 * page. Tags and attributes that can execute are dropped on the way in.
 */
export function sanitizeHtml(html: string): string {
  return html.replace(BLOCKED_TAGS, '').replace(BLOCKED_ATTRS, '').replace(BLOCKED_URLS, '')
}

const PHONE = /^\+?[0-9][0-9\s()-]{5,19}$/

/** Digits-only compare value, or `null` when the field is not a phone number. */
export function normalizePhone(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!PHONE.test(trimmed)) return null
  return trimmed.replace(/[^\d+]/g, '')
}
