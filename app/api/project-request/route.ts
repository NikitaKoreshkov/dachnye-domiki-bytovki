import { NextResponse } from 'next/server'
import { sendProjectRequest } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phone, projectTitle, projectId, projectData } = body

    // Валидация
    if (!phone || !projectTitle || !projectId) {
      return NextResponse.json(
        { error: 'Телефон, название проекта и ID обязательны' },
        { status: 400 }
      )
    }

    // Отправляем email
    const emailSent = await sendProjectRequest(phone, projectTitle, projectId, projectData)

    if (emailSent) {
      return NextResponse.json(
        { success: true, message: 'Заявка успешно отправлена' },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: 'Ошибка отправки email' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('[PROJECT REQUEST API] Error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
