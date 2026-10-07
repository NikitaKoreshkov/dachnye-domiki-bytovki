import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import argon2 from 'argon2'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admins = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    select: { id: true, email: true, name: true, role: true, createdAt: true }
  })
  return NextResponse.json(admins, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, name, password, role } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const normEmail = String(email).toLowerCase().trim()
  const passwordHash = await argon2.hash(password)
  try {
    const user = await prisma.user.create({
      data: {
        email: normEmail,
        name: name || null,
        passwordHash,
        isActive: true,
        role: role === 'SUPER_ADMIN' ? 'ADMIN' : role || 'ADMIN', // prevent creating SUPER_ADMIN via API
      },
      select: { id: true, email: true, name: true, role: true }
    })
    return NextResponse.json(user, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (e: any) {
    // Prisma unique constraint error
    if (e?.code === 'P2002' && Array.isArray(e?.meta?.target) && e.meta.target.includes('email')) {
      return NextResponse.json({ error: 'Email уже существует' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Cannot create admin', details: e?.message }, { status: 400 })
  }
}


