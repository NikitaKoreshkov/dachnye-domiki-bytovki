'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Review {
  id: string
  name: string
  city: string
  date: string
  text: string
  rating: number
  image: string
  videoUrl?: string
}


interface ReviewsConfig {
  title: string
  description: string
}

export default function ReviewsGallery() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentReview, setCurrentReview] = useState(0)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [reviewsData, setReviewsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<ReviewsConfig>({
    title: 'Реальные фото и отзывы наших клиентов',
    description: 'Мы собрали часть отзывов — чтобы вы могли увидеть, как строим дома на практике.\n\nОстальные отзывы можно посмотреть по запросу или в наших соцсетях.'
  })

  // Загружаем конфигурацию текста блока отзывов
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/reviews-config', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setConfig({
            title: data.title || 'Реальные фото и отзывы наших клиентов',
            description: data.description || 'Мы собрали часть отзывов — чтобы вы могли увидеть, как строим дома на практике.\n\nОстальные отзывы можно посмотреть по запросу или в наших соцсетях.'
          })
        }
      } catch (error) {
        console.error('Error loading reviews config:', error)
      }
    }
    loadConfig()
  }, [])

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Добавляем timestamp для предотвращения кэширования
        const timestamp = new Date().getTime()
        const res = await fetch(`/api/reviews?t=${timestamp}`, { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })
        if (res.ok) {
          const data = await res.json()
          console.log('[REVIEWS] Loaded data from API:', data.length, 'reviews')
          const formatted = data.map((r: any) => {
            const imageUrl = r.image || '/images/house.jpg'
            return {
              id: r.id,
              name: r.name,
              city: r.city,
              date: r.date ? new Date(r.date).toLocaleDateString('ru-RU') : r.date,
              text: r.text,
              rating: 5,
              image: imageUrl
            }
          })
          setReviewsData(formatted)
          console.log('[REVIEWS] Formatted reviews:', formatted.length)
        } else {
          console.error('[REVIEWS] Failed to load:', res.status)
        }
      } catch (error) {
        console.error('[REVIEWS] Error loading reviews:', error)
      } finally {
        setLoading(false)
      }
    }
    
    // Загружаем сразу
    fetchReviews()
    
    // Перезагружаем данные каждые 5 секунд для более быстрого обновления
    const interval = setInterval(() => {
      console.log('[REVIEWS] Auto-refreshing reviews...')
      fetchReviews()
    }, 5000)
    
    // Перезагружаем при возврате фокуса на страницу
    const handleFocus = () => {
      console.log('[REVIEWS] Page focused, reloading reviews...')
      fetchReviews()
    }
    window.addEventListener('focus', handleFocus)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
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

    const element = document.getElementById('reviews-gallery')
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [])

  // Автоматическое переключение отзывов
  useEffect(() => {
    if (reviewsData.length === 0) return
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentReview((prev) => (prev + 1) % reviewsData.length)
        setIsTransitioning(false)
      }, 300)
    }, 5000)

    return () => clearInterval(interval)
  }, [reviewsData.length])

  const handleReviewRead = (reviewId: string) => {
    console.log('Review read:', reviewId)
  }

  const handleVideoPlay = (videoId: string) => {
    console.log('Video played:', videoId)
    setIsVideoModalOpen(true)
  }

  if (loading) {
    return (
      <section id="reviews-gallery" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D4E37] mx-auto"></div>
        </div>
      </section>
    )
  }

  if (reviewsData.length === 0) return null

  const nextReview = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentReview((prev) => (prev + 1) % reviewsData.length)
      setIsTransitioning(false)
    }, 300)
  }

  const prevReview = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentReview((prev) => (prev - 1 + reviewsData.length) % reviewsData.length)
      setIsTransitioning(false)
    }, 300)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${
          index < rating ? 'text-[#A67C52]' : 'text-gray-300'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  return (
    <section id="reviews-gallery" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {config.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto whitespace-pre-line">
            {config.description}
          </p>
        </div>

        {/* Карусель отзывов */}
        <div className={`transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Фото */}
              <div className="relative h-96 lg:h-auto lg:min-h-[400px] overflow-hidden group bg-gray-200">
                {reviewsData[currentReview]?.image && (
                  <div 
                    key={`image-${currentReview}`}
                    className={`absolute inset-0 transition-all duration-500 ${
                      isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                    }`}
                  >
                    {reviewsData[currentReview].image.startsWith('/uploads/') ? (
                      <img
                        src={reviewsData[currentReview].image}
                        alt={`Дом клиента ${reviewsData[currentReview].name}`}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          console.error('Image load error:', reviewsData[currentReview].image)
                          (e.target as HTMLImageElement).src = '/images/house.jpg'
                        }}
                      />
                    ) : (
                      <Image
                        src={reviewsData[currentReview].image}
                        alt={`Дом клиента ${reviewsData[currentReview].name}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        quality={85}
                        onError={(e) => {
                          console.error('Image load error:', reviewsData[currentReview].image)
                        }}
                      />
                    )}
                  </div>
                )}
                
                {/* Кнопка видео (если есть) */}
                {reviewsData[currentReview].videoUrl && (
                  <button
                    onClick={() => handleVideoPlay(reviewsData[currentReview].id)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors duration-200"
                  >
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#5D4E37] ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </button>
                )}

                {/* Навигация */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={prevReview}
                    className="w-10 h-10 bg-white/90 hover:bg-white text-gray-700 rounded-full flex items-center justify-center transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextReview}
                    className="w-10 h-10 bg-white/90 hover:bg-white text-gray-700 rounded-full flex items-center justify-center transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Отзыв */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div 
                  key={`content-${currentReview}`}
                  className={`transition-all duration-500 ${
                    isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
                  }`}
                >
                  <div className="mb-6">
                    <div className="flex items-center mb-4">
                      {renderStars(reviewsData[currentReview].rating)}
                    </div>
                    <blockquote className="text-lg text-gray-700 leading-relaxed mb-6">
                      "{reviewsData[currentReview].text}"
                    </blockquote>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">
                          {reviewsData[currentReview].name}
                        </h4>
                        <p className="text-gray-600">
                          {reviewsData[currentReview].city} • {reviewsData[currentReview].date}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#5D4E37]">
                          {reviewsData[currentReview].rating}/5
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Индикаторы */}
          <div className="flex justify-center mt-8 space-x-2">
            {reviewsData.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsTransitioning(true)
                  setTimeout(() => {
                    setCurrentReview(index)
                    setIsTransitioning(false)
                  }, 300)
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentReview ? 'bg-[#5D4E37] w-8' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Модальное окно для видео */}
        {isVideoModalOpen && reviewsData[currentReview].videoUrl && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-4xl">
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors duration-200"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <p className="text-white">Видео отзыв будет здесь</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
