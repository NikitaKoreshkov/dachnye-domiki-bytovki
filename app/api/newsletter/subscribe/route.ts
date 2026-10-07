import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNewsletterWelcome } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Неверный email' }, { status: 400 })
    }
    // DEBUG: покажем ключи prisma
    const debugKeys = Object.keys(prisma)
    // Попытка обращения к сервису
    if (!('newsletterSubscriber' in prisma)) {
      return NextResponse.json({
        error: 'newsletterSubscriber не найден!',
        prismaKeys: debugKeys
      }, { status: 500 })
    }
    const existed = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    })
    if (existed) {
      return NextResponse.json({
        error: 'Уже подписаны на рассылку',
        alreadySubscribed: true,
      }, { status: 200 })
    }
    await prisma.newsletterSubscriber.create({
      data: { email: email.toLowerCase() },
    })
    
    // Отправляем красивое письмо приветствия
    try {
      await sendNewsletterWelcome(email.toLowerCase())
    } catch (emailError) {
      console.error('[NEWSLETTER] Error sending welcome email:', emailError)
      // Не прерываем процесс, если письмо не отправилось
    }
    
    return NextResponse.json({ message: 'Успешно подписались!' }, { status: 200 })
  } catch(e) {
    // Анализируем ошибку + debug
    return NextResponse.json({ error: 'Ошибка сервера', debug: String(e) }, { status: 500 })
  }
}
