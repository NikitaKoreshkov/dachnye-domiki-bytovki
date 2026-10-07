import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import argon2 from 'argon2'

const verifySchema = z.object({
  userId: z.string(),
  code: z.string().length(6),
  email: z.string().email(),
  password: z.string(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Валидация данных
    const { userId, code, email, password } = verifySchema.parse(body)

    // Проверка пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    // Проверка email и password
    const isPasswordValid = await argon2.verify(user.passwordHash, password)
    
    if (!isPasswordValid || user.email !== email) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 400 }
      )
    }

    // Активация пользователя (если еще не активен)
    if (!user.isActive) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isActive: true,
          emailVerified: new Date(),
        }
      })
    }

    return NextResponse.json({
      message: 'Email verified successfully',
      success: true
    }, { status: 200 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      )
    }

    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Endpoint для очистки просроченных токенов (verificationCode удалена из схемы)
export async function DELETE() {
  try {
    const now = new Date()
    
    // Удаляем просроченные токены верификации
    const deletedTokens = await prisma.verificationToken.deleteMany({
      where: {
        expires: { lt: now }
      }
    })

    return NextResponse.json({
      message: 'Cleanup completed',
      deletedTokens: deletedTokens.count
    })

  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




