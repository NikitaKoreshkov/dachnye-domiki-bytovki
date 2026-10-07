'use client'

import { useState, useEffect } from 'react'

interface Advantage {
  id: string
  title: string
  description: string
}

const iconMap = {
  'fast-build': <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  'quality-materials': <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  'warranty': <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  'turnkey': <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
  'experience': <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  'support': <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" /></svg>
}

export default function Advantages() {
  const [isVisible, setIsVisible] = useState(false)
  const [configTitle, setConfigTitle] = useState('Наши преимущества')
  const [configSubtitle, setConfigSubtitle] = useState('Почему клиенты выбирают именно нас для строительства своего дома')
  const [advantages, setAdvantages] = useState<Advantage[]>([])

  // Загружаем конфигурацию из БД
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/advantages', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setConfigTitle(data.title)
          setConfigSubtitle(data.subtitle)
          setAdvantages(data.items || [])
        }
      } catch (error) {
        console.error('Error loading advantages config:', error)
      }
    }
    loadConfig()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('advantages')
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [])

  const handleAdvantageView = (advantageId: string) => {
    // Аналитика: advantage_viewed
    console.log('Advantage viewed:', advantageId)
  }

  return (
    <section id="advantages" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {configTitle || 'Наши преимущества'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {configSubtitle || 'Почему клиенты выбирают именно нас для строительства своего дома'}
          </p>
        </div>

        {/* Сетка преимуществ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advantages.map((advantage, index) => (
            <div
              key={advantage.id}
              className={`group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 70}ms` }}
              onMouseEnter={() => handleAdvantageView(advantage.id)}
            >
              {/* Иконка */}
              <div className="w-16 h-16 bg-[#E8DCC6] text-[#5D4E37] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#5D4E37] group-hover:text-white transition-all duration-300">
                {iconMap[advantage.id as keyof typeof iconMap]}
              </div>

              {/* Заголовок */}
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#5D4E37] transition-colors duration-300">
                {advantage.title}
              </h3>

              {/* Описание */}
              <p className="text-gray-600 leading-relaxed">
                {advantage.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
