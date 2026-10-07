'use client'

import { useState, useEffect } from 'react'

interface CalculatorData {
  houseType: string
  area: number
  finishing: string[]
  options: string[] // Для совместимости оставляем массив, но на шаге 4 разрешаем только одну опцию
}

// Дефолтные значения (fallback если БД пустая)
const defaultHouseTypes = [
  { id: 'bytovki', name: 'Бытовки', image: '/images/house.jpg', basePrice: 5000 },
  { id: 'dacha', name: 'Дачные Домики', image: '/images/house.jpg', basePrice: 6000 }
]

const defaultFinishingOptions = [
  { id: 'none', name: 'Без отделки', multiplier: 0 },
  { id: 'basic', name: 'Чистовая отделка', multiplier: 0.3 },
  { id: 'euro', name: 'Евро отделка', multiplier: 0.5 }
]

const defaultAdditionalOptions = [
  { id: 'terrace', name: 'Терраса', price: 31500 },
  { id: 'attic', name: 'Мансарда', price: 42000 },
  { id: 'veranda', name: 'Веранда', price: 21000 },
  { id: 'foundation', name: 'Фундамент', price: 63000 }
]

const STORAGE_KEY = 'dachnye_domiki_bytovki_calculator_data'

export default function Calculator() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<CalculatorData>({
    houseType: 'bytovki',
    area: 50,
    finishing: [],
    options: []
  })
  const [isVisible, setIsVisible] = useState(false)
  const [estimatedPrice, setEstimatedPrice] = useState(0)
  const [houseTypes, setHouseTypes] = useState(defaultHouseTypes)
  const [finishingOptions, setFinishingOptions] = useState(defaultFinishingOptions)
  const [additionalOptions, setAdditionalOptions] = useState(defaultAdditionalOptions)
  const [stepTexts, setStepTexts] = useState({ step1Title: 'Выберите тип дома', step2Title: 'Укажите площадь дома', step3Title: 'Выберите тип отделки', step4Title: 'Дополнительные опции' })
  const [areaSettings, setAreaSettings] = useState({ minArea: 20, maxArea: 120, defaultArea: 50 })
  const [whatsappTemplate, setWhatsappTemplate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [phone, setPhone] = useState('')

  // Загрузка конфигурации калькулятора из БД
  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log('[CALC] Loading config from /api/calculator')
        const res = await fetch('/api/calculator', { cache: 'no-store' })
        if (res.ok) {
          const cfg = await res.json()
          console.log('[CALC] Loaded config:', { 
            finishingCount: cfg.finishingOptions?.length || 0, 
            additionalCount: cfg.additionalOptions?.length || 0 
          })
          if (cfg.houseTypes && Array.isArray(cfg.houseTypes)) {
            setHouseTypes(cfg.houseTypes)
            // Проверяем, что выбранный тип дома существует в новой конфигурации
            setData(prev => {
              const exists = cfg.houseTypes.find((t: any) => t.id === prev.houseType)
              if (!exists && cfg.houseTypes.length > 0) {
                return { ...prev, houseType: cfg.houseTypes[0].id }
              }
              return prev
            })
          }
          if (cfg.finishingOptions && Array.isArray(cfg.finishingOptions)) {
            console.log('[CALC] Setting finishing options:', cfg.finishingOptions)
            setFinishingOptions(cfg.finishingOptions)
          }
          if (cfg.additionalOptions && Array.isArray(cfg.additionalOptions)) {
            console.log('[CALC] Setting additional options:', cfg.additionalOptions)
            setAdditionalOptions(cfg.additionalOptions)
          }
          if (cfg.stepTexts) setStepTexts(cfg.stepTexts)
          if (cfg.areaSettings) setAreaSettings(cfg.areaSettings)
          if (cfg.whatsappTemplate) setWhatsappTemplate(cfg.whatsappTemplate)
        }
      } catch (error) {
        console.error('Error loading calculator config:', error)
      }
    }
    loadConfig()
  }, [])

  // Загрузка данных из localStorage при монтировании
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          // Разделяем данные калькулятора и шаг
          const { currentStep: savedStep, ...savedCalculatorData } = parsed
          
          // Валидация загруженных данных
          if (savedCalculatorData.houseType && 
              savedCalculatorData.area && 
              Array.isArray(savedCalculatorData.finishing) && 
              Array.isArray(savedCalculatorData.options)) {
            setData(savedCalculatorData as CalculatorData)
            if (savedStep && typeof savedStep === 'number' && savedStep >= 1 && savedStep <= 4) {
              setCurrentStep(savedStep)
            }
          }
        } catch (e) {
          console.error('Error loading saved calculator data:', e)
          // Очищаем поврежденные данные
          localStorage.removeItem(STORAGE_KEY)
        }
      }
      setIsInitialized(true)
    }
  }, [])

  // Сохранение данных в localStorage при изменении (только после инициализации)
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      try {
        const dataToSave = { 
          ...data, 
          currentStep 
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
      } catch (e) {
        console.error('Error saving calculator data:', e)
      }
    }
  }, [data, currentStep, isInitialized])

  // Сохранение номера телефона в localStorage при изменении
  useEffect(() => {
    if (typeof window !== 'undefined' && phone) {
      try {
        localStorage.setItem('dachnye_domiki_bytovki_calculator_phone', phone)
      } catch (e) {
        console.error('Error saving phone:', e)
      }
    }
  }, [phone])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById('calculator')
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    calculatePrice()
  }, [data, houseTypes, finishingOptions, additionalOptions])

  const calculatePrice = () => {
    const houseTypeData = houseTypes.find(ht => ht.id === data.houseType)
    if (!houseTypeData) return

    let basePrice = houseTypeData.basePrice * data.area

    // Добавляем стоимость отделки
    data.finishing.forEach(finishId => {
      const finish = finishingOptions.find(f => f.id === finishId)
      if (finish) {
        basePrice += basePrice * finish.multiplier
      }
    })

    // Добавляем дополнительные опции
    data.options.forEach(optionId => {
      const option = additionalOptions.find(o => o.id === optionId)
      if (option) {
        basePrice += option.price
      }
    })

    setEstimatedPrice(Math.round(basePrice))
  }

  const handleHouseTypeChange = (type: string) => {
    setData(prev => ({ ...prev, houseType: type }))
    console.log('Calculator step completed:', { step: 1, houseType: type })
  }

  const handleAreaChange = (area: number) => {
    setData(prev => ({ ...prev, area }))
    console.log('Calculator step completed:', { step: 2, area })
  }

  const handleFinishingChange = (finishId: string) => {
    setData(prev => ({
      ...prev,
      // На шаге 3 разрешаем выбрать только одну опцию (радиокнопка)
      finishing: [finishId]
    }))
    console.log('Calculator step completed:', { step: 3, selectedFinishing: finishId })
  }

  const handleOptionChange = (optionId: string) => {
    setData(prev => ({
      ...prev,
      // На шаге 4 разрешаем выбрать только одну опцию (радиокнопка)
      options: [optionId]
    }))
    console.log('Calculator step completed:', { step: 4, selectedOption: optionId })
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽'
  }

  const getHouseTypeName = () => {
    return houseTypes.find(t => t.id === data.houseType)?.name || data.houseType
  }

  const getSelectedFinishing = () => {
    return data.finishing.map(id => finishingOptions.find(f => f.id === id)?.name).filter(Boolean).join(', ') || 'Не выбрано'
  }

  const getSelectedOptions = () => {
    return data.options.map(id => additionalOptions.find(o => o.id === id)).filter(Boolean)
  }

  const handleWhatsAppClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('[CALCULATOR] Starting MAX send, current data:', data)
    console.log('[CALCULATOR] Estimated price:', estimatedPrice)
    
    const houseType = getHouseTypeName()
    const finishingNames = data.finishing.map(id => finishingOptions.find(f => f.id === id)?.name).filter(Boolean) as string[]
    const selectedOptions = getSelectedOptions()
    const houseTypeData = houseTypes.find(ht => ht.id === data.houseType)
    
    console.log('[CALCULATOR] Collected data:', {
      houseType,
      finishingNames,
      selectedOptions: selectedOptions.map(o => ({ name: o?.name, price: o?.price })),
      area: data.area,
      estimatedPrice
    })
    
    // Используем шаблон из БД или дефолтный
    // Проверяем, что шаблон не пустой и содержит переменные (не просто "Шаблон MAX")
    const defaultTemplate = `🏠 РАСЧЁТ СТОИМОСТИ ДОМА

📋 Параметры:
• Тип дома: {{houseType}}
• Площадь: {{area}} м²

🎨 Отделка:
{{finishing}}

✨ Дополнительные опции:
{{options}}

💰 Предварительная стоимость:
{{price}}

📞 Свяжитесь со мной для получения точного расчёта и консультации!`
    
    // Если шаблон пустой, равен "Шаблон MAX" или не содержит переменных - используем дефолтный
    let message = whatsappTemplate
    if (!message || 
        message.trim() === 'Шаблон MAX' || 
        message.trim() === 'Шаблон MAX' ||
        !message.includes('{{')) {
      message = defaultTemplate
      console.log('[CALCULATOR] Using default template (DB template is empty or invalid)')
    } else {
      console.log('[CALCULATOR] Using template from database')
    }
    
    console.log('[CALCULATOR] Original message template:', message)
    
    // Заменяем переменные в шаблоне
    const finishingText = finishingNames.length > 0 ? finishingNames.map(f => `• ${f}`).join('\n') : 'Не выбрано'
    const optionsText = selectedOptions.length > 0 
      ? selectedOptions.map(opt => `• ${opt?.name} (+${formatPrice(opt?.price || 0)})`).join('\n')
      : 'Не выбрано'
    
    console.log('[CALCULATOR] Formatted text:', {
      finishingText,
      optionsText,
      houseType,
      area: String(data.area),
      price: formatPrice(estimatedPrice)
    })
    
    message = message
      .replace(/\{\{houseType\}\}/g, houseType || 'Не выбрано')
      .replace(/\{\{area\}\}/g, String(data.area || 0))
      .replace(/\{\{finishing\}\}/g, finishingText)
      .replace(/\{\{options\}\}/g, optionsText)
      .replace(/\{\{price\}\}/g, formatPrice(estimatedPrice || 0))
      .replace(/\{\{pricePerMeter\}\}/g, houseTypeData ? formatPrice(houseTypeData.basePrice) : '')
    
    console.log('[CALCULATOR] Final message:', message)

    // Проверяем, что номер телефона введен
    const trimmedPhone = phone.trim()
    if (!trimmedPhone) {
      setSubmitStatus({ type: 'error', message: 'Пожалуйста, введите номер телефона' })
      setTimeout(() => setSubmitStatus(null), 3000)
      return
    }

    // Проверяем формат номера телефона (российский формат)
    // Допустимые форматы: +7XXXXXXXXXX, 8XXXXXXXXXX, +7 (XXX) XXX-XX-XX и т.д.
    const phoneDigits = trimmedPhone.replace(/\D/g, '')
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      setSubmitStatus({ type: 'error', message: 'Некорректный формат номера телефона. Введите номер в формате +7 (___) ___-__-__' })
      setTimeout(() => setSubmitStatus(null), 3000)
      return
    }

    // Проверяем, что номер начинается с 7 или 8 (для российских номеров)
    const normalizedDigits = phoneDigits.startsWith('8') ? '7' + phoneDigits.slice(1) : phoneDigits
    if (!normalizedDigits.startsWith('7') || normalizedDigits.length !== 11) {
      setSubmitStatus({ type: 'error', message: 'Некорректный формат номера телефона. Введите номер в формате +7 (___) ___-__-__' })
      setTimeout(() => setSubmitStatus(null), 3000)
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const response = await fetch('/api/calculator-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          phone: trimmedPhone,
          params: { 
            ...data, 
            estimatedPrice, 
            houseType, 
            finishing: finishingNames,
            finishingText,
            options: selectedOptions.map(o => ({ name: o?.name, price: o?.price })),
            optionsText
          }
        })
      })

      const responseData = await response.json()

      if (response.ok && responseData.success) {
        setSubmitStatus({ type: 'success', message: 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.' })
        setTimeout(() => setSubmitStatus(null), 5000)
      } else {
        setSubmitStatus({ type: 'error', message: responseData.error || 'Ошибка отправки заявки. Попробуйте позже.' })
        setTimeout(() => setSubmitStatus(null), 5000)
      }
    } catch (error) {
      console.error('[CALCULATOR] Error submitting request:', error)
      setSubmitStatus({ type: 'error', message: 'Ошибка отправки заявки. Попробуйте позже.' })
      setTimeout(() => setSubmitStatus(null), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="calculator" className="py-20 bg-white scroll-mt-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Калькулятор стоимости
          </h2>
          <p className="text-xl text-gray-600">
            Получите предварительную оценку стоимости вашего дома
          </p>
        </div>

        {/* Калькулятор */}
        <div className={`transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Прогресс бар */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-600">
                  Шаг {currentStep} из 4
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {Math.round((currentStep / 4) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#5D4E37] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Шаг 1: Тип дома */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {stepTexts.step1Title || 'Выберите тип дома'}
                </h3>
                <div className={`grid grid-cols-1 ${houseTypes.length === 1 ? 'md:grid-cols-1 max-w-sm mx-auto' : houseTypes.length === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' : 'md:grid-cols-3 max-w-4xl mx-auto'} gap-6`}>
                  {houseTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 ${
                        data.houseType === type.id
                          ? 'border-[#5D4E37] bg-[#F5F1E8]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleHouseTypeChange(type.id)}
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {type.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          от {formatPrice(type.basePrice)} за м²
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Шаг 2: Площадь */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {stepTexts.step2Title || 'Укажите площадь дома'}
                </h3>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="block text-lg font-medium text-gray-700">
                      Площадь: {data.area} м²
                    </label>
                    <input
                      type="range"
                      min={areaSettings.minArea || 20}
                      max={areaSettings.maxArea || 120}
                      value={data.area}
                      onChange={(e) => handleAreaChange(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{areaSettings.minArea || 20} м²</span>
                      <span>{areaSettings.maxArea || 120} м²</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Шаг 3: Отделка */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {stepTexts.step3Title || 'Выберите тип отделки'}
                </h3>
                <div className="space-y-4">
                  {finishingOptions.map((option) => (
                    <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="finishingOption"
                        checked={data.finishing.includes(option.id)}
                        onChange={() => handleFinishingChange(option.id)}
                        className="w-5 h-5 text-[#5D4E37] border-gray-300 focus:ring-[#5D4E37]"
                      />
                      <span className="text-lg text-gray-700">{option.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Шаг 4: Дополнительные опции */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {stepTexts.step4Title || 'Дополнительные опции'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {additionalOptions.map((option) => (
                    <label key={option.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="additionalOption"
                          checked={data.options.includes(option.id)}
                          onChange={() => handleOptionChange(option.id)}
                          className="w-5 h-5 text-[#5D4E37] border-gray-300 focus:ring-[#5D4E37]"
                        />
                        <span className="text-lg text-gray-700">{option.name}</span>
                      </div>
                      <span className="text-[#5D4E37] font-semibold">
                        +{formatPrice(option.price)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Результат */}
            {currentStep === 4 && (
              <div className="mt-8 p-6 bg-[#F5F1E8] rounded-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Предварительная стоимость
                </h3>
                <div className="text-3xl md:text-4xl font-bold text-[#5D4E37] mb-4">
                  {formatPrice(estimatedPrice)}
                </div>
                <p className="text-gray-600 mb-6">
                  Точная стоимость будет рассчитана после общения с менеджером
                </p>
                
                {submitStatus && (
                  <div className={`mb-4 p-4 rounded-lg ${submitStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {submitStatus.message}
                  </div>
                )}
                
                {/* Поле для ввода номера телефона и кнопка отправки в одну линию */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label htmlFor="calculator-phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Ваш номер телефона *
                    </label>
                    <input
                      type="tel"
                      id="calculator-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D4E37] focus:border-transparent transition-colors duration-200"
                      placeholder="+7 (___) ___-__-__"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleWhatsAppClick}
                      type="button"
                      disabled={isSubmitting || !phone.trim()}
                      className="flex items-center justify-center gap-2 px-8 py-3 bg-[#5D4E37] hover:bg-[#6D5D4A] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 whitespace-nowrap"
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
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Получить точный расчёт
                      </>
                    )}
                  </button>
                  </div>
                </div>
              </div>
            )}

            {/* Навигация */}
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-semibold rounded-lg transition-colors duration-200"
              >
                Назад
              </button>
              {currentStep < 4 && (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-[#5D4E37] hover:bg-[#6D5D4A] text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Далее
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
