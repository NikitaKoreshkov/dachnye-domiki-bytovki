import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ favorites: [] }, { status: 200 })
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        favorites: { 
          select: { 
            id: true, 
            slug: true, 
            title: true, 
            image: true, 
            images: true,
            priceFrom: true,
            priceTo: true,
            area: true,
            material: true
          } 
        } 
      }
    })
    
    if (!user) {
      return NextResponse.json({ favorites: [] }, { status: 200 })
    }
    
    // Обновляем данные в избранных проектах: используем кастомные из PopularItem если есть
    // Также фильтруем удаленные проекты
    const favoritesWithUpdatedData = await Promise.all(
      (user?.favorites || []).map(async (project: any) => {
        try {
          // Проверяем, существует ли проект в базе (может быть удален)
          // Используем slug, так как id может быть UUID, а в избранном используется slug
          const existingProject = await prisma.project.findUnique({
            where: { slug: project.slug },
            select: { id: true, slug: true }
          })
          
          // Если проект удален - не возвращаем его
          if (!existingProject) {
            console.log(`[FAVORITES] Project ${project.slug} was deleted, skipping`)
            return null
          }
          
          // Проверяем, есть ли для этого проекта кастомные данные в PopularItem
          const popularItem = await prisma.popularItem.findFirst({
            where: { projectSlug: project.slug }
          })
          
          // Используем напрямую поле image - это главное изображение, установленное в админке
          // Не ищем в массиве images, так как image - это именно то главное фото, которое выбрал пользователь
          
          // Если есть кастомные данные из PopularItem - используем их
          if (popularItem) {
            return {
              ...project,
              id: project.slug,
              title: popularItem.title || project.title, // Кастомное название
              image: popularItem.image || project.image, // Кастомное изображение или главное из проекта
              priceFrom: popularItem.priceFrom || project.priceFrom, // Кастомная цена
              priceTo: popularItem.priceTo ?? project.priceTo, // Кастомная цена
              material: popularItem.material || project.material // Кастомный материал
            }
          }
          
          // Если нет кастомных данных - используем главное изображение из проекта
          return {
            ...project,
            id: project.slug,
            image: project.image // Используем главное изображение напрямую
          }
        } catch (projectError: any) {
          console.error(`[FAVORITES] Error processing project ${project.slug}:`, projectError.message)
          return null
        }
      })
    )
    
    // Удаляем null (удаленные проекты) из массива
    const validFavorites = favoritesWithUpdatedData.filter((p): p is NonNullable<typeof p> => p !== null)
    
    // Если были удаленные проекты - очищаем их из избранного пользователя
    if (validFavorites.length !== favoritesWithUpdatedData.length && user) {
      const deletedCount = favoritesWithUpdatedData.length - validFavorites.length
      console.log(`[FAVORITES] Removing ${deletedCount} deleted projects from favorites`)
      
      try {
        // Обновляем избранное пользователя, удаляя несуществующие проекты
        // Используем slug для связи, так как в избранном хранится связь по slug
        const validProjectSlugs = validFavorites.map(p => p.id) // p.id здесь уже slug
        await prisma.user.update({
          where: { id: user.id },
          data: {
            favorites: {
              set: validProjectSlugs.map(slug => ({ slug }))
            }
          }
        })
      } catch (updateError: any) {
        console.error('[FAVORITES] Error updating favorites:', updateError.message)
        // Не прерываем выполнение, просто логируем ошибку
      }
    }
    
    return NextResponse.json({ favorites: validFavorites }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (e: any) {
    console.error('[FAVORITES] Error fetching favorites:', e)
    console.error('[FAVORITES] Error details:', e.message, e.stack)
    return NextResponse.json({ favorites: [], error: 'Ошибка загрузки избранного' }, { status: 200 })
  }
}

