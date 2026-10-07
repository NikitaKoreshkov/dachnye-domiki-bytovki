import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import argon2 from 'argon2'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Change role (SUPER_ADMIN only)
  if (body.role) {
    if (session.user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (body.role === 'SUPER_ADMIN') return NextResponse.json({ error: 'Cannot assign SUPER_ADMIN' }, { status: 400 })
    const user = await prisma.user.update({ where: { id: params.id }, data: { role: body.role } })
    return NextResponse.json({ id: user.id, role: user.role }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }

  // Change password (self only or SUPER_ADMIN)
  if (body.password) {
    if (session.user.id !== params.id && session.user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const passwordHash = await argon2.hash(body.password)
    await prisma.user.update({ where: { id: params.id }, data: { passwordHash } })
    return NextResponse.json({ ok: true }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }

  // Change name
  if (typeof body.name !== 'undefined') {
    if (session.user.id !== params.id && session.user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const user = await prisma.user.update({ where: { id: params.id }, data: { name: body.name } })
    return NextResponse.json({ id: user.id, name: user.name }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }

  return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}


