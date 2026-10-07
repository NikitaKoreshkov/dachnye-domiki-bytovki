import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function ensureAdmin(session: any) {
  return session?.user && ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role || '')
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!ensureAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    let panels = await prisma.popularPanel.findMany({
    orderBy: { order: 'asc' },
    include: { items: { orderBy: { order: 'asc' }, select: { id: true, title: true, image: true, area: true, material: true, priceFrom: true, priceTo: true, order: true, projectSlug: true } } }
  })
  
  // Если панелей нет, создаём начальную из первых 6 проектов
  if (panels.length === 0) {
    const projects = await prisma.project.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: { slug: true, title: true, image: true, area: true, material: true, priceFrom: true, priceTo: true }
    })
    
    if (projects.length > 0) {
      const panel = await prisma.popularPanel.create({
        data: {
          title: 'Популярные проекты',
          order: 0,
          items: {
            create: projects.map((p, idx) => ({
              title: p.title,
              image: p.image,
              area: p.area,
              material: p.material,
              priceFrom: p.priceFrom,
              priceTo: p.priceTo,
              projectSlug: p.slug, // Автоматически связываем с реальным проектом
              order: idx
            }))
          }
        },
        include: { items: { orderBy: { order: 'asc' } } }
      })
      panels = [panel]
    }
  }
  
    return NextResponse.json(panels, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    console.error('Error in GET /api/admin/popular:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!ensureAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    // upsert full structure: [{id?, title, order, items:[{id?, ...}]}]
    const incomingPanels = Array.isArray(body) ? body.slice(0, 2) : []
    // simple strategy: delete existing and recreate from payload (within transaction)
    await prisma.$transaction(async tx => {
      await tx.popularItem.deleteMany({})
      await tx.popularPanel.deleteMany({})
      for (const p of incomingPanels) {
        const panel = await tx.popularPanel.create({ data: { title: p.title || 'Панель', order: p.order ?? 0 } })
        const items = Array.isArray(p.items) ? p.items.slice(0, 6) : []
        for (const [idx, it] of items.entries()) {
          await tx.popularItem.create({
            data: {
              panelId: panel.id,
              title: it.title || 'Проект',
              image: it.image || '/images/house.jpg',
              area: Number(it.area) || 50,
              material: it.material || 'каркасный',
              priceFrom: Number(it.priceFrom) || 0,
              priceTo: it.priceTo ? Number(it.priceTo) : null,
              projectSlug: it.projectSlug || null,
              order: typeof it.order === 'number' ? it.order : idx
            }
          })
        }
      }
    })
    return NextResponse.json({ ok: true }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    console.error('Error in POST /api/admin/popular:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}


