'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

interface House {
  id: string
  title: string
  area: number
  price: number
  floors: number
  material: 'каркасный' | 'SIP' | 'комбинированный'
  completion: 'под ключ' | 'тёплый контур' | 'коробка'
  buildTime: number
  region: string
  image: string
  tags: string[]
  hasTerrasse?: boolean
  hasBath?: boolean
  hasGarage?: boolean
  features?: string[]
}

interface CatalogHouseCardProps {
  house: House
  onFavoriteClick?: (houseId: string) => void
  requireAuth?: () => void
  isFavorite?: boolean
  priority?: boolean
}

export default function CatalogHouseCard({ 
  house, 
  onFavoriteClick,
  requireAuth,
  isFavorite = false,
  priority = false
}: CatalogHouseCardProps) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role && ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return (price / 1000000).toFixed(1) + ' млн ₽'
    } else if (price >= 1000) {
      return (price / 1000).toFixed(0) + ' тыс ₽'
    } else {
      return new Intl.NumberFormat('ru-RU').format(price) + ' ₽'
    }
  }

  const getFloorText = (floors: number) => {
    if (floors === 1) return '1 этаж'
    if (floors === 1.5) return '1.5 этажа'
    if (floors === 2) return '2 этажа'
    return `${floors} этажа`
  }

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!onFavoriteClick) {
      requireAuth?.()
      return
    }
    
    onFavoriteClick(house.id)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Удаленные проекты не должны попадать в список вообще
    // Если проект в списке - значит он существует
    // Переход происходит автоматически через Link
  }

  return (
    <Link 
      href={`/project/${house.id}`}
      onClick={handleCardClick}
      className="group block focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 bg-transparent"
    >
      <div className="relative bg-transparent h-full flex flex-col">
        {/* Изображение */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 rounded-xl group/image">
          <Image
            src={house.image}
            alt={house.title}
            fill
            className="object-cover rounded-xl transition-transform duration-500 group-hover/image:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading={priority ? undefined : "lazy"}
            priority={priority}
            quality={85}
          />

          {/* Теги */}
          {house.tags.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-1">
              {house.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs font-medium rounded-md border border-white bg-black/30 backdrop-blur-sm text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Иконка лайка и кнопка редактирования (для админов) */}
          <div className="absolute top-3 right-3 flex gap-2">
            {/* Кнопка редактирования для админов */}
            {isAdmin && (
              <Link
                href={`/admin/projects/${house.id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-2 bg-blue-500/90 backdrop-blur-sm rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Редактировать проект"
                title="Редактировать проект"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </Link>
            )}
            {/* Иконка лайка */}
            <button
              onClick={handleLike}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full focus:outline-none focus:ring-2 focus:ring-black"
              aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
            >
              <svg
                className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'fill-none'}`}
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
            </button>
          </div>
        </div>

        {/* Контент */}
        <div className="p-4 md:p-6 flex-grow flex flex-col bg-transparent">
          {/* Заголовок и характеристики */}
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 line-clamp-2">
              {house.title}
            </h3>
            <div className="text-sm text-gray-500 mb-2">
              {house.area} м²
            </div>
          </div>

          {/* Тип строения */}
          <div className="text-sm text-gray-500 mb-2 capitalize">
            {house.material}
          </div>

          {/* Цена */}
          <div className="mt-auto">
            <div className="text-xl md:text-2xl font-bold text-gray-900">
              {formatPrice(house.price)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}