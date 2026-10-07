'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface HeroConfig {
  heroImage: string
  title: string
  subtitle: string
}

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const rafRef = useRef<number | null>(null)
  const [heroConfig, setHeroConfig] = useState<HeroConfig>({
    heroImage: '/images/house.jpg',
    title: 'Ваш каркасный дом мечты',
    subtitle: 'Под ключ. Быстро. Надёжно. С гарантией качества.'
  })

  // Загружаем конфигурацию Hero-блока
  useEffect(() => {
    const loadHeroConfig = async () => {
      try {
        const res = await fetch('/api/hero', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setHeroConfig(data)
        }
      } catch (error) {
        console.error('Error loading hero config:', error)
      }
    }
    loadHeroConfig()
  }, [])

  useEffect(() => {
    // Небольшая задержка для плавного появления контента
    setTimeout(() => setIsLoaded(true), 100)
  }, [])

  useEffect(() => {
    const hero = document.getElementById('hero-section')
    if (!hero) return

    let mouseX = 0
    let mouseY = 0

    const handleScroll = () => {
      // Используем requestAnimationFrame для плавности
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      
      rafRef.current = requestAnimationFrame(() => {
        const scrolled = window.scrollY
        // Максимально усиленный параллакс - множитель увеличен еще в 2 раза
        hero.style.setProperty('--parallax', `${Math.min(scrolled * 0.36, 120)}px`)
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!hero) return
      
      const rect = hero.getBoundingClientRect()
      // Нормализуем координаты от -1 до 1
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2
      
      // Тонкий 3D параллакс - минимальное смещение и поворот
      const parallaxX = mouseX * 15 // 15px максимальное смещение
      const parallaxY = mouseY * 15
      
      // 3D поворот для глубины (в градусах) - очень тонкий эффект
      const rotateY = mouseX * 2  // до 2 градусов поворота по Y
      const rotateX = mouseY * -1.5 // до 1.5 градусов поворота по X (отрицательный для интуитивного движения)
      
      hero.style.setProperty('--mouse-parallax-x', `${parallaxX}px`)
      hero.style.setProperty('--mouse-parallax-y', `${parallaxY}px`)
      hero.style.setProperty('--mouse-rotate-y', `${rotateY}deg`)
      hero.style.setProperty('--mouse-rotate-x', `${rotateX}deg`)
    }
    
    // Начальное значение при загрузке
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    hero.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      hero.removeEventListener('mousemove', handleMouseMove)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  return (
    <section id="hero-section" className="relative h-screen w-full overflow-hidden" style={{ ['--parallax' as any]: '0px', ['--mouse-parallax-x' as any]: '0px', ['--mouse-parallax-y' as any]: '0px', ['--mouse-rotate-y' as any]: '0deg', ['--mouse-rotate-x' as any]: '0deg' }}>
      {/* Фоновое изображение */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            transform: 'translate(calc(var(--mouse-parallax-x, 0px)), calc(var(--parallax) + var(--mouse-parallax-y, 0px))) scale(1.2) rotateY(var(--mouse-rotate-y, 0deg)) rotateX(var(--mouse-rotate-x, 0deg))',
            transformStyle: 'preserve-3d',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            perspective: '1000px',
            transition: 'transform 0.15s ease-out'
          }}
        >
          <Image
            src={heroConfig.heroImage || '/images/house.jpg'}
            alt="Каркасный дом"
            fill
            priority
            quality={85}
            className="object-cover"
            sizes="100vw"
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        {/* Тёмный фильтр для читаемости */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Контент */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div 
          className={isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          style={{ 
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
            willChange: 'opacity, transform',
            backfaceVisibility: 'hidden'
          }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-6 leading-tight font-inter">
            {heroConfig.title ? (
              <span className="block">{heroConfig.title}</span>
            ) : (
              <>
            <span className="block">Ваш каркасный</span>
            <span className="block">дом мечты</span>
              </>
            )}
          </h1>
        </div>

        {/* Подзаголовок */}
        <div 
          className={isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          style={{ 
            transition: 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s',
            willChange: 'opacity, transform',
            backfaceVisibility: 'hidden'
          }}
        >
          <p className="text-lg sm:text-xl md:text-2xl text-white mb-12 max-w-4xl font-lora italic">
            {heroConfig.subtitle || 'Под ключ. Быстро. Надёжно. С гарантией качества.'}
          </p>
        </div>

        {/* Кнопки CTA */}
        <div 
          className={isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          style={{ 
            transition: 'opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s',
            willChange: 'opacity, transform',
            backfaceVisibility: 'hidden'
          }}
        >
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Основная кнопка - статичная без анимации прыжка */}
            <a 
              href="#calculator"
              className="group relative px-8 py-4 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl inline-block text-center"
              style={{ 
                backgroundColor: '#5D4E37',
                willChange: 'transform',
                backfaceVisibility: 'hidden'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6D5D4A'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5D4E37'}
            >
              <span className="relative z-10">Рассчитать стоимость</span>
            </a>

            {/* Второстепенная кнопка с сильным стеклянным blur эффектом */}
            <a 
              href="/catalog"
              className="group relative px-8 py-4 border-2 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 inline-block text-center"
              style={{ 
                borderColor: 'rgba(255, 255, 255, 0.4)',
                color: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                willChange: 'transform',
                backfaceVisibility: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#6B8E6B'
                e.currentTarget.style.color = 'white'
                e.currentTarget.style.borderColor = '#6B8E6B'
                e.currentTarget.style.backdropFilter = 'blur(30px) saturate(200%)'
                e.currentTarget.style.webkitBackdropFilter = 'blur(30px) saturate(200%)'
                e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                e.currentTarget.style.backdropFilter = 'blur(24px) saturate(180%)'
                e.currentTarget.style.webkitBackdropFilter = 'blur(24px) saturate(180%)'
                e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
              }}
            >
              <span className="relative z-10">Смотреть проекты</span>
            </a>
          </div>
        </div>
      </div>

      {/* Анимированная стрелка скролла */}
      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        style={{
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(32px)',
          transition: 'opacity 0.8s ease-out 0.6s, transform 0.8s ease-out 0.6s',
          willChange: 'opacity, transform',
          backfaceVisibility: 'hidden'
        }}
      >
        <div className="animate-bounce">
          <svg 
            className="w-6 h-6 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
        </div>
      </div>
    </section>
  )
}