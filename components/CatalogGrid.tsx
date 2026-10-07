'use client'

import { useState, useEffect } from 'react'
import CatalogHouseCard from './CatalogHouseCard'
import { useFavoritesCompare } from '@/components/providers/FavoritesCompareProvider';

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

interface CatalogGridProps {
  houses: House[]
  isLoading: boolean
  onLoadMore: () => void
  hasMore: boolean
  isFiltersVisible: boolean
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse h-full flex flex-col">
      {/* Skeleton изображения */}
      <div className="aspect-[4/3] bg-gray-200"></div>
      
      {/* Skeleton контента */}
      <div className="p-6 space-y-6 flex-grow flex flex-col">
        {/* Заголовок */}
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-5 bg-gray-200 rounded w-2/3"></div>
        </div>
        
        {/* Цена */}
        <div className="flex justify-between mb-4">
          <div>
            <div className="h-4 bg-gray-200 rounded w-8 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
        
        {/* Доп информация */}
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-6"></div>
        
        {/* Кнопки */}
        <div className="flex gap-4 mt-auto">
          <div className="flex-1 h-14 bg-gray-200 rounded-xl"></div>
          <div className="flex-1 h-14 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  )
}

export default function CatalogGrid({
  houses,
  isLoading,
  onLoadMore,
  hasMore,
  isFiltersVisible,
}: CatalogGridProps) {
  const { favorites, addFavorite, removeFavorite } = useFavoritesCompare();

  const handleFavoriteToggle = async (id:string) => {
    if (favorites.includes(id)) {
      await removeFavorite(id);
    } else {
      await addFavorite(id);
    }
  };

  const gridCols = isFiltersVisible 
    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className="flex-1 min-h-0">
      {/* Результаты поиска */}
      {houses.length === 0 && !isLoading ? (
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ничего не найдено
          </h3>
          <p className="text-gray-600">
            Попробуйте изменить параметры поиска или фильтры
          </p>
        </div>
      ) : (
        <>
          {/* Сетка домов */}
          <div className={`grid ${gridCols} gap-4 sm:gap-6 lg:gap-8 auto-rows-fr`}>
            {houses.map((house, index) => (
              <div
                key={house.id}
                className="transition-all duration-300 h-full"
                style={{ 
                  animation: `fadeInUp 0.6s ease-out ${index * 50}ms forwards`
                }}
              >
                <CatalogHouseCard
                  house={house}
                  onFavoriteClick={() => handleFavoriteToggle(house.id)}
                  isFavorite={favorites.includes(house.id)}
                  priority={index < 3}
                />
              </div>
            ))}
            
            {/* Skeleton cards при загрузке */}
            {isLoading && (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="h-full">
                    <SkeletonCard />
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Кнопка "Загрузить еще" */}
          {hasMore && !isLoading && (
            <div className="text-center mt-12">
              <button
                onClick={onLoadMore}
                className="px-8 py-3 bg-white border-2 border-[#5D4E37] text-[#5D4E37] hover:bg-[#5D4E37] hover:text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Загрузить ещё проекты
              </button>
            </div>
          )}

          {/* Лоадер */}
          {isLoading && houses.length > 0 && (
            <div className="text-center mt-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="animate-spin w-4 h-4 border-2 border-[#5D4E37] border-t-transparent rounded-full"></div>
                <span className="text-gray-600">Загружаем проекты...</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Кнопка "Избранное" (фиксированная) */}
      {favorites.size > 0 && (
        <button 
          className="fixed bottom-6 right-6 p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200 z-40"
          title={`Избранное (${favorites.size})`}
        >
          <div className="relative">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-white text-red-500 text-xs font-bold rounded-full flex items-center justify-center">
              {favorites.size}
            </span>
          </div>
        </button>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
