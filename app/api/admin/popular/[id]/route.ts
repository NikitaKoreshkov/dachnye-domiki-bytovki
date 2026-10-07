import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function ensureAdmin(session: any) {
  return session?.user && ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role || '')
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!ensureAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const itemId = resolvedParams?.id
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }
    
    const popularItem = await prisma.popularItem.findUnique({
      where: { id: itemId },
      include: { panel: true }
    })

    if (!popularItem) {
      return NextResponse.json({ error: 'Popular item not found' }, { status: 404 })
    }

    // Убеждаемся, что JSON поля правильно сериализуются
    const itemData = JSON.parse(JSON.stringify({
      ...popularItem,
      specs: popularItem.specs || null,
      filterValues: popularItem.filterValues || null,
      technicalSpecs: popularItem.technicalSpecs || null
    }))

    console.log('[ADMIN POPULAR GET] Item specs:', itemData.specs, 'type:', typeof itemData.specs)
    console.log('[ADMIN POPULAR GET] Item filterValues:', itemData.filterValues, 'type:', typeof itemData.filterValues)

    return NextResponse.json(itemData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    console.error('Error loading popular item:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!ensureAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const itemId = resolvedParams?.id
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }
    
    const body = await request.json()
    console.log('[ADMIN POPULAR PATCH] Received body:', JSON.stringify(body, null, 2))
    
    const updateData: any = {}
    if (typeof body.title !== 'undefined') updateData.title = body.title
    if (typeof body.image !== 'undefined') updateData.image = body.image
    if (Array.isArray(body.images)) updateData.images = body.images
    if (typeof body.area !== 'undefined') updateData.area = Number(body.area)
    if (typeof body.material !== 'undefined') updateData.material = body.material
    if (typeof body.priceFrom !== 'undefined') updateData.priceFrom = Number(body.priceFrom)
    if (typeof body.priceTo !== 'undefined') updateData.priceTo = body.priceTo ? Number(body.priceTo) : null
    if (typeof body.floors !== 'undefined') updateData.floors = Number(body.floors)
    if (typeof body.buildTime !== 'undefined') updateData.buildTime = Number(body.buildTime)
    if (typeof body.completion !== 'undefined') updateData.completion = body.completion
    if (typeof body.region !== 'undefined') updateData.region = body.region
    if (Array.isArray(body.tags)) updateData.tags = body.tags
    if (Array.isArray(body.features)) updateData.features = body.features
    if (typeof body.description !== 'undefined') updateData.description = body.description
    if (Array.isArray(body.advantages)) updateData.advantages = body.advantages
    if (typeof body.technicalSpecs !== 'undefined') {
      // Если пустая строка - сохраняем как null
      updateData.technicalSpecs = body.technicalSpecs && body.technicalSpecs.trim() ? body.technicalSpecs.trim() : null
    }
    if (typeof body.specs !== 'undefined') {
      console.log('[ADMIN POPULAR PATCH] Received specs:', body.specs)
      console.log('[ADMIN POPULAR PATCH] specs type:', typeof body.specs)
      // Если specs это объект - сохраняем как есть
      if (typeof body.specs === 'object' && body.specs !== null) {
        updateData.specs = body.specs
      } else if (typeof body.specs === 'string') {
        // Если строка - пытаемся распарсить
        try {
          updateData.specs = body.specs.trim() ? JSON.parse(body.specs) : null
        } catch (e) {
          console.error('[ADMIN POPULAR PATCH] Error parsing specs JSON:', e)
          updateData.specs = null
        }
      } else {
        updateData.specs = null
      }
    }
    // Обработка filterValues
    if (body.hasOwnProperty('filterValues')) {
      console.log('[ADMIN POPULAR PATCH] Received filterValues:', JSON.stringify(body.filterValues))
      console.log('[ADMIN POPULAR PATCH] filterValues type:', typeof body.filterValues)
      
      if (body.filterValues === null) {
        updateData.filterValues = null
      } else if (typeof body.filterValues === 'object' && !Array.isArray(body.filterValues)) {
        // Проверяем, не пустой ли объект
        const keys = Object.keys(body.filterValues)
        if (keys.length === 0) {
          // Пустой объект - устанавливаем null
          updateData.filterValues = null
        } else {
          // Сохраняем объект
          updateData.filterValues = body.filterValues
        }
      } else {
        // Некорректный тип - устанавливаем null
        console.warn('[ADMIN POPULAR PATCH] filterValues has incorrect type, setting to null')
        updateData.filterValues = null
      }
    }
    if (typeof body.order !== 'undefined') updateData.order = Number(body.order)

    console.log('[ADMIN POPULAR PATCH] Update data keys:', Object.keys(updateData))
    console.log('[ADMIN POPULAR PATCH] Update data (stringified):', JSON.stringify(updateData, null, 2))
    console.log('[ADMIN POPULAR PATCH] Item ID:', itemId)
    
    // Проверяем существование элемента перед обновлением
    const existingItem = await prisma.popularItem.findUnique({
      where: { id: itemId },
      select: { id: true, specs: true, filterValues: true }
    })
    
    if (!existingItem) {
      console.error('[ADMIN POPULAR PATCH] Item not found:', itemId)
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }
    
    console.log('[ADMIN POPULAR PATCH] Existing item specs:', existingItem.specs)
    console.log('[ADMIN POPULAR PATCH] Existing item filterValues:', existingItem.filterValues)
    console.log('[ADMIN POPULAR PATCH] About to update with data:', JSON.stringify(updateData, null, 2))

    let updated
    try {
      updated = await prisma.popularItem.update({
        where: { id: itemId },
        data: updateData,
        include: { panel: true }
      })
      console.log('[ADMIN POPULAR PATCH] Update successful')
    } catch (updateError: any) {
      console.error('[ADMIN POPULAR PATCH] Prisma update error:', updateError)
      console.error('[ADMIN POPULAR PATCH] Error name:', updateError?.name)
      console.error('[ADMIN POPULAR PATCH] Error code:', updateError?.code)
      console.error('[ADMIN POPULAR PATCH] Error message:', updateError?.message)
      console.error('[ADMIN POPULAR PATCH] Error meta:', JSON.stringify(updateError?.meta, null, 2))
      console.error('[ADMIN POPULAR PATCH] Error stack:', updateError?.stack)
      throw updateError
    }

    // Убеждаемся, что JSON поля правильно сериализуются
    const responseData = JSON.parse(JSON.stringify({
      ...updated,
      specs: updated.specs || null,
      filterValues: updated.filterValues || null,
      technicalSpecs: updated.technicalSpecs || null
    }))

    console.log('[ADMIN POPULAR PATCH] Updated specs:', responseData.specs, 'type:', typeof responseData.specs)
    console.log('[ADMIN POPULAR PATCH] Updated filterValues:', responseData.filterValues, 'type:', typeof responseData.filterValues)
    console.log('[ADMIN POPULAR PATCH] Updated technicalSpecs:', responseData.technicalSpecs)

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    console.error('[ADMIN POPULAR PATCH] Error updating popular item:', error)
    console.error('[ADMIN POPULAR PATCH] Error code:', error?.code)
    console.error('[ADMIN POPULAR PATCH] Error meta:', error?.meta)
    console.error('[ADMIN POPULAR PATCH] Error stack:', error?.stack)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error?.message || 'Unknown error',
        code: error?.code,
        meta: error?.meta
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!ensureAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const itemId = resolvedParams?.id
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }
    
    await prisma.popularItem.delete({
      where: { id: itemId }
    })

    return NextResponse.json({ ok: true }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    console.error('Error deleting popular item:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

