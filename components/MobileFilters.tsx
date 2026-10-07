'use client'

import { useState, useEffect } from 'react'

export interface FilterState {
  priceRange: [number, number]
  areaRange: [number, number]
  material: string[]
  buildTime: string[]
  region: string
  features: string[]
  searchQuery: string
}

interface MobileFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onResetFilters: () => void
  isOpen: boolean
  onClose: () => void
}

function RangeSlider({ 
  min, 
  max, 
  value, 
  onChange, 
  step = 1, 
  formatValue = (v) => v.toString() 
}: {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  step?: number
  formatValue?: (value: number) => string
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm text-gray-600">
        <span>{formatValue(value[0])}</span>
        <span>{formatValue(value[1])}</span>
      </div>
      <div className="relative pb-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => onChange([Number(e.target.value), value[1]])}
          className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={(e) => onChange([value[0], Number(e.target.value)])}
          className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  )
}

export default function MobileFilters({
  filters,
  onFiltersChange,
  onResetFilters,
  isOpen,
  onClose
}: MobileFiltersProps) {
  const [config, setConfig] = useState<any>(null)
  
  // Известные ключи фильтров (стандартные фильтры, которые отображаются отдельно)
  const knownKeys = new Set(['price','area','material','buildTime','features'])
  
  const loadConfig = async () => {
    try {
      const res = await fetch(`/api/catalog/filters?t=${Date.now()}`, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      const data = await res.json()
      const { blocks, layout, ...clean } = data || {}
      setConfig(clean)
    } catch {
      setConfig(null)
    }
  }
  
  useEffect(() => {
    if (isOpen) {
      loadConfig()
      
      // Обновляем каждые 5 секунд пока модалка открыта
      const interval = setInterval(() => {
        loadConfig()
      }, 5000)
      
      // Обновляем при возврате видимости страницы
      const handleVisibilityChange = () => {
        if (!document.hidden && isOpen) {
          loadConfig()
        }
      }
      document.addEventListener('visibilitychange', handleVisibilityChange)
      
      return () => {
        clearInterval(interval)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [isOpen])
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return (price / 1000000).toFixed(1) + ' млн ₽'
    } else if (price >= 1000) {
      return (price / 1000).toFixed(0) + ' тыс ₽'
    } else {
      return price.toLocaleString('ru-RU') + ' ₽'
    }
  }

  const formatArea = (area: number) => {
    return area + ' м²'
  }

  const handleCheckboxChange = (field: keyof FilterState, value: string | number, checked: boolean) => {
    const currentArray = filters[field] as any[]
    let newArray: any[]
    
    if (checked) {
      newArray = [...currentArray, value]
    } else {
      newArray = currentArray.filter(item => item !== value)
    }
    
    onFiltersChange({ ...filters, [field]: newArray })
  }

  const handleRadioChange = (field: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [field]: value })
  }

  const handleRangeChange = (field: keyof FilterState, value: [number, number]) => {
    onFiltersChange({ ...filters, [field]: value })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Темный фон */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Модальное окно */}
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Фильтры</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Контент фильтров */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Цена */}
          {config?.price && config.price.type === 'range' && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">{config.price.title || 'Цена'}</h3>
              <RangeSlider
                min={config.price.min ?? 0}
                max={config.price.max ?? 50000000}
                step={config.price.step ?? 500000}
                value={filters.priceRange}
                onChange={(value) => handleRangeChange('priceRange', value)}
                formatValue={formatPrice}
              />
            </div>
          )}

          {/* Площадь */}
          {config?.area && config.area.type === 'range' && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">{config.area.title || 'Площадь'}</h3>
              <RangeSlider
                min={config.area.min ?? 60}
                max={config.area.max ?? 250}
                step={config.area.step ?? 10}
                value={filters.areaRange}
                onChange={(value) => handleRangeChange('areaRange', value)}
                formatValue={formatArea}
              />
            </div>
          )}

          {/* Этажность удалена */}

          {/* Тип строения (если есть в конфиге) */}
          {config?.material && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">{config.material.title || 'Тип строения'}</h3>
              <div className="space-y-2">
                {config.material.options && config.material.options.filter(opt => opt.label && opt.value !== '' && opt.value !== null && opt.value !== undefined).length > 0 ? (
                  config.material.options.filter(opt => opt.label && opt.value !== '' && opt.value !== null && opt.value !== undefined).map((opt: any, idx: number) => (
                    <label key={idx} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#5D4E37] focus:ring-[#5D4E37]"
                        checked={filters.material.includes(opt.value)}
                        onChange={(e) => handleCheckboxChange('material', opt.value, e.target.checked)}
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 italic">Добавьте опции фильтра в админ панели</div>
                )}
              </div>
            </div>
          )}

          {/* Комплектация (фильтр) удалена */}

          {/* Регион удалён */}

          {/* Срок строительства */}
          {config?.buildTime && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">{config.buildTime.title || 'Срок строительства'}</h3>
              <div className="space-y-2">
                {config.buildTime.options && config.buildTime.options.filter(opt => opt.label && opt.value !== '' && opt.value !== null && opt.value !== undefined).length > 0 ? (
                  config.buildTime.options.filter(opt => opt.label && opt.value !== '' && opt.value !== null && opt.value !== undefined).map((opt: any, idx: number) => (
                    <label key={idx} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#5D4E37] focus:ring-[#5D4E37]"
                        checked={filters.buildTime.includes(opt.value)}
                        onChange={(e) => handleCheckboxChange('buildTime', opt.value, e.target.checked)}
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 italic">Добавьте опции фильтра в админ панели</div>
                )}
              </div>
            </div>
          )}

          {/* Дополнительные опции */}
          {config?.features && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">{config.features.title || 'Дополнительные опции'}</h3>
              <div className="space-y-2">
                {config.features.options && config.features.options.filter(opt => opt.label && opt.value !== '' && opt.value !== null && opt.value !== undefined).length > 0 ? (
                  config.features.options.filter(opt => opt.label && opt.value !== '' && opt.value !== null && opt.value !== undefined).map((feature: any, idx: number) => (
                    <label key={idx} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#5D4E37] focus:ring-[#5D4E37]"
                        checked={filters.features.includes(feature.value)}
                        onChange={(e) => handleCheckboxChange('features', feature.value, e.target.checked)}
                      />
                      <span className="text-sm text-gray-700">{feature.label}</span>
                    </label>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 italic">Добавьте опции фильтра в админ панели</div>
                )}
              </div>
            </div>
          )}

          {/* Прочие динамические фильтры */}
          {config && Object.entries(config)
            .filter(([key]) => !knownKeys.has(key))
            .map(([key, conf]: any) => (
              <div key={key}>
                <h3 className="font-medium text-gray-900 mb-3">{conf.title || key}</h3>
                {conf.type === 'range' ? (
                  <RangeSlider
                    min={conf.min ?? 0}
                    max={conf.max ?? 100}
                    step={conf.step ?? 1}
                    value={((filters as any)[key] as [number, number]) || [conf.min ?? 0, conf.max ?? 100]}
                    onChange={(value) => onFiltersChange({ ...(filters as any), [key]: value })}
                    formatValue={(v) => v.toString()}
                  />
                ) : conf.type === 'checkboxes' && conf.options ? (
                  <div className="space-y-2">
                    {conf.options.filter(opt => opt.label && opt.value !== '' && opt.value !== null && opt.value !== undefined).length > 0 ? (
                      <>
                        {conf.options.filter(opt => opt.label && opt.value !== '' && opt.value !== null && opt.value !== undefined).map((opt: any, idx: number) => {
                          const arr = ((filters as any)[key] as any[]) || []
                          const checked = arr.includes(opt.value)
                          return (
                            <label key={idx} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg">
                              <input
                                type="checkbox"
                                className="rounded border-gray-300 text-[#5D4E37] focus:ring-[#5D4E37]"
                                checked={checked}
                                onChange={(e) => {
                                  const next = e.target.checked ? [...arr, opt.value] : arr.filter((v: any) => v !== opt.value)
                                  onFiltersChange({ ...(filters as any), [key]: next })
                                }}
                              />
                              <span className="text-sm text-gray-700">{opt.label}</span>
                            </label>
                          )
                        })}
                        {conf.options.filter(opt => opt.label && opt.value !== '' && opt.value !== null && opt.value !== undefined).length === 0 && (
                          <div className="text-xs text-gray-500 italic">Заполните опции фильтра в админ панели (все опции пустые)</div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-gray-500 italic">Добавьте опции фильтра в админ панели</div>
                    )}
                  </div>
                ) : conf.type === 'radio' && conf.options ? (
                  <div className="space-y-2">
                    {conf.options && conf.options.filter(opt => opt.label && opt.value !== '' && opt.value !== null && opt.value !== undefined).length > 0 ? (
                      <>
                        {conf.options.filter(opt => opt.label && opt.value !== '' && opt.value !== null && opt.value !== undefined).map((opt: any, idx: number) => (
                          <label key={idx} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg">
                            <input
                              type="radio"
                              name={`dyn-${key}`}
                              className="text-[#5D4E37] focus:ring-[#5D4E37]"
                              checked={((filters as any)[key] as string) === (opt.value as string)}
                              onChange={() => onFiltersChange({ ...(filters as any), [key]: opt.value })}
                            />
                            <span className="text-sm text-gray-700">{opt.label || String(opt.value)}</span>
                          </label>
                        ))}
                        {conf.options.filter(opt => opt.label && opt.value !== '' && opt.value !== null && opt.value !== undefined).length === 0 && (
                          <div className="text-xs text-gray-500 italic">Заполните опции фильтра в админ панели (все опции пустые)</div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-gray-500 italic">Добавьте опции фильтра в админ панели</div>
                    )}
                  </div>
                ) : conf.type ? (
                  <div className="text-xs text-gray-500 italic">Неизвестный тип фильтра: {conf.type}</div>
                ) : null}
              </div>
            ))}
        </div>

        {/* Кнопки действий */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-[#5D4E37] hover:bg-[#6D5D4A] text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Применить фильтры
          </button>
          <button
            onClick={() => {
              onResetFilters()
              onClose()
            }}
            className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg transition-colors duration-200"
          >
            Сбросить всё
          </button>
        </div>
      </div>
    </div>
  )
}
