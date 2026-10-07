import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const body = await req.json()
  const lead = await prisma.whatsAppLead.create({
    data: {
      name: body.name || null,
      phone: body.phone || null,
      message: body.message || null,
      params: body.params || null,
      purpose: body.purpose || null,
      source: body.source || 'calculator',
      projectId: body.projectId || null,
      userId: session?.user?.id || null,
    }
  })
  return NextResponse.json(lead, { status: 201 })
}


