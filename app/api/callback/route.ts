import { NextResponse } from 'next/server'
import { sendCallbackRequest } from '@/lib/email'

export async function POST(req: Request) {
  try {
    console.log('[CALLBACK API] Received request')
    const body = await req.json()
    console.log('[CALLBACK API] Body:', JSON.stringify(body))
    
    const { name, phone } = body

    // Валидация
    if (!name || !phone) {
      console.log('[CALLBACK API] Validation failed - missing name or phone')
      return NextResponse.json(
        { error: 'Имя и телефон обязательны' },
        { status: 400 }
      )
    }

    console.log(`[CALLBACK API] Attempting to send email for: ${name}, ${phone}`)
    
    try {
      // Отправляем email
      const emailSent = await sendCallbackRequest(name, phone)
      
      console.log(`[CALLBACK API] Email sent result: ${emailSent}`)

      if (emailSent) {
        return NextResponse.json(
          { success: true, message: 'Заявка успешно отправлена' },
          { status: 200 }
        )
      } else {
        console.error('[CALLBACK API] Email sending returned false')
        return NextResponse.json(
          { error: 'Ошибка отправки email' },
          { status: 500 }
        )
      }
    } catch (emailError: any) {
      console.error('[CALLBACK API] Exception during email sending:', emailError)
      console.error('[CALLBACK API] Error message:', emailError?.message)
      console.error('[CALLBACK API] Error stack:', emailError?.stack?.substring(0, 500))
      return NextResponse.json(
        { error: `Ошибка отправки email: ${emailError?.message || 'Unknown error'}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[CALLBACK API] Error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

