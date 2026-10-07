'use client'

import { useState, useEffect } from 'react'

export default function CatalogSeoText() {
  const [title, setTitle] = useState('Каркасные дома под ключ в России')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSeoText = async (force = false, retryCount = 0) => {
      try {
        const timestamp = Date.now()
        const random = Math.random()
        const res = await fetch(`/api/catalog-seo-text?t=${timestamp}&r=${random}`, {
          cache: 'no-store',
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })

        if (res.ok) {
          const data = await res.json()
          setTitle(data.title || 'Каркасные дома под ключ в России')
          setContent(data.content || '')
          if (force) {
            console.log('[Catalog SEO Text] Data updated after broadcast event')
          }
        } else {
          console.error('[Catalog SEO Text] Failed to fetch:', res.status, res.statusText)
          if (retryCount < 3) {
            setTimeout(() => fetchSeoText(force, retryCount + 1), 1000 * (retryCount + 1))
          }
        }
      } catch (error) {
        console.error('[Catalog SEO Text] Error loading SEO text:', error)
        if (retryCount < 3) {
          setTimeout(() => fetchSeoText(force, retryCount + 1), 1000 * (retryCount + 1))
        }
      } finally {
        setLoading(false)
      }
    }

    // Первая загрузка
    fetchSeoText()

    // Перезагружаем данные каждую секунду для мгновенного обновления
    const interval = setInterval(() => {
      fetchSeoText(false)
    }, 1000)

    // Слушаем события обновления через BroadcastChannel
    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel('catalog-seo-text-updates')
      channel.onmessage = (event) => {
        if (event.data?.type === 'CATALOG_SEO_TEXT_UPDATED') {
          console.log('[Catalog SEO Text] Received update event, refreshing data immediately...')
          setTimeout(() => fetchSeoText(true, 0), 300)
          setTimeout(() => fetchSeoText(true, 0), 1000)
          setTimeout(() => fetchSeoText(true, 0), 2000)
        }
      }
    } catch (e) {
      console.error('[Catalog SEO Text] Failed to create BroadcastChannel:', e)
    }

    // Перезагружаем при возврате фокуса на страницу
    const handleFocus = () => {
      fetchSeoText(false)
    }
    window.addEventListener('focus', handleFocus)

    // Перезагружаем при видимости страницы
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSeoText(false)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      if (channel) {
        channel.close()
      }
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  if (loading && !content) {
    return null
  }

  // Разбиваем текст на абзацы
  const paragraphs = content.split('\n\n').filter(p => p.trim())

  return (
    <div className="bg-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {title}
          </h2>
          <div className="space-y-5 text-gray-700 leading-relaxed">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-lg">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

