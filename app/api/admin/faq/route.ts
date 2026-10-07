import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Отключаем кеширование для этого API
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

function ensureAdmin(session: any) {
  return session?.user && ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role || '')
}

export async function GET() {
  const items = await prisma.fAQItem.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json(items, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!ensureAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    const body = await req.json()
    // full replace strategy
    const items = Array.isArray(body) ? body : []
    
    await prisma.$transaction(async tx => {
      await tx.fAQItem.deleteMany({})
      for (const [idx, it] of items.entries()) {
        await tx.fAQItem.create({ 
          data: { 
            question: it.question || '', 
            answer: it.answer || '', 
            order: typeof it.order === 'number' ? it.order : idx 
          } 
        })
      }
    })
    
    // Принудительно инвалидируем кеш для всех страниц, где используется FAQ
    try {
      revalidatePath('/')
      revalidatePath('/api/faq')
      console.log('[FAQ API] Cache invalidated for / and /api/faq')
    } catch (e) {
      console.error('[FAQ API] Failed to revalidate cache:', e)
    }
    
    // Возвращаем обновленные данные
    const updatedItems = await prisma.fAQItem.findMany({ orderBy: { order: 'asc' } })
    
    return NextResponse.json({ ok: true, items: updatedItems }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Accel-Expires': '0'
      }
    })
  } catch (error) {
    console.error('[FAQ API] Error saving FAQ:', error)
    return NextResponse.json({ error: 'Failed to save FAQ' }, { status: 500 })
  }
}


