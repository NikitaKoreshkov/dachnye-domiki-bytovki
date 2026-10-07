'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CallbackModal from '@/components/CallbackModal'
import { useFavoritesCompare } from '@/components/providers/FavoritesCompareProvider'

interface Project {
  id: string
  title: string
  area: number
  priceFrom: number
  priceTo?: number
  floors: number
  material: string
  buildTime: number
  completion: string
  region: string
  image: string
  images?: string[]
  tags: string[]
  hasTerrasse?: boolean
  hasBath?: boolean
  hasGarage?: boolean
  features?: string[]
  description?: string
  advantages?: string[]
  technicalSpecs?: string
  specs?: {
    [key: string]: any
    completionOptions?: Array<{ label: string; price: number }>
    additionalOptions?: Array<{ label: string; price: number }>
  }
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [isInCompare, setIsInCompare] = useState(false)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [similar, setSimilar] = useState<any[]>([])
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false)
  const [selectedCompletion, setSelectedCompletion] = useState<string | null>(null)
  const [selectedAdditionalOptions, setSelectedAdditionalOptions] = useState<string[]>([])
  const [projectOptions, setProjectOptions] = useState<{
    [categoryId: string]: {
      title: string
      options: Array<{ id: string; label: string; price: number; isDefault: boolean }>
    }
  } | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [optionsVersion, setOptionsVersion] = useState(0)
  const [optionsInitialized, setOptionsInitialized] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [phone, setPhone] = useState('')

  // Получаем ID проекта
  const projectId = params?.id

  // Загружаем сохраненный номер телефона из localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPhone = localStorage.getItem('dachnye_domiki_bytovki_calculator_phone')
        if (savedPhone) {
          setPhone(savedPhone)
        }
      } catch (error) {
        console.error('Error loading saved phone:', error)
      }
    }
  }, [])

  // Сохраняем номер телефона в localStorage при изменении
  useEffect(() => {
    if (typeof window !== 'undefined' && phone.trim()) {
      try {
        localStorage.setItem('dachnye_domiki_bytovki_calculator_phone', phone)
      } catch (error) {
        console.error('Error saving phone:', error)
      }
    }
  }, [phone])

  // На детальной странице проекта предотвращаем восстановление скролла браузером
  useEffect(() => {
    if (typeof window === 'undefined' || !projectId) return
    const prev = (history as any).scrollRestoration
    try { (history as any).scrollRestoration = 'manual' } catch {}
    window.scrollTo({ top: 0, behavior: 'auto' })
    return () => { try { (history as any).scrollRestoration = prev || 'auto' } catch {} }
  }, [projectId])

  useEffect(() => {
    if (!projectId) {
      setError('ID проекта не указан')
      setLoading(false)
      return
    }

    const fetchProject = async () => {
      try {
        setLoading(true)
        setError(null)
        setSelectedImage(0) // Сбрасываем на главное фото при загрузке
        console.log('[PROJECT DETAIL] Fetching project:', projectId)
        
        // Добавляем cache: 'no-store' чтобы всегда получать свежие данные
        const response = await fetch(`/api/projects/${projectId}`, { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        if (!response.ok) {
          let errorText = 'Проект не найден. Возможно, он был удален.'
          try {
            const errorData = await response.json()
            errorText = errorData.error || errorData.details || errorText
            console.error('[PROJECT DETAIL] API error response:', errorData)
          } catch {
            errorText = `Ошибка ${response.status}: ${response.statusText}`
          }
          
          setError(errorText)
          // Предлагаем вернуться в каталог
          setTimeout(() => {
            if (window.confirm(`${errorText}\n\nВернуться в каталог?`)) {
              window.location.href = '/catalog'
            }
          }, 1000)
          return
        }
        
        let data
        try {
          data = await response.json()
        console.log('[PROJECT DETAIL] Loaded project data:', data)
        } catch (jsonError) {
          console.error('[PROJECT DETAIL] JSON parse error:', jsonError)
          throw new Error('Ошибка парсинга данных от сервера')
        }
        
        if (!data || !data.id || !data.title) {
          console.error('[PROJECT DETAIL] Invalid data structure:', data)
          throw new Error('Неполные данные проекта получены от сервера')
        }
        
        // Нормализуем specs если необходимо
        if (!data.specs || typeof data.specs !== 'object') {
          data.specs = {}
        } else {
          // Убедимся, что completionOptions и additionalOptions существуют и являются массивами
          if (data.specs.completionOptions && !Array.isArray(data.specs.completionOptions)) {
            data.specs.completionOptions = []
          }
          if (!data.specs.completionOptions) {
            data.specs.completionOptions = []
          }
          if (data.specs.additionalOptions && !Array.isArray(data.specs.additionalOptions)) {
            data.specs.additionalOptions = []
          }
          if (!data.specs.additionalOptions) {
            data.specs.additionalOptions = []
          }
        }
        
        setProject(data)
        
        // Проверяем, есть ли опции конфигурации в specs проекта
        // Поддерживаем как новую структуру (optionCategories), так и старую (finishing, insulation и т.д.)
        if (data.specs?.optionCategories && typeof data.specs.optionCategories === 'object') {
          // Новая структура: optionCategories
          const optionCategories: Record<string, { title: string; options: any[] }> = {}
          Object.entries(data.specs.optionCategories).forEach(([categoryId, category]: [string, any]) => {
            if (category && typeof category === 'object' && category.title && Array.isArray(category.options)) {
              optionCategories[categoryId] = {
                title: category.title,
                options: category.options
              }
            }
          })
          
          if (Object.keys(optionCategories).length > 0) {
            console.log('[PROJECT OPTIONS] Using new optionCategories structure:', optionCategories)
            setProjectOptions(optionCategories)
            
            // Устанавливаем значения по умолчанию
            const newSelectedOptions: Record<string, string> = {}
            Object.entries(optionCategories).forEach(([categoryId, category]) => {
              if (category.options && category.options.length > 0) {
                const defaultOption = category.options.find((o: any) => o.isDefault) || category.options[0]
                if (defaultOption) {
                  newSelectedOptions[categoryId] = defaultOption.label
                }
              }
            })
            setSelectedOptions(newSelectedOptions)
            setOptionsInitialized(true)
          }
        } else if (data.specs && (
          (data.specs.finishing && Array.isArray(data.specs.finishing) && data.specs.finishing.length > 0) ||
          (data.specs.insulation && Array.isArray(data.specs.insulation) && data.specs.insulation.length > 0) ||
          (data.specs.floor && Array.isArray(data.specs.floor) && data.specs.floor.length > 0) ||
          (data.specs.foundation && Array.isArray(data.specs.foundation) && data.specs.foundation.length > 0)
        )) {
          // Старая структура: finishing, insulation, floor, foundation
          // Конвертируем в новую структуру для обратной совместимости
          const optionCategories: Record<string, { title: string; options: any[] }> = {}
          
          if (data.specs.finishing && Array.isArray(data.specs.finishing) && data.specs.finishing.length > 0) {
            optionCategories.finishing = { title: 'Отделка', options: data.specs.finishing }
          }
          if (data.specs.insulation && Array.isArray(data.specs.insulation) && data.specs.insulation.length > 0) {
            optionCategories.insulation = { title: 'Утепление', options: data.specs.insulation }
          }
          if (data.specs.floor && Array.isArray(data.specs.floor) && data.specs.floor.length > 0) {
            optionCategories.floor = { title: 'Пол', options: data.specs.floor }
          }
          if (data.specs.foundation && Array.isArray(data.specs.foundation) && data.specs.foundation.length > 0) {
            optionCategories.foundation = { title: 'Фундамент', options: data.specs.foundation }
          }
          
          if (Object.keys(optionCategories).length > 0) {
            console.log('[PROJECT OPTIONS] Using old structure, converted to optionCategories:', optionCategories)
            setProjectOptions(optionCategories)
            
            // Устанавливаем значения по умолчанию
            const newSelectedOptions: Record<string, string> = {}
            Object.entries(optionCategories).forEach(([categoryId, category]) => {
              if (category.options && category.options.length > 0) {
                const defaultOption = category.options.find((o: any) => o.isDefault) || category.options[0]
                if (defaultOption) {
                  newSelectedOptions[categoryId] = defaultOption.label
                }
              }
            })
            setSelectedOptions(newSelectedOptions)
            setOptionsInitialized(true)
          }
        }
      } catch (err: any) {
        console.error('[PROJECT DETAIL] Error fetching project:', err)
        const errorMessage = err?.message || 'Ошибка загрузки проекта'
        setError(errorMessage)
        
        // Если проект не найден - предлагаем вернуться в каталог
        if (err?.message?.includes('не найден') || err?.message?.includes('not found')) {
          setTimeout(() => {
            if (window.confirm('Проект не найден. Вернуться в каталог?')) {
              window.location.href = '/catalog'
            }
          }, 1000)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [projectId])

  // Загружаем опции проектов динамически (с автоматическим обновлением)
  // Используем только опции из проекта, без fallback на глобальные
  useEffect(() => {
    if (!project) return
    
    let mounted = true
    
    const loadOptions = () => {
      try {
        // Получаем текущие опции проекта (если есть)
        const projectCategories = project.specs?.optionCategories || {}
        
        // Формируем финальные опции: используем ТОЛЬКО опции из проекта
        const finalOptions: Record<string, { title: string; options: any[] }> = {}
        
        // Проверяем категории из проекта (новая структура)
        Object.entries(projectCategories).forEach(([categoryId, category]: [string, any]) => {
          if (category && typeof category === 'object' && category.title && Array.isArray(category.options) && category.options.length > 0) {
            finalOptions[categoryId] = {
              title: category.title,
              options: [...category.options]
            }
          }
        })
        
        // Для старых категорий (finishing, insulation и т.д.) проверяем, есть ли они в проекте
        const legacyCategories = ['finishing', 'insulation', 'floor', 'foundation']
        const legacyTitles: Record<string, string> = {
          finishing: 'Отделка',
          insulation: 'Утепление',
          floor: 'Пол',
          foundation: 'Фундамент'
        }
        
        legacyCategories.forEach(categoryId => {
          // Если категория уже есть в finalOptions, не перезаписываем
          if (finalOptions[categoryId]) return
          
          // Проверяем, есть ли опции в проекте (старая структура)
          const projectOptions = project.specs?.[categoryId]
          if (projectOptions && Array.isArray(projectOptions) && projectOptions.length > 0) {
            finalOptions[categoryId] = {
              title: legacyTitles[categoryId],
              options: [...projectOptions]
            }
          }
        })
        
        console.log('[PROJECT OPTIONS] Final options:', Object.keys(finalOptions))
        
        // Обновляем состояние ТОЛЬКО если есть опции из проекта
        if (Object.keys(finalOptions).length > 0) {
          setProjectOptions(finalOptions)
          
          // Устанавливаем значения по умолчанию ТОЛЬКО при первой загрузке
          if (!optionsInitialized) {
            const newSelectedOptions: Record<string, string> = {}
            Object.entries(finalOptions).forEach(([categoryId, category]) => {
              if (category.options && category.options.length > 0) {
                const defaultOption = category.options.find((opt: any) => opt.isDefault) || category.options[0]
                if (defaultOption) {
                  newSelectedOptions[categoryId] = defaultOption.label
                }
              }
            })
            setSelectedOptions(newSelectedOptions)
            setOptionsInitialized(true)
          }
        } else {
          // Если нет опций из проекта, скрываем блок
          setProjectOptions(null)
        }
      } catch (err) {
        if (mounted) {
          console.error('[PROJECT OPTIONS] Error loading options:', err)
        }
      }
    }
    
    // Загружаем сразу
    loadOptions()
    
    return () => {
      mounted = false
    }
  }, [project, optionsInitialized])
  
  // Отдельный эффект для принудительного обновления при изменении данных
  useEffect(() => {
    if (projectOptions && Object.keys(projectOptions).length > 0) {
      const categoryKeys = Object.keys(projectOptions)
      const dataHash = JSON.stringify(projectOptions)
      const hashCode = dataHash.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)
      console.log('[EFFECT] projectOptions changed. Categories:', categoryKeys, 'Hash:', hashCode)
      // Обновляем версию только один раз при изменении данных
      setOptionsVersion(hashCode)
    }
  }, [projectOptions])

  useEffect(() => {
    const loadSimilar = async () => {
      try {
        // Добавляем cache: 'no-store' чтобы всегда получать свежие данные
        const res = await fetch('/api/projects', { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        if (!res.ok) return
        const all = await res.json()
        const current = all.find((p: any) => p.id === projectId)
        const scored = all
          .filter((p: any) => p.id !== projectId)
          .map((p: any) => {
            let score = 0
            if (current) {
              if (p.material === current.material) score += 2
              if (p.region === current.region) score += 1
              if (p.floors === current.floors) score += 1
              const overlap = (p.tags || []).some((t: string) => (current.tags || []).includes(t))
              if (overlap) score += 1
              if (current.area && p.area) {
                const diff = Math.abs(p.area - current.area) / current.area
                if (diff <= 0.15) score += 1
              }
            }
            return { ...p, _score: score }
          })
          .filter((p: any) => p._score > 0)
          .sort((a: any, b: any) => b._score - a._score || (a.priceFrom ?? 0) - (b.priceFrom ?? 0))
          .slice(0, 6)
        setSimilar(scored)
      } catch {}
    }
    if (projectId) {
    loadSimilar()
    }
  }, [projectId])

  const formatPrice = (price: number) => {
    if (!price || typeof price !== 'number' || isNaN(price)) {
      console.warn('[PROJECT DETAIL] formatPrice: invalid price:', price)
      return '0 ₽'
    }
    // Показываем полную цену без округления
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽'
  }

  // Рассчитываем итоговую цену с учетом выбранных опций
  const calculateTotalPrice = () => {
    if (!project) return 0
    let total = project.priceFrom
    
    // Добавляем цену выбранной комплектации
    if (selectedCompletion && project.specs?.completionOptions) {
      const completion = project.specs.completionOptions.find((opt: any) => opt.label === selectedCompletion)
      if (completion) {
        total += completion.price
      }
    }
    
    // Добавляем цены выбранных дополнительных опций
    if (selectedAdditionalOptions.length > 0 && project.specs?.additionalOptions) {
      selectedAdditionalOptions.forEach((optLabel: string) => {
        const option = project.specs?.additionalOptions?.find((opt: any) => opt.label === optLabel)
        if (option) {
          total += option.price
        }
      })
    }
    
    // Добавляем цены выбранных опций конфигурации
    if (projectOptions) {
      Object.entries(projectOptions).forEach(([categoryId, category]) => {
        const selectedLabel = selectedOptions[categoryId]
        if (selectedLabel && category.options && Array.isArray(category.options)) {
          const option = category.options.find((opt: any) => opt.label === selectedLabel)
          if (option) {
            total += option.price
          }
        }
      })
    }
    
    return total
  }

  const handleWhatsApp = async () => {
    if (!project) return
    
    // Проверяем, что номер телефона введен
    const trimmedPhone = phone.trim()
    if (!trimmedPhone) {
      setSubmitStatus({ type: 'error', message: 'Пожалуйста, введите номер телефона' })
      setTimeout(() => setSubmitStatus(null), 3000)
      return
    }

    // Проверяем формат номера телефона (российский формат)
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
      const response = await fetch('/api/project-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: trimmedPhone,
          projectTitle: project.title,
          projectId: project.id,
          projectData: {
            area: project.area,
            region: project.region,
            priceFrom: project.priceFrom,
            priceTo: project.priceTo
          }
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitStatus({ type: 'success', message: 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.' })
        setTimeout(() => setSubmitStatus(null), 5000)
      } else {
        setSubmitStatus({ type: 'error', message: data.error || 'Ошибка отправки заявки. Попробуйте позже.' })
        setTimeout(() => setSubmitStatus(null), 5000)
      }
    } catch (error) {
      console.error('[PROJECT] Error submitting request:', error)
      setSubmitStatus({ type: 'error', message: 'Ошибка отправки заявки. Попробуйте позже.' })
      setTimeout(() => setSubmitStatus(null), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhone = () => {
    setIsCallbackModalOpen(true)
  }

  const { favorites, addFavorite, removeFavorite } = useFavoritesCompare() as any
  const isFavorite = favorites?.includes(projectId)

  const handleLike = async () => {
    if (!projectId) return
    try {
      if (isFavorite) {
        await removeFavorite(projectId)
      } else {
        await addFavorite(projectId)
      }
    } catch (e) {
      console.error('Favorite toggle failed', e)
    }
  }

  const handleCompare = () => {
    setIsInCompare(!isInCompare)
    // TODO: Реализовать добавление в сравнение через API
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D4E37] mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка проекта...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !project) {
    return (
      <>
        <Header />
        <main className="pt-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Проект не найден</h1>
            <p className="text-gray-600 mb-8">{error || 'Запрошенный проект не существует'}</p>
            <Link 
              href="/catalog"
              className="px-6 py-3 bg-[#5D4E37] hover:bg-[#6D5D4A] text-white font-semibold rounded-xl transition-colors duration-200"
            >
              Вернуться в каталог
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <CallbackModal isOpen={isCallbackModalOpen} onClose={() => setIsCallbackModalOpen(false)} />
      <main className="pt-16">
        {/* Hero секция с галереей */}
        <section className="bg-gray-50 py-6 sm:py-12">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
            {/* Хлебные крошки */}
            <nav className="mb-4 sm:mb-8" aria-label="Breadcrumb">
              <ol className="flex items-center flex-wrap space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600">
                <li><Link href="/" className="hover:text-gray-900">Главная</Link></li>
                <li className="text-gray-400">/</li>
                <li><Link href="/catalog" className="hover:text-gray-900">Каталог</Link></li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium truncate max-w-[120px] sm:max-w-none">{project.title}</li>
              </ol>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Галерея */}
              <div className="space-y-2 sm:space-y-4">
                <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={(() => {
                      // Всегда включаем главное фото первым в галерею
                      const allImages = [project.image, ...(project.images || [])].filter(Boolean)
                      return allImages[selectedImage] || project.image
                    })()}
                    alt={project.title}
                    fill
                    className="object-cover cursor-pointer"
                    onClick={() => setIsLightboxOpen(true)}
                    priority
                    quality={90}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-4">
                  {(() => {
                    // Всегда включаем главное фото первым, затем дополнительные
                    const allImages = [project.image, ...(project.images || [])].filter(Boolean)
                    return allImages
                  })().map((img, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                        selectedImage === index ? 'border-[#5D4E37] shadow-md' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${project.title} ${index + 1}`}
                        fill
                        className="object-cover"
                        loading="lazy"
                        quality={80}
                        sizes="(max-width: 1024px) 25vw, 12.5vw"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Информация о проекте */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">{project.title}</h1>
                
                {/* Теги */}
                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-[#5D4E37] text-white"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Характеристики */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 md:p-6 mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">Характеристики</h2>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Площадь</div>
                      <div className="text-lg font-semibold text-gray-900">{project.area} м²</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Тип строения</div>
                      <div className="text-lg font-semibold text-gray-900 capitalize">{project.material}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Срок постройки</div>
                      <div className="text-lg font-semibold text-gray-900">{project.buildTime} дней</div>
                    </div>
                  </div>
                </div>

                {/* Комплектации (если есть) */}
                {project.specs?.completionOptions && project.specs.completionOptions.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 md:p-6 mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-gray-900">Комплектация</h2>
                    <div className="space-y-3">
                      {project.specs.completionOptions.map((opt: any, idx: number) => {
                        if (!opt || typeof opt !== 'object' || Array.isArray(opt)) {
                          return null
                        }
                        const label = String(opt.label || '')
                        const price = typeof opt.price === 'number' && !isNaN(opt.price) ? opt.price : 0
                        const isSelected = selectedCompletion === label
                        return (
                          <label key={idx} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="completion"
                              className="w-5 h-5 text-[#5D4E37] focus:ring-[#5D4E37]"
                              checked={isSelected}
                              onChange={() => setSelectedCompletion(label)}
                            />
                            <span className="ml-2 sm:ml-3 text-gray-900 flex-1 text-sm sm:text-base">{label}</span>
                            <span className="text-base sm:text-lg font-semibold text-gray-900 whitespace-nowrap">
                              {price > 0 ? `+${formatPrice(price)}` : 'Включено'}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Дополнительные опции (если есть) */}
                {project.specs?.additionalOptions && project.specs.additionalOptions.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 md:p-6 mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-gray-900">Дополнительные опции</h2>
                    <div className="space-y-3">
                      {project.specs.additionalOptions.map((opt: any, idx: number) => {
                        if (!opt || typeof opt !== 'object' || Array.isArray(opt)) {
                          return null
                        }
                        const label = String(opt.label || '')
                        const price = typeof opt.price === 'number' && !isNaN(opt.price) ? opt.price : 0
                        const isChecked = selectedAdditionalOptions.includes(label)
                        return (
                          <label key={idx} className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-5 h-5 text-[#5D4E37] focus:ring-[#5D4E37] rounded border-gray-300"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAdditionalOptions([...selectedAdditionalOptions, label])
                                } else {
                                  setSelectedAdditionalOptions(selectedAdditionalOptions.filter((l: string) => l !== label))
                                }
                              }}
                            />
                            <span className="ml-2 sm:ml-3 text-gray-900 flex-1 text-sm sm:text-base">{label}</span>
                            <span className="text-base sm:text-lg font-semibold text-gray-900 whitespace-nowrap">
                              +{formatPrice(price)}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Итоговая цена */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 md:p-6 mb-3 sm:mb-4">
                  <div className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">Цена</div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                    {formatPrice(calculateTotalPrice())}
                  </div>
                </div>

                {/* Статус отправки */}
                {submitStatus && (
                  <div className={`mb-4 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${submitStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {submitStatus.message}
                  </div>
                )}
                
                {/* Поле для ввода номера телефона */}
                <div className="mb-4">
                  <label htmlFor="project-phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Ваш номер телефона *
                  </label>
                  <input
                    type="tel"
                    id="project-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D4E37] focus:border-transparent transition-colors duration-200"
                    placeholder="+7 (___) ___-__-__"
                  />
                </div>
                
                {/* Кнопки действий */}
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                  <button 
                    onClick={handleWhatsApp}
                    disabled={isSubmitting || !phone.trim()}
                    className="block w-full px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 bg-white border-2 border-gray-300 text-gray-900 hover:bg-[#5D4E37] hover:border-[#5D4E37] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-xl text-sm sm:text-base md:text-lg text-center transition-colors duration-200"
                  >
                    {isSubmitting ? 'Отправка...' : 'Заказать'}
                  </button>
                  <div className="flex gap-2 sm:gap-3 md:gap-4">
                    <button
                      onClick={handlePhone}
                      className="flex-1 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border-2 border-[#5D4E37] text-[#5D4E37] font-semibold rounded-xl text-sm sm:text-base"
                    >
                      Заказать звонок
                    </button>
                  </div>
                  <div className="flex gap-2 sm:gap-3 md:gap-4">
                    <button
                      onClick={handleLike}
                      className="flex-1 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition-colors duration-200 text-xs sm:text-sm md:text-base"
                    >
                      <svg
                        className={`w-5 h-5 ${isFavorite ? 'fill-[#5D4E37]' : 'fill-none'}`}
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      {isFavorite ? 'В избранном' : 'В избранное'}
                    </button>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Описание */}
        {project.description && (
          <section className="py-4 sm:py-6 md:py-8 bg-white">
            <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Описание</h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">{project.description}</p>
            </div>
          </section>
        )}

        {/* Технические характеристики */}
        {project.technicalSpecs && (
          <section className="py-4 sm:py-6 md:py-8 bg-gray-50">
            <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">Технические характеристики</h2>
              <div className="p-1 sm:p-1.5 md:p-2">
                <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">{project.technicalSpecs}</p>
              </div>
            </div>
          </section>
        )}

        {/* Преимущества */}
        {project.advantages && project.advantages.length > 0 && (
          <section className="py-4 sm:py-6 md:py-8 bg-gray-50">
            <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">Преимущества проекта</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {project.advantages.map((advantage, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-[#5D4E37] text-white rounded-full flex items-center justify-center font-semibold text-sm sm:text-base">
                        {index + 1}
                      </div>
                      <p className="text-sm sm:text-base md:text-lg text-gray-900 pt-0.5 sm:pt-1">{advantage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Блок выбора опций конфигурации */}
        {projectOptions && Object.keys(projectOptions).length > 0 && (
        <section id="project-options-block" className="py-4 sm:py-6 md:py-8 bg-white" key={`section-options-v${optionsVersion}`}>
          <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Дополнительные опции</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Выберите дополнительные опции для вашего проекта</p>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 md:p-6" key={`options-v${optionsVersion}`}>
              {/* Рендерим категории динамически */}
              {Object.entries(projectOptions).map(([categoryId, category]) => (
                <div key={categoryId} className="mb-3 sm:mb-4 md:mb-5">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">{category.title}</h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    {category.options && category.options.length > 0 ? (
                      category.options.map((opt: any) => (
                        <label key={opt.id || opt.label} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`option-${categoryId}`}
                            className="w-4 h-4 sm:w-5 sm:h-5 text-[#5D4E37] focus:ring-[#5D4E37]"
                            checked={selectedOptions[categoryId] === opt.label}
                            onChange={() => setSelectedOptions(prev => ({ ...prev, [categoryId]: opt.label }))}
                          />
                          <span className="ml-2 sm:ml-3 text-gray-900 flex-1 text-sm sm:text-base">{opt.label}</span>
                          <span className="text-base sm:text-lg font-semibold text-gray-900 whitespace-nowrap">
                            {opt.price > 0 ? `+${formatPrice(opt.price)}` : '0'}
                          </span>
                        </label>
                      ))
                    ) : (
                      <div className="text-xs sm:text-sm text-gray-500 italic">Нет доступных опций</div>
                    )}
                  </div>
                </div>
              ))}

              {/* Итог перед кнопками */}
              <div className="mt-4 sm:mt-6 md:mt-8 pt-4 sm:pt-5 md:pt-6 border-t border-gray-200">
                <div className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">Итого</div>
                <div className="text-2xl sm:text-3xl font-bold text-[#5D4E37]">
                  {formatPrice(calculateTotalPrice())}
                </div>
              </div>

              {/* Статус отправки */}
              {submitStatus && (
                <div className={`mb-4 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${submitStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {submitStatus.message}
                </div>
              )}
              
              {/* Поле для ввода номера телефона */}
              <div className="mb-4">
                <label htmlFor="project-phone-options" className="block text-sm font-medium text-gray-700 mb-2">
                  Ваш номер телефона *
                </label>
                <input
                  type="tel"
                  id="project-phone-options"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D4E37] focus:border-transparent transition-colors duration-200"
                  placeholder="+7 (___) ___-__-__"
                />
              </div>
              
              {/* Кнопки */}
              <div className="space-y-2 sm:space-y-3 md:space-y-4 pt-3 sm:pt-4">
                <button 
                  onClick={handleWhatsApp}
                  disabled={isSubmitting || !phone.trim()}
                  className="block w-full px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 bg-white border-2 border-gray-300 text-gray-900 hover:bg-[#5D4E37] hover:border-[#5D4E37] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-xl text-sm sm:text-base md:text-lg text-center transition-colors duration-200"
                >
                  {isSubmitting ? 'Отправка...' : 'Заказать'}
                </button>
                <button
                  onClick={handlePhone}
                  className="block w-full px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border-2 border-[#5D4E37] text-[#5D4E37] hover:bg-[#5D4E37] hover:text-white font-semibold rounded-xl text-sm sm:text-base md:text-lg transition-colors duration-200"
                >
                  Заказать звонок
                </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA секция */}
        <section className="py-6 sm:py-8 md:py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900">Заинтересовал проект?</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4 sm:mb-6">Свяжитесь с нами для консультации</p>
            {submitStatus && (
              <div className={`mb-4 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${submitStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {submitStatus.message}
              </div>
            )}
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label htmlFor="project-phone-cta" className="block text-sm font-medium text-gray-700 mb-2">
                  Ваш номер телефона *
                </label>
                <input
                  type="tel"
                  id="project-phone-cta"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D4E37] focus:border-transparent transition-colors duration-200"
                  placeholder="+7 (___) ___-__-__"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button 
                  onClick={handlePhone}
                  className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white border-2 border-gray-300 text-gray-900 hover:bg-[#5D4E37] hover:border-[#5D4E37] hover:text-white font-semibold rounded-xl text-sm sm:text-base md:text-lg transition-colors duration-200"
                >
                  Заказать звонок
                </button>
                <button 
                  onClick={handleWhatsApp}
                  disabled={isSubmitting || !phone.trim()}
                  className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 border-2 border-gray-300 text-gray-900 hover:bg-[#5D4E37] hover:border-[#5D4E37] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-xl text-sm sm:text-base md:text-lg transition-colors duration-200"
                >
                  {isSubmitting ? 'Отправка...' : 'Заказать'}
                </button>
              </div>
            </div>
          </div>
        </section>
        {/* Похожие проекты */}
        {similar.length > 0 && (
          <section className="py-4 sm:py-6 md:py-8 bg-white">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
              <div className="mb-4 sm:mb-6 text-center">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">Похожие проекты</h2>
                <p className="text-sm sm:text-base text-gray-600">Вам также может подойти</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {similar.map((p: any) => (
                  <a key={p.id} href={`/project/${p.id}`} className="group rounded-xl border border-gray-200 overflow-hidden bg-white hover:shadow-md transition-shadow">
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {(p.tags?.slice(0,1) || []).map((tag: string, i: number) => (
                        <span key={i} className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-black/60 text-white">{tag}</span>
                      ))}
                    </div>
                    <div className="p-3 sm:p-4 md:p-5">
                      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2">
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 line-clamp-2 flex-1">{p.title}</h3>
                        <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap ml-2">{p.area} м²</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm sm:text-base text-[#5D4E37] font-bold">
                          {`от ${new Intl.NumberFormat('ru-RU').format(p.priceFrom)} ₽`}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">{p.material}</div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
