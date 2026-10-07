import { NextResponse } from 'next/server'
import { sendContactFormRequest } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, phone, message } = body

    // Валидация
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Имя и телефон обязательны' },
        { status: 400 }
      )
    }

    // Отправляем email
    const emailSent = await sendContactFormRequest(name, phone, message)

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
    console.error('[CONTACT API] Error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
