'use client'

import { useState, useEffect } from 'react'

interface FAQItem {
  id: string
  question: string
  answer: string
  isPopular?: boolean
}

export default function FAQ() {
  const [isVisible, setIsVisible] = useState(false)
  const [openItems, setOpenItems] = useState<string[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFAQ = async (force = false, retryCount = 0) => {
      try {
        // Добавляем timestamp и случайное число для предотвращения кэширования
        const timestamp = Date.now()
        const random = Math.random()
        const res = await fetch(`/api/faq?t=${timestamp}&r=${random}`, { 
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
          console.log('[FAQ] Loaded data from API:', data.length, 'items')
          
          // Всегда обновляем данные, React сам определит, нужно ли перерисовывать
          setItems(data)
          console.log('[FAQ] Data updated', force ? '(forced)' : '(auto)')
          
          if (force) {
            console.log('[FAQ] Data updated after broadcast event')
          }
        } else {
          console.error('[FAQ] Failed to fetch:', res.status, res.statusText)
          // Повторяем запрос при ошибке (максимум 3 раза)
          if (retryCount < 3) {
            setTimeout(() => fetchFAQ(force, retryCount + 1), 1000 * (retryCount + 1))
          }
        }
      } catch (error) {
        console.error('Error loading FAQ:', error)
        // Повторяем запрос при ошибке (максимум 3 раза)
        if (retryCount < 3) {
          setTimeout(() => fetchFAQ(force, retryCount + 1), 1000 * (retryCount + 1))
        }
      } finally {
        setLoading(false)
      }
    }
    
    // Первая загрузка
    fetchFAQ()
    
    // Перезагружаем данные каждую секунду для мгновенного обновления
    const interval = setInterval(() => {
      fetchFAQ(false)
    }, 1000)
    
    // Слушаем события обновления через BroadcastChannel
    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel('faq-updates')
      channel.onmessage = (event) => {
        if (event.data?.type === 'FAQ_UPDATED') {
          console.log('[FAQ] Received update event, refreshing data immediately...')
          // Небольшая задержка, чтобы БД успела обновиться, затем несколько попыток
          setTimeout(() => fetchFAQ(true, 0), 300)
          setTimeout(() => fetchFAQ(true, 0), 1000)
          setTimeout(() => fetchFAQ(true, 0), 2000)
        }
      }
    } catch (e) {
      console.error('[FAQ] Failed to create BroadcastChannel:', e)
    }
    
    // Также перезагружаем при возврате фокуса на страницу
    const handleFocus = () => {
      console.log('[FAQ] Window focused, refreshing data...')
      fetchFAQ(false)
    }
    window.addEventListener('focus', handleFocus)
    
    // Перезагружаем при видимости страницы
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('[FAQ] Page visible, refreshing data...')
        fetchFAQ(false)
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
  }, []) // Убираем items из зависимостей, чтобы избежать бесконечного цикла

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('faq')
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [])

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Часто задаваемые вопросы
          </h2>
          <p className="text-xl text-gray-600">
            Ответы на самые популярные вопросы о строительстве домов
          </p>
        </div>

        {/* FAQ список */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D4E37] mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item: any, index: number) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl shadow-lg transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.question}
                  </h3>
                  {item.isPopular && (
                    <span className="px-2 py-1 bg-[#E8DCC6] text-[#6D5D4A] text-xs font-medium rounded-full">
                      Популярный
                    </span>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    openItems.includes(item.id) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${
                openItems.includes(item.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-6 pb-6">
                  <div className="border-t pt-4">
                    <p className="text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            Не нашли ответ на свой вопрос?
          </p>
          <a
            href="#contacts"
            className="inline-flex items-center px-6 py-3 bg-[#5D4E37] hover:bg-[#6D5D4A] text-white font-semibold rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Задать вопрос
          </a>
        </div>
      </div>
    </section>
  )
}
