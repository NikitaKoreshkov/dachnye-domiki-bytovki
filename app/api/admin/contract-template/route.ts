import { NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { prisma } from '@/lib/prisma'
import { badRequest, requireAdmin, serverError } from '@/lib/api'
import { readConfig, saveConfig } from '@/lib/content/route'
import { contractTemplateSpec } from '@/lib/content/specs'

export const dynamic = 'force-dynamic'

const MAX_PDF_BYTES = 10 * 1024 * 1024
const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads', 'contracts')

function absPath(publicPath: string) {
  return join(process.cwd(), 'public', publicPath)
}

/** The upload step touches the filesystem, so only the `filePath` write goes through the spec. */
function saveFilePath(filePath: string) {
  const request = new Request('http://internal/api/admin/contract-template', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filePath }),
  })
  return saveConfig(contractTemplateSpec, request)
}

export function GET() {
  return readConfig(contractTemplateSpec)
}

export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return badRequest('Файл не получен')

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) return badRequest('Разрешены только PDF-файлы')
    if (file.size > MAX_PDF_BYTES) return badRequest('Файл слишком большой. Максимум 10 МБ')

    if (!existsSync(UPLOADS_DIR)) {
      await mkdir(UPLOADS_DIR, { recursive: true, mode: 0o755 })
    }

    const oldConfig = await prisma.contractTemplateConfig.findFirst()
    if (oldConfig?.filePath) {
      const oldPath = absPath(oldConfig.filePath)
      if (existsSync(oldPath)) await unlink(oldPath)
    }

    const filename = `contract-template-${Date.now()}.pdf`
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(join(UPLOADS_DIR, filename), buffer)

    return await saveFilePath(`/uploads/contracts/${filename}`)
  } catch (error) {
    return serverError('CONTRACT_TEMPLATE POST', error)
  }
}

export async function DELETE() {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const config = await prisma.contractTemplateConfig.findFirst()
    if (config?.filePath) {
      const filePath = absPath(config.filePath)
      if (existsSync(filePath)) await unlink(filePath)
      await prisma.contractTemplateConfig.delete({ where: { id: config.id } })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return serverError('CONTRACT_TEMPLATE DELETE', error)
  }
}
