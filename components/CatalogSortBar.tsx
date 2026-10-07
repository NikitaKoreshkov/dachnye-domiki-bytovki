'use client'

import { useState } from 'react'

interface SortState {
  field: 'popularity' | 'price' | 'area' | 'new'
  direction: 'asc' | 'desc'
}

interface CatalogSortBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sort: SortState
  onSortChange: (sort: SortState) => void
  isFiltersVisible: boolean
  onToggleFilters: () => void
  onOpenMobileFilters: () => void
  resultsCount: number
  isSticky?: boolean
  topOffset?: number
  isFading?: boolean
}

export default function CatalogSortBar({
  searchQuery,
  onSearchChange,
  sort,
  onSortChange,
  isFiltersVisible,
  onToggleFilters,
  onOpenMobileFilters,
  resultsCount,
  isSticky = false,
  topOffset = 64,
  isFading = false,
}: CatalogSortBarProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isSortVisible, setIsSortVisible] = useState(false)

  const sortOptions = [
    { value: 'popularity', label: 'Популярности' },
    { value: 'price', label: 'Цене' },
    { value: 'area', label: 'Площади' },
    { value: 'new', label: 'Новизне' }
  ]

  const handleSortChange = (field: string) => {
    if (sort.field === field) {
      // Если поле то же самое, меняем направление
      onSortChange({
        field: field as any,
        direction: sort.direction === 'asc' ? 'desc' : 'asc'
      })
    } else {
      // Если новое поле, ставим по умолчанию desc
      onSortChange({
        field: field as any,
        direction: 'desc'
      })
    }
  }

  const currentSortLabel = sortOptions.find(o => o.value === sort.field)?.label || 'Популярности'

  return (
    <div className={`bg-white lg:hidden sticky z-40 ${isFading ? 'opacity-0 -translate-y-2 invisible' : 'opacity-100 translate-y-0 visible'} transition-all duration-300`}
      style={{ top: `${topOffset}px` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Мобильная версия */}
        <div className="space-y-4">
          {/* Поиск на мобильном */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#5D4E37] focus:border-[#5D4E37]"
              placeholder="Поиск проектов..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Кнопки управления на мобильном */}
          <div className="flex justify-between items-center max-[415px]:gap-2">
            <button
              onClick={onOpenMobileFilters}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 max-[415px]:px-3 max-[415px]:py-1.5 max-[415px]:text-xs"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
              <span>Фильтры</span>
            </button>

            <div className="flex items-center space-x-2 max-[415px]:space-x-1">
              <span className="text-sm text-gray-500 max-[415px]:hidden">Сортировка:</span>
              <button
                onClick={() => setIsSortVisible(!isSortVisible)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-md transition-all duration-200 max-[415px]:px-3 max-[415px]:py-1.5 max-[415px]:text-xs"
              >
                <span>{currentSortLabel}</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isSortVisible ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Мобильная панель сортировки (кастомная) */}
          {isSortVisible && (
            <div className="mt-3 border border-gray-200 rounded-lg bg-white p-4 shadow-sm max-[415px]:p-3">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 font-medium max-[415px]:text-xs">Сортировать по:</span>
                <div className="flex flex-wrap gap-2 max-[415px]:gap-1.5">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 max-[415px]:px-2.5 max-[415px]:py-1.5 max-[415px]:text-xs ${
                        sort.field === option.value 
                          ? 'bg-[#5D4E37] text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 max-[415px]:gap-2">
                <span className="text-sm text-gray-500 font-medium max-[415px]:text-xs">Порядок:</span>
                <div className="flex gap-2 max-[415px]:gap-1.5">
                  <button
                    onClick={() => onSortChange({ field: sort.field, direction: 'asc' })}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 max-[415px]:px-2.5 max-[415px]:py-1.5 max-[415px]:text-xs ${
                      sort.direction === 'asc' ? 'bg-[#5D4E37] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    По возрастанию
                  </button>
                  <button
                    onClick={() => onSortChange({ field: sort.field, direction: 'desc' })}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 max-[415px]:px-2.5 max-[415px]:py-1.5 max-[415px]:text-xs ${
                      sort.direction === 'desc' ? 'bg-[#5D4E37] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    По убыванию
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Результаты */}
          <div className="text-sm text-gray-500">Найдено проектов: <span className="font-semibold text-gray-900">{resultsCount}</span></div>
        </div>

        {/* Десктопная версия: панель между линиями */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-end py-3">
            <div className="flex items-center gap-3 lg:-mr-[calc(50vw-50%-2rem)]">
              <button
                onClick={onToggleFilters}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  isFiltersVisible 
                    ? 'bg-[#5D4E37] text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span>{isFiltersVisible ? 'Скрыть фильтры' : 'Показать фильтры'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
              </button>

              <button
                onClick={() => setIsSortVisible(!isSortVisible)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-md transition-all duration-200"
              >
                <span>Сортировка</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isSortVisible ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Панель сортировки (выпадающая) */}
          {isSortVisible && (
            <div className="border border-gray-200 rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 font-medium">Сортировать по:</span>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        sort.field === option.value 
                          ? 'bg-[#5D4E37] text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{option.label}</span>
                      {sort.field === option.value && (
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${
                            sort.direction === 'desc' ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
