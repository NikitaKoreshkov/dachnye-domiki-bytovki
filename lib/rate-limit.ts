import { NextResponse } from 'next/server'

/**
 * Fixed-window limiter for the public form endpoints.
 *
 * `/api/contact`, `/api/callback`, `/api/calculator-request`,
 * `/api/project-request`, `/api/leads` and `/api/newsletter/subscribe` all had
 * the same shape: take JSON from an anonymous visitor and either write a row or
 * send an email, with nothing in front of them. One script could therefore mail
 * the company's SMTP account an unlimited number of messages or fill the leads
 * table.
 *
 * Counts live in module scope, so each serverless instance has its own window.
 * That is enough to stop a single client, and it is deliberately not a
 * distributed store.
 */

const windows = new Map<string, { count: number; resetAt: number }>()
const MAX_TRACKED = 5000

export function clientKey(request: Request, route: string): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local'
  return `${route}:${ip}`
}

/** Returns a 429 response once `limit` requests were made inside `windowSeconds`. */
export function rateLimit(request: Request, route: string, limit = 5, windowSeconds = 60): NextResponse | null {
  const key = clientKey(request, route)
  const now = Date.now()
  const entry = windows.get(key)

  if (!entry || entry.resetAt <= now) {
    if (windows.size > MAX_TRACKED) {
      for (const [stale, value] of windows) if (value.resetAt <= now) windows.delete(stale)
    }
    windows.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    return null
  }

  entry.count += 1
  if (entry.count > limit) {
    const retrySeconds = Math.ceil((entry.resetAt - now) / 1000)
    return NextResponse.json(
      { error: 'Слишком много заявок. Попробуйте ещё раз позже.' },
      { status: 429, headers: { 'Retry-After': String(retrySeconds) } },
    )
  }
  return null
}

/** Reads a bounded string field, or returns null when it is missing or oversized. */
export function field(body: Record<string, unknown>, name: string, maxLength: number): string | null {
  const value = body[name]
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > maxLength) return null
  return trimmed
}
