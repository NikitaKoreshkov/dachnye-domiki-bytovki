'use client'

import { useState, useRef, useEffect } from 'react'

interface FooterConfig {
  companyName: string
  companyDescription: string
  whatsappUrl: string
  whatsappText: string
  phone: string
  email: string
  addressLine1: string
  addressLine2: string
  addressLine3: string
  workingHoursLine1: string
  workingHoursLine2: string
  newsletterTitle: string
  newsletterDescription: string
  copyright: string
  ip: string
  inn: string
  legalAddress: string
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [notif, setNotif] = useState<{ text: string; type: 'success'|'warning' }|null>(null)
  const notifTimeout = useRef<NodeJS.Timeout|null>(null)
  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    companyName: 'Дачные-Домики-Бытовки',
    companyDescription: 'Строим качественные каркасные дома под ключ. Быстро, надежно, с гарантией качества.',
    whatsappUrl: 'https://max.ru/u/f9LHodD0cOJ11mRNBmwv4GMET8TQOYXsn4AglpOBhEGg5JpR7w9zmuv4jZ8',
    whatsappText: '🏠 Дачные-Домики-Бытовки\n\nЗдравствуйте! Хочу узнать больше о строительстве каркасных домов.\n\nГотов(а) ответить на ваши вопросы!',
    phone: '+7 (495) 023-82-15',
    email: 'info@dachnye-domiki-bytovki.ru',
    addressLine1: '108811, г. Москва,',
    addressLine2: 'Московский п., ул. Картмазовские пруды,',
    addressLine3: 'д. 2, корп. 3, кв. 474',
    workingHoursLine1: 'Пн-Пт: 9:00 - 18:00',
    workingHoursLine2: 'Сб-Вс: 10:00 - 16:00',
    newsletterTitle: 'Новости и акции',
    newsletterDescription: 'Подпишитесь на рассылку и получайте информацию о новых проектах и специальных предложениях',
    copyright: '© 2025 Дачные-Домики-Бытовки. Все права защищены.',
    ip: 'ИП: ГЮЛЬАХМЕДОВ АТАЙ ЭДИСОНОВИЧ',
    inn: 'ИНН: 055000493170',
    legalAddress: 'Юридический адрес: 108811, РОССИЯ, Г МОСКВА, МОСКОВСКИЙ П, УЛ КАРТМАЗОВСКИЕ ПРУДЫ, Д 2, КОРП 3. КВ 474'
  })

  // Загружаем конфигурацию футера из БД
  useEffect(() => {
    const loadFooterConfig = async () => {
      try {
        const res = await fetch('/api/footer', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setFooterConfig(data)
        }
      } catch (error) {
        console.error('Error loading footer config:', error)
      }
    }
    loadFooterConfig()
  }, [])

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (data?.alreadySubscribed) {
        setNotif({ text: 'Вы уже подписаны!', type: 'warning' })
      } else if (data?.message) {
        setNotif({ text: 'Вы успешно подписаны!', type: 'success' })
        setEmail('')
      } else {
        setNotif({ text: data?.error || 'Ошибка. Попробуйте позже', type: 'warning' })
      }
    } catch (e) {
      setNotif({ text: 'Ошибка при подключении', type: 'warning' })
    }
  }

  useEffect(() => {
    if (notif) {
      if (notifTimeout.current) clearTimeout(notifTimeout.current)
      notifTimeout.current = setTimeout(() => setNotif(null), 3000)
    }
    return () => notifTimeout.current && clearTimeout(notifTimeout.current)
  }, [notif])

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* О компании */}
          <div>
            <h3 className="text-xl font-bold mb-6">{footerConfig.companyName}</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {footerConfig.companyDescription}
            </p>
            <div className="flex space-x-4">
              <a 
                href={footerConfig.whatsappUrl?.includes('max.ru') ? footerConfig.whatsappUrl : 'https://max.ru/u/f9LHodD0cOJ11mRNBmwv4GMET8TQOYXsn4AglpOBhEGg5JpR7w9zmuv4jZ8'}
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 bg-gray-800 text-white rounded-lg flex items-center justify-center hover:bg-[#5D4E37] transition-colors duration-200" 
                aria-label="MAX"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Навигация */}
          <div>
            <h3 className="text-xl font-bold mb-6">Навигация</h3>
            <ul className="space-y-3">
              <li>
                <a href="/#projects-catalog" className="text-gray-300 hover:text-[#A67C52] transition-colors duration-200">
                  Проекты
                </a>
              </li>
              <li>
                <a href="/#calculator" className="text-gray-300 hover:text-[#A67C52] transition-colors duration-200">
                  Калькулятор
                </a>
              </li>
              <li>
                <a href="/#process-steps" className="text-gray-300 hover:text-[#A67C52] transition-colors duration-200">
                  Как работаем
                </a>
              </li>
              <li>
                <a href="/#advantages" className="text-gray-300 hover:text-[#A67C52] transition-colors duration-200">
                  Преимущества
                </a>
              </li>
              <li>
                <a href="/#reviews-gallery" className="text-gray-300 hover:text-[#A67C52] transition-colors duration-200">
                  Отзывы
                </a>
              </li>
              <li>
                <a href="/#faq" className="text-gray-300 hover:text-[#A67C52] transition-colors duration-200">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-xl font-bold mb-6">Контакты</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-[#A67C52] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <a href={`tel:${footerConfig.phone.replace(/\s/g, '')}`} className="text-gray-300 hover:text-[#A67C52] transition-colors duration-200 block">{footerConfig.phone}</a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-[#A67C52] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${footerConfig.email}`} className="text-gray-300 hover:text-[#A67C52] transition-colors duration-200">{footerConfig.email}</a>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-[#A67C52] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-gray-300">{footerConfig.addressLine1}</p>
                  <p className="text-gray-300">{footerConfig.addressLine2}</p>
                  <p className="text-gray-300">{footerConfig.addressLine3}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-[#A67C52] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-gray-300">{footerConfig.workingHoursLine1}</p>
                  <p className="text-gray-300">{footerConfig.workingHoursLine2}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Подписка на новости */}
          <div>
            <h3 className="text-xl font-bold mb-6">{footerConfig.newsletterTitle}</h3>
            <p className="text-gray-300 mb-4">
              {footerConfig.newsletterDescription}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ваш email"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#5D4E37] focus:border-transparent transition-colors duration-200"
                required
              />
              <button
                type="submit"
                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 text-gray-300 hover:bg-[#5D4E37] hover:border-[#5D4E37] hover:text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Подписаться
              </button>
              {/* Notification строго под кнопкой, не влияет на остальное */}
              <div className={`w-full transition-all duration-500 mt-2 ${notif ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                {notif && (
                  <div className={`w-full ${notif.type==='success' ? 'bg-green-500 text-white' : notif.type==='warning' ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800'} rounded-lg shadow text-center text-base font-medium px-6 py-3 transition-all duration-500`}>{notif.text}</div>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Нижняя часть футера */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              {footerConfig.copyright}
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-end text-sm">
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#A67C52] transition-colors duration-200">
                Политика конфиденциальности
              </a>
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#A67C52] transition-colors duration-200">
                Условия использования
              </a>
              <a href="/cookies" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#A67C52] transition-colors duration-200">
                Политика Cookie
              </a>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <p>{footerConfig.ip}</p>
            <p>{footerConfig.inn}</p>
            <p>{footerConfig.legalAddress}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
