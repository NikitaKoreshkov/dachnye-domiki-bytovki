'use client'

import { useEffect, useState } from 'react'

export default function MetadataTags() {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null)
  const [appleTouchIcon, setAppleTouchIcon] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/metadata', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (data.faviconUrl) setFaviconUrl(data.faviconUrl)
          if (data.appleTouchIcon) setAppleTouchIcon(data.appleTouchIcon)
        }
      } catch (error) {
        console.error('Error loading metadata:', error)
      }
    }
    load()
  }, [])

  if (!faviconUrl && !appleTouchIcon) return null

  return (
    <>
      {faviconUrl && (
        <>
          <link rel="icon" href={faviconUrl} />
          <link rel="shortcut icon" href={faviconUrl} />
        </>
      )}
      {appleTouchIcon && (
        <link rel="apple-touch-icon" href={appleTouchIcon} />
      )}
    </>
  )
}

