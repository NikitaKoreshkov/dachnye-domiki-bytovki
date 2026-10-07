'use client'

import { useState, useEffect } from 'react'
import ProjectCard from './ProjectCard'
import { useFavoritesCompare } from '@/components/providers/FavoritesCompareProvider';

interface Project {
  id: string
  title: string
  area: number
  priceFrom: number
  priceTo?: number
  buildTime: number
  material: string
  image: string
  images?: string[]
  tags: string[]
  region: string
  floors?: number
  completion?: string
  hasTerrasse?: boolean
  hasBath?: boolean
  hasGarage?: boolean
  features?: string[]
  description?: string
  advantages?: string[]
  specs?: any
}

export default function ProjectsCatalog() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [visibleProjects, setVisibleProjects] = useState(6)
  const [loading, setLoading] = useState(true)
  const { favorites, addFavorite, removeFavorite } = useFavoritesCompare();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // СНАЧАЛА загружаем ВСЕ проекты для получения актуальных данных
        const allProjectsResponse = await fetch('/api/projects?' + Date.now(), { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        
        if (!allProjectsResponse.ok) {
          throw new Error('Failed to load projects')
        }
        
        const allProjectsData = await allProjectsResponse.json()
        
        // Затем загружаем информацию о популярных проектах
        const popularResponse = await fetch('/api/popular?' + Date.now(), { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        
        if (popularResponse.ok) {
          const panels = await popularResponse.json()
          console.log('[PROJECTS CATALOG] Received panels from API:', panels.length)
          // Проверяем все панели на наличие элементов
          const allItems = panels.flatMap((panel: any) => panel.items || [])
          console.log('[PROJECTS CATALOG] Total items from all panels:', allItems.length)
          
          if (allItems.length > 0) {
            // Используем данные из PopularItem (они могут быть кастомными), 
            // но если projectSlug есть - подтягиваем недостающие данные из основного проекта
            const popularProjectsWithMergedData = panels
              .flatMap((panel: any) => panel.items || [])
              .map((item: any) => {
                // Генерируем slug для популярного проекта
                const generateSlug = (title: string, itemId: string) => {
                  const baseSlug = title
                    .toLowerCase()
                    .replace(/[^a-zа-яё0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '')
                    .substring(0, 50)
                  return `${baseSlug}-${itemId.substring(0, 8)}`
                }
                
                // Если есть связь с основным проектом - подтягиваем данные
                if (item.projectSlug) {
                  const realProject = allProjectsData.find((p: any) => p.id === item.projectSlug)
                  if (realProject) {
                    // Используем кастомные данные из PopularItem (если есть), недостающие - из основного проекта
                    return {
                      id: item.projectSlug, // Используем slug реального проекта
                      title: item.title || realProject.title,
                      area: item.area || realProject.area,
                      priceFrom: item.priceFrom || realProject.priceFrom,
                      priceTo: item.priceTo ?? realProject.priceTo,
                      buildTime: item.buildTime ?? realProject.buildTime ?? 0,
                      material: item.material || realProject.material,
                      image: item.image || realProject.image,
                      images: item.images || realProject.images || [],
                      tags: item.tags || realProject.tags || [],
                      region: item.region || realProject.region || '',
                      floors: item.floors ?? realProject.floors ?? 1,
                      completion: item.completion || realProject.completion || 'под ключ',
                      hasTerrasse: item.hasTerrasse ?? realProject.hasTerrasse ?? false,
                      hasBath: item.hasBath ?? realProject.hasBath ?? false,
                      hasGarage: item.hasGarage ?? realProject.hasGarage ?? false,
                      features: item.features || realProject.features || [],
                      description: item.description || realProject.description,
                      advantages: item.advantages || realProject.advantages || [],
                      specs: item.specs || realProject.specs
                    }
                  }
                  // Если projectSlug есть, но проект не найден - используем данные из PopularItem и генерируем slug
                }
                // Если нет связи с основным проектом - используем только данные из PopularItem
                const projectSlug = item.slug || generateSlug(item.title, item.id)
                return {
                  id: projectSlug,
                  title: item.title,
                  area: item.area,
                  priceFrom: item.priceFrom,
                  priceTo: item.priceTo || null,
                  buildTime: item.buildTime ?? 0,
                  material: item.material,
                  image: item.image,
                  images: item.images || [],
                  tags: item.tags || [],
                  region: item.region || '',
                  floors: item.floors ?? 1,
                  completion: item.completion || 'под ключ',
                  hasTerrasse: item.hasTerrasse ?? false,
                  hasBath: item.hasBath ?? false,
                  hasGarage: item.hasGarage ?? false,
                  features: item.features || [],
                  description: item.description,
                  advantages: item.advantages || [],
                  specs: item.specs
                }
              })
              .filter(Boolean) // Убираем null
            
            console.log('[PROJECTS CATALOG] Items after processing:', popularProjectsWithMergedData.length, 'of', allItems.length, 'total')
            
            if (popularProjectsWithMergedData.length > 0) {
              console.log('[PROJECTS CATALOG] Loaded popular projects (with custom data from DB):', popularProjectsWithMergedData.length)
              setProjects(popularProjectsWithMergedData)
              // Устанавливаем visibleProjects равным количеству загруженных проектов, чтобы все отображались
              setVisibleProjects(popularProjectsWithMergedData.length)
              setLoading(false)
              return
            }
          }
        }
        
        // Fallback: если популярных нет, берем первые 6 проектов
        setProjects(allProjectsData.slice(0, 6))
      } catch (error) {
        console.error('Error loading projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
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

    const element = document.getElementById('projects-catalog')
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [])

  const handleLike = (id: string) => {
    if (favorites.includes(id)) {
      removeFavorite(id);
    } else {
      addFavorite(id);
    }
  }

  const requireAuth = () => {
    console.log('Auth required for likes')
    // TODO: Show auth modal
  }

  const loadMoreProjects = () => {
    setVisibleProjects(prev => Math.min(prev + 6, projects.length))
  }

  return (
    <section id="projects-catalog" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Популярные проекты
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Проверенные и готовые решения для любых участков
          </p>
        </div>

        {/* Сетка проектов */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D4E37] mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка проектов...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {projects.slice(0, visibleProjects).map((project, index) => (
            <div
              key={project.id}
              className={`transition-all duration-500 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              {/* Обертка для популярных проектов с закруглением и границей */}
              <div className="rounded-xl border-2 border-gray-200 overflow-hidden bg-transparent hover:border-gray-300 transition-all duration-200">
                <ProjectCard
                  {...project}
                  onLike={handleLike}
                  isLiked={favorites.includes(project.id)}
                  requireAuth={requireAuth}
                />
              </div>
            </div>
            ))}
          </div>
        )}

        {/* Кнопки управления */}
        <div className="text-center space-y-4">
          {/* Кнопка "Посмотреть весь каталог" */}
          <div>
            <a 
              href="/catalog"
              className="inline-flex items-center px-6 py-3 bg-white border-2 border-[#5D4E37] text-[#5D4E37] hover:bg-[#5D4E37] hover:text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>Посмотреть весь каталог</span>
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
