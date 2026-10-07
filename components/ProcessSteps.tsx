'use client'

import { useState, useEffect } from 'react'

interface Step {
  id: number
  title: string
  description: string
  details?: string
}

const iconMap = {
  1: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  2: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  3: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
  4: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4" /></svg>,
  5: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
}

export default function ProcessSteps() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const [configTitle, setConfigTitle] = useState('Как мы работаем')
  const [configSubtitle, setConfigSubtitle] = useState('Простой и понятный процесс от проекта до готового дома')
  const [steps, setSteps] = useState<Step[]>([])

  // Загружаем конфигурацию из БД
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/process-steps', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setConfigTitle(data.title)
          setConfigSubtitle(data.subtitle)
          setSteps(data.steps || [])
        }
      } catch (error) {
        console.error('Error loading process steps config:', error)
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

    const element = document.getElementById('process-steps')
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [])

  const handleDocumentDownload = () => {
    // Аналитика: step_doc_downloaded
    console.log('Contract document downloaded')
    
    // Скачивание PDF договора
    window.open('/api/contract/download', '_blank')
  }

  return (
    <section id="process-steps" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {configTitle || 'Как мы работаем'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {configSubtitle || 'Простой и понятный процесс от проекта до готового дома'}
          </p>
        </div>

        {/* Десктопная версия */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Линия соединения */}
            <div className="absolute top-16 left-0 right-0 h-0.5 bg-gray-200">
              <div 
                className={`h-full bg-[#5D4E37] transition-all duration-1000 ${
                  isVisible ? 'w-full' : 'w-0'
                }`}
              ></div>
            </div>

            {/* Шаги */}
            <div className="grid grid-cols-5 gap-8">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`text-center transition-all duration-500 ${
                    isVisible 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                  onMouseEnter={() => setActiveStep(step.id)}
                >
                  {/* Иконка */}
                  <div className={`relative w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                    activeStep === step.id || isVisible
                      ? 'bg-[#5D4E37] text-white scale-110' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {iconMap[step.id as keyof typeof iconMap]}
                  </div>

                  {/* Номер шага */}
                  <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    activeStep === step.id || isVisible
                      ? 'bg-[#6D5D4A] text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step.id}
                  </div>

                  {/* Заголовок */}
                  <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                    activeStep === step.id ? 'text-[#5D4E37]' : 'text-gray-900'
                  }`}>
                    {step.title}
                  </h3>

                  {/* Описание */}
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Мобильная версия */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start space-x-4 transition-all duration-500 ${
                isVisible 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 -translate-x-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Иконка и номер */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#5D4E37] text-white rounded-full flex items-center justify-center relative">
                  {iconMap[step.id as keyof typeof iconMap]}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#6D5D4A] rounded-full flex items-center justify-center text-xs font-bold">
                    {step.id}
                  </div>
                </div>
              </div>

              {/* Контент */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 mb-2">
                  {step.description}
                </p>
                <p className="text-sm text-gray-500">
                  {step.details}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button
            onClick={handleDocumentDownload}
            className="inline-flex items-center px-6 py-3 bg-[#5D4E37] hover:bg-[#6D5D4A] text-white font-semibold rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Посмотреть типовой договор
          </button>
        </div>
      </div>
    </section>
  )
}
