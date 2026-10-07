import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const leads = await prisma.whatsAppLead.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(leads)
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { ids, all } = await req.json()
  if (all) {
    await prisma.whatsAppLead.deleteMany({})
    return NextResponse.json({ ok: true })
  }
  if (Array.isArray(ids) && ids.length) {
    await prisma.whatsAppLead.deleteMany({ where: { id: { in: ids } } })
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Nothing to delete' }, { status: 400 })
}


