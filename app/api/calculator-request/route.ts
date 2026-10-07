import { NextResponse } from 'next/server'
import { sendCalculatorRequest } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message, phone, params } = body

    // Валидация
    if (!message) {
      return NextResponse.json(
        { error: 'Сообщение обязательно' },
        { status: 400 }
      )
    }

    if (!phone) {
      return NextResponse.json(
        { error: 'Номер телефона обязателен' },
        { status: 400 }
      )
    }

    // Отправляем email
    const emailSent = await sendCalculatorRequest(message, phone, params)

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
    console.error('[CALCULATOR REQUEST API] Error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
