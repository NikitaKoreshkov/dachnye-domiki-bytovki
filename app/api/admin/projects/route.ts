import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function ensureAdmin(session: any) {
  return session?.user && ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role || '')
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!ensureAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, slug: true, title: true, area: true, material: true, priceFrom: true, image: true } })
  return NextResponse.json(projects, {
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
  const body = await req.json()
  try {
    const created = await prisma.project.create({ data: {
      slug: body.slug,
      title: body.title,
      area: Number(body.area) || 50,
      priceFrom: Number(body.priceFrom) || 0,
      priceTo: null, // Больше не используется, всегда null
      floors: 1, // Значение по умолчанию, больше не редактируется
      material: body.material || 'каркасный',
      buildTime: Number(body.buildTime) || 30,
      completion: body.completion || 'под ключ',
      region: 'Москва', // Значение по умолчанию, больше не редактируется
      image: body.image || '/images/house.jpg',
      images: Array.isArray(body.images) ? body.images : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      hasTerrasse: !!body.hasTerrasse,
      hasBath: !!body.hasBath,
      hasGarage: !!body.hasGarage,
      features: Array.isArray(body.features) ? body.features : [],
      description: body.description || null,
      advantages: Array.isArray(body.advantages) ? body.advantages : [],
      specs: body.specs || null
    } })
    return NextResponse.json(created, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (e: any) {
    console.error('Error creating project:', e)
    // Проверяем ошибку уникальности slug
    if (e?.code === 'P2002' && e?.meta?.target?.includes('slug')) {
      return NextResponse.json({ 
        error: 'Проект с таким slug уже существует', 
        details: 'Slug должен быть уникальным. Выберите другой slug.' 
      }, { status: 400 })
    }
    return NextResponse.json({ 
      error: 'Ошибка создания проекта', 
      details: e?.message || 'Неизвестная ошибка' 
    }, { status: 400 })
  }
}
