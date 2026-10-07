import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Отключаем кеширование для этого API
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'

function ensureAdmin(session: any) {
  return session?.user && ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role || '')
}

export async function GET() {
  try {
  const items = await prisma.review.findMany({ orderBy: { date: 'desc' } })
    console.log('[ADMIN REVIEWS API] GET - Returning', items.length, 'reviews')
    return NextResponse.json(items, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Accel-Expires': '0',
        'Vary': '*'
      }
    })
  } catch (error) {
    console.error('[ADMIN REVIEWS API] GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!ensureAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const items = Array.isArray(body) ? body : []
  await prisma.$transaction(async tx => {
    await tx.review.deleteMany({})
    for (const it of items) {
      await tx.review.create({ data: { name: it.name || '', city: it.city || '', text: it.text || '', image: it.image || null, date: it.date ? new Date(it.date) : undefined } })
    }
  })
  return NextResponse.json({ ok: true }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!ensureAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { ids } = await req.json()
  if (Array.isArray(ids) && ids.length) {
    await prisma.review.deleteMany({ where: { id: { in: ids } } })
    return NextResponse.json({ ok: true }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
  return NextResponse.json({ error: 'Nothing to delete' }, { status: 400 })
}
