'use client'

import { useState, useEffect } from 'react'

interface FooterConfig {
  phone: string
  email: string
  addressLine1: string
  addressLine2: string
  addressLine3: string
  workingHoursLine1: string
  workingHoursLine2: string
  whatsappUrl: string
  whatsappText: string
}

export default function ContactsCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    phone: '+7 (495) 023-82-15',
    email: 'info@dachnye-domiki-bytovki.ru',
    addressLine1: '108811, г. Москва,',
    addressLine2: 'Московский п., ул. Картмазовские пруды,',
    addressLine3: 'д. 2, корп. 3, кв. 474',
    workingHoursLine1: 'Пн-Пт: 9:00 - 18:00',
    workingHoursLine2: 'Сб-Вс: 10:00 - 16:00',
    whatsappUrl: 'https://max.ru/u/f9LHodD0cOJ11mRNBmwv4GMET8TQOYXsn4AglpOBhEGg5JpR7w9zmuv4jZ8',
    whatsappText: '🏠 Дачные-Домики-Бытовки\n\nЗдравствуйте! Хочу узнать больше о строительстве каркасных домов.\n\nГотов(а) ответить на ваши вопросы!'
  })

  // Загружаем конфигурацию контактов из БД
  useEffect(() => {
    const loadFooterConfig = async () => {
      try {
        const res = await fetch('/api/footer', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setFooterConfig({
            phone: data.phone || '+7 (495) 023-82-15',
            email: data.email || 'info@dachnye-domiki-bytovki.ru',
            addressLine1: data.addressLine1 || '108811, г. Москва,',
            addressLine2: data.addressLine2 || 'Московский п., ул. Картмазовские пруды,',
            addressLine3: data.addressLine3 || 'д. 2, корп. 3, кв. 474',
            workingHoursLine1: data.workingHoursLine1 || 'Пн-Пт: 9:00 - 18:00',
            workingHoursLine2: data.workingHoursLine2 || 'Сб-Вс: 10:00 - 16:00',
            whatsappUrl: data.whatsappUrl || 'https://max.ru/u/f9LHodD0cOJ11mRNBmwv4GMET8TQOYXsn4AglpOBhEGg5JpR7w9zmuv4jZ8',
            whatsappText: data.whatsappText || '🏠 Дачные-Домики-Бытовки\n\nЗдравствуйте! Хочу узнать больше о строительстве каркасных домов.\n\nГотов(а) ответить на ваши вопросы!'
          })
        }
      } catch (error) {
        console.error('Error loading footer config:', error)
      }
    }
    loadFooterConfig()
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

    const element = document.getElementById('contacts')
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      setSubmitStatus({ type: 'error', message: 'Пожалуйста, заполните все обязательные поля' })
      setTimeout(() => setSubmitStatus(null), 3000)
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          message: formData.message.trim() || undefined
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitStatus({ type: 'success', message: 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.' })
        setFormData({ name: '', phone: '', message: '' })
        setTimeout(() => setSubmitStatus(null), 5000)
      } else {
        setSubmitStatus({ type: 'error', message: data.error || 'Ошибка отправки заявки. Попробуйте позже.' })
        setTimeout(() => setSubmitStatus(null), 5000)
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      setSubmitStatus({ type: 'error', message: 'Ошибка отправки заявки. Попробуйте позже.' })
      setTimeout(() => setSubmitStatus(null), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <section id="contacts" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Контактная информация */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                Свяжитесь с нами
              </h2>
              
              <div className="space-y-8">
                {/* Телефон */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#E8DCC6] text-[#5D4E37] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Телефон</h3>
                    <a href={`tel:${footerConfig.phone.replace(/\s/g, '')}`} className="text-gray-600 hover:text-[#A67C52] transition-colors duration-200">{footerConfig.phone}</a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#E8DCC6] text-[#5D4E37] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
                    <a href={`mailto:${footerConfig.email}`} className="text-gray-600 hover:text-[#A67C52] transition-colors duration-200">{footerConfig.email}</a>
                  </div>
                </div>

                {/* Адрес */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#E8DCC6] text-[#5D4E37] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Адрес</h3>
                    <div className="text-gray-600">
                      <p>{footerConfig.addressLine1}</p>
                      <p>{footerConfig.addressLine2}</p>
                      <p>{footerConfig.addressLine3}</p>
                    </div>
                  </div>
                </div>

                {/* Часы работы */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#E8DCC6] text-[#5D4E37] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Часы работы</h3>
                    <p className="text-gray-600 mb-1">{footerConfig.workingHoursLine1}</p>
                    <p className="text-gray-600">{footerConfig.workingHoursLine2}</p>
                  </div>
                </div>
              </div>

              {/* Социальные сети */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Мы в соцсетях</h3>
                <div className="flex space-x-4">
                  <a 
                    href={footerConfig.whatsappUrl?.includes('max.ru') ? footerConfig.whatsappUrl : 'https://max.ru/u/f9LHodD0cOJ11mRNBmwv4GMET8TQOYXsn4AglpOBhEGg5JpR7w9zmuv4jZ8'}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 bg-[#5D4E37] text-white rounded-lg flex items-center justify-center hover:bg-[#6D5D4A] transition-colors duration-200" 
                    aria-label="MAX"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Форма заявки */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Оставить заявку
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Ваше имя *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D4E37] focus:border-transparent transition-colors duration-200"
                    placeholder="Введите ваше имя"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D4E37] focus:border-transparent transition-colors duration-200"
                    placeholder="+7 (___) ___-__-__"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Сообщение
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D4E37] focus:border-transparent transition-colors duration-200"
                    placeholder="Расскажите о вашем проекте..."
                  />
                </div>

                {submitStatus && (
                  <div className={`p-4 rounded-lg ${submitStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {submitStatus.message}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-[#5D4E37] hover:bg-[#6D5D4A] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Отправка...
                    </>
                  ) : (
                    <>
                      <svg className="hidden sm:block w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Отправить заявку
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
