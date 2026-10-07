import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function ensureAdmin(session: any) {
  return session?.user && ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role || '')
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!ensureAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title } = await req.json()
    
    // Ищем проект "Макси-тест" или похожий
    const searchTerm = title || 'Макси-тест'
    
    // Проверяем существующий проект
    const existingProject = await prisma.project.findFirst({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { slug: { contains: 'maxi', mode: 'insensitive' } }
        ]
      }
    })
    
    if (existingProject) {
      return NextResponse.json({
        found: true,
        project: {
          id: existingProject.id,
          slug: existingProject.slug,
          title: existingProject.title
        },
        message: 'Проект уже существует'
      })
    }
    
    // Ищем в PopularItem
    const popularItem = await prisma.popularItem.findFirst({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { title: { contains: 'Макси тест', mode: 'insensitive' } }
        ]
      }
    })
    
    if (popularItem) {
      // Восстанавливаем проект из PopularItem
      const slug = popularItem.projectSlug || `maxi-test-${Date.now()}`
      
      // Проверяем, нет ли уже проекта с таким slug
      const existingSlug = await prisma.project.findUnique({
        where: { slug }
      })
      
      const finalSlug = existingSlug ? `${slug}-restored` : slug
      
      const restoredProject = await prisma.project.create({
        data: {
          slug: finalSlug,
          title: popularItem.title,
          area: popularItem.area,
          priceFrom: popularItem.priceFrom,
          priceTo: popularItem.priceTo,
          floors: popularItem.floors,
          material: popularItem.material,
          buildTime: popularItem.buildTime,
          completion: popularItem.completion,
          region: popularItem.region,
          image: popularItem.image,
          images: popularItem.images || [],
          tags: popularItem.tags || [],
          hasTerrasse: popularItem.hasTerrasse,
          hasBath: popularItem.hasBath,
          hasGarage: popularItem.hasGarage,
          features: popularItem.features || [],
          description: popularItem.description,
          advantages: popularItem.advantages || [],
          specs: popularItem.specs as any
        }
      })
      
      // Обновляем связь в PopularItem
      if (!popularItem.projectSlug) {
        await prisma.popularItem.update({
          where: { id: popularItem.id },
          data: { projectSlug: finalSlug }
        })
      }
      
      return NextResponse.json({
        found: false,
        restored: true,
        project: {
          id: restoredProject.id,
          slug: restoredProject.slug,
          title: restoredProject.title
        },
        message: 'Проект восстановлен из популярных'
      })
    }
    
    // Если не найдено нигде - создаем новый проект с примерными данными
    const newProject = await prisma.project.create({
      data: {
        slug: `maxi-test-${Date.now()}`,
        title: 'Макси-тест',
        area: 165,
        priceFrom: 35000000,
        priceTo: 45000000,
        floors: 1,
        material: 'SIP',
        buildTime: 30,
        completion: 'под ключ',
        region: 'Москва',
        image: '/images/house.jpg',
        images: [],
        tags: [],
        hasTerrasse: false,
        hasBath: false,
        hasGarage: false,
        features: []
      }
    })
    
    return NextResponse.json({
      found: false,
      created: true,
      project: {
        id: newProject.id,
        slug: newProject.slug,
        title: newProject.title
      },
      message: 'Создан новый проект с базовыми данными'
    })
  } catch (error: any) {
    console.error('Error restoring project:', error)
    return NextResponse.json({
      error: 'Failed to restore project',
      details: error?.message
    }, { status: 500 })
  }
}

