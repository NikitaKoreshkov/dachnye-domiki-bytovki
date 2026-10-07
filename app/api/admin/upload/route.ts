import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

function ensureAdmin(session: any) {
  return session?.user && ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role || '')
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  console.log('[UPLOAD] Session check:', !!session, session?.user?.email, session?.user?.role)
  if (!ensureAdmin(session)) {
    console.log('[UPLOAD] Unauthorized')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    
    console.log('[UPLOAD] File received:', file?.name, file?.type, file?.size)
    
    if (!file) {
      console.log('[UPLOAD] No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Проверка типа файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      console.log('[UPLOAD] Invalid file type:', file.type)
      return NextResponse.json({ error: 'Invalid file type. Only images allowed.' }, { status: 400 })
    }

    // Проверка размера (макс 50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      console.log('[UPLOAD] File too large:', file.size)
      return NextResponse.json({ error: 'File too large. Max 50MB.' }, { status: 400 })
    }

    // Создаём папку uploads если её нет
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    console.log('[UPLOAD] Uploads directory:', uploadsDir)
    
    if (!existsSync(uploadsDir)) {
      console.log('[UPLOAD] Creating uploads directory')
      try {
        await mkdir(uploadsDir, { recursive: true, mode: 0o755 })
      } catch (dirError: any) {
        console.error('[UPLOAD] Failed to create directory:', dirError)
        return NextResponse.json({ 
          error: 'Failed to create uploads directory', 
          details: dirError.message 
        }, { status: 500 })
      }
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `${timestamp}-${randomStr}.${extension}`
    const filepath = join(uploadsDir, filename)

    console.log('[UPLOAD] Saving file to:', filepath)

    // Сохраняем файл
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    console.log('[UPLOAD] File saved successfully:', filename)

    // Возвращаем путь относительно public
    const publicPath = `/uploads/${filename}`
    return NextResponse.json({ url: publicPath })
  } catch (error: any) {
    console.error('[UPLOAD] Error:', error)
    console.error('[UPLOAD] Error stack:', error.stack)
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

