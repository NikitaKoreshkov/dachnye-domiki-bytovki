'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

export default function AdminTopBar({ title, backHref, actions }: { title: string; backHref: string; actions?: ReactNode }) {
  return (
    <div className="sticky top-0 z-10 -mx-2 sm:mx-0 mb-6 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/90 border-b">
      <div className="max-w-7xl mx-auto px-2 sm:px-0 py-3 flex items-center gap-3">
        <Link href={backHref} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          Назад
        </Link>
        <h2 className="text-xl font-semibold text-gray-900 ml-1">{title}</h2>
        <div className="ml-auto flex items-center gap-2">{actions}</div>
      </div>
    </div>
  )
}


