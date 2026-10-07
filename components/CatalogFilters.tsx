'use client'

import { useState, useEffect } from 'react'

interface FilterState {
  priceRange: [number, number]
  areaRange: [number, number]
  material: string[]
  buildTime: string[]
  region: string
  features: string[]
  searchQuery: string
}

interface CatalogFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onResetFilters: () => void
  isVisible: boolean
  isHeaderSticky?: boolean
  headerHeight?: number
}

interface FilterSectionProps {
  title: string
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
}

function FilterSection({ title, children, isOpen, onToggle }: FilterSectionProps) {
  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left py-2"
      >
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  )
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
      <div className="relative h-8 flex items-center">
        {/* Фоновая линия */}
        <div className="absolute inset-x-0 h-2 bg-gray-200 rounded-lg" />
        {/* Активная дорожка */}
        <div
          className="absolute h-2 bg-[#5D4E37] rounded-lg"
          style={{
            left: `${((value[0] - min) / (max - min)) * 100}%`,
            width: `${Math.max(0, ((value[1] - min) / (max - min)) * 100 - ((value[0] - min) / (max - min)) * 100)}%`
          }}
        />
        {/* Левый слайдер */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => onChange([Number(e.target.value), Math.max(Number(e.target.value), value[1])])}
          className="absolute w-full h-4 appearance-none cursor-pointer bg-transparent range-input"
        />
        {/* Правый слайдер */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={(e) => onChange([Math.min(Number(e.target.value), value[0]), Number(e.target.value)])}
          className="absolute w-full h-4 appearance-none cursor-pointer bg-transparent range-input"
        />
      </div>
    </div>
  )
}

type FilterConfig = {
  title: string
  type: 'range' | 'checkboxes' | 'radio'
  min?: number
  max?: number
  step?: number
  options?: Array<{ label: string; value: string | number }>
}

type FiltersConfig = {
  price?: FilterConfig
  area?: FilterConfig
  material?: FilterConfig
  buildTime?: FilterConfig
  features?: FilterConfig
  [key: string]: FilterConfig | undefined // Поддержка произвольных ключей для динамических фильтров
}

// Дефолтная конфигурация (на случай, если API не отвечает или еще не загрузилась)
const defaultFiltersConfig: FiltersConfig = {
  price: {
    title: 'Цена',
    type: 'range',
    min: 0,
    max: 50000000,
    step: 500000
  },
  area: {
    title: 'Площадь',
    type: 'range',
    min: 60,
    max: 250,
    step: 10
  },
  material: {
    title: 'Тип строения',
    type: 'checkboxes',
    options: [
      { label: 'Каркасный', value: 'каркасный' },
      { label: 'SIP', value: 'SIP' },
      { label: 'Комбинированный', value: 'комбинированный' }
    ]
  },
  buildTime: {
    title: 'Срок строительства',
    type: 'checkboxes',
    options: [
      { label: 'до 2 мес', value: 'до 2 мес' },
      { label: 'до 4 мес', value: 'до 4 мес' },
      { label: '4+ мес', value: '4+ мес' }
    ]
  },
  features: {
    title: 'Дополнительные опции',
    type: 'checkboxes',
    options: [
      { label: 'Утепление', value: 'утепление' },
      { label: 'Отделка', value: 'отделка' },
      { label: 'Коммуникации', value: 'коммуникации' }
    ]
  }
}

export default function CatalogFilters({
  filters,
  onFiltersChange,
  onResetFilters,
  isVisible,
  isHeaderSticky = false,
  headerHeight = 96
}: CatalogFiltersProps) {
  const [filtersConfig, setFiltersConfig] = useState<FiltersConfig | null>(null)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  
  // Известные ключи фильтров (стандартные фильтры, которые отображаются отдельно)
  const knownKeys = new Set(['price','area','material','buildTime','features'])

  // Загружаем конфигурацию фильтров из API
  const loadConfig = async () => {
    try {
      const res = await fetch(`/api/catalog/filters?t=${Date.now()}`, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      if (res.ok) {
        const config = await res.json()
        console.log('[FILTERS] Loaded config from API:', config)
        // Удаляем blocks и layout если они есть
        const { blocks, layout, ...cleanConfig } = config
        console.log('[FILTERS] Clean config keys:', Object.keys(cleanConfig))
        console.log('[FILTERS] All filter keys:', Object.keys(cleanConfig))
        console.log('[FILTERS] Known keys:', Array.from(knownKeys))
        console.log('[FILTERS] Dynamic filters (not in knownKeys):', Object.keys(cleanConfig).filter(key => !knownKeys.has(key)))
        setFiltersConfig(cleanConfig)
        
        // Обновляем openSections для новых фильтров (если их еще нет)
        setOpenSections(prev => {
          const updated = { ...prev }
          Object.keys(cleanConfig).forEach(key => {
            if (!(key in updated)) {
              updated[key] = false
            }
          })
          return updated
        })
      } else {
        console.warn('[FILTERS] API returned error, using defaults')
        setFiltersConfig(defaultFiltersConfig)
      }
    } catch (error) {
      console.error('[FILTERS] Error loading filters config:', error)
      setFiltersConfig(defaultFiltersConfig)
    }
  }

  useEffect(() => {
    loadConfig()
    
    // Перезагружаем конфигурацию при возврате фокуса на страницу (если данные были изменены в админке)
    const handleFocus = () => {
      loadConfig()
    }
    window.addEventListener('focus', handleFocus)
    
    // Перезагружаем при возврате видимости страницы (например, при переключении вкладок)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadConfig()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Обновляем каждые 5 секунд для мгновенного отображения изменений из админки
    const interval = setInterval(() => {
      loadConfig()
    }, 5000)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
    }
  }, [])

  // Используем конфигурацию из API или дефолтную
  const config = filtersConfig || defaultFiltersConfig

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

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

  if (!isVisible) return null

  // Вычисляем top offset: фильтры должны становиться sticky максимально рано
  // Минимальный offset для самого раннего прилипания
  const topOffset = isHeaderSticky ? headerHeight : 48

  return (
    <div 
      className="w-80 flex-shrink-0 pl-4 sticky self-start"
      style={{ top: `${topOffset}px` }}
      id="filters-sticky-container"
    >
        <div
          className="filters-scrollable"
          style={{
            maxHeight: `calc(100vh - ${topOffset}px - 1rem)`,
            overflowY: 'auto',
            paddingRight: '0.5rem'
          }}
        >
        {/* Заголовок + Поиск */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Фильтры</h2>
            <button
              onClick={onResetFilters}
              className="text-sm text-[#5D4E37] hover:text-[#6D5D4A] font-medium transition-colors duration-200"
            >
              Сбросить всё
            </button>
          </div>
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
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
            />
          </div>
        </div>

        {/* Фильтр по цене */}
        {config.price && (
        <FilterSection
            title={config.price.title || 'Цена'}
          isOpen={openSections.price}
          onToggle={() => toggleSection('price')}
        >
            {config.price.type === 'range' && (
          <RangeSlider
                min={config.price.min ?? 0}
                max={config.price.max ?? 50000000}
                step={config.price.step ?? 500000}
            value={filters.priceRange}
            onChange={(value) => handleRangeChange('priceRange', value)}
            formatValue={formatPrice}
          />
            )}
        </FilterSection>
        )}

        {/* Фильтр по площади */}
        {config.area && (
        <FilterSection
            title={config.area.title || 'Площадь'}
          isOpen={openSections.area}
          onToggle={() => toggleSection('area')}
        >
            {config.area.type === 'range' && (
          <RangeSlider
                min={config.area.min ?? 60}
                max={config.area.max ?? 250}
                step={config.area.step ?? 10}
            value={filters.areaRange}
            onChange={(value) => handleRangeChange('areaRange', value)}
            formatValue={formatArea}
          />
            )}
        </FilterSection>
        )}

        {/* Этажность удалена по требованиям */}

        {/* Тип строения */}
        {config.material && (
        <FilterSection
            title={config.material.title || 'Тип строения'}
          isOpen={openSections.material}
          onToggle={() => toggleSection('material')}
        >
            {config.material.type === 'checkboxes' && config.material.options && (
          <div className="space-y-2">
                {config.material.options.map((option, idx) => (
                  <label key={idx} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#5D4E37] focus:ring-[#5D4E37] focus:ring-offset-0"
                      checked={filters.material.includes(option.value as string)}
                      onChange={(e) => handleCheckboxChange('material', option.value as string, e.target.checked)}
                />
                    <span className="ml-3 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
            )}
        </FilterSection>
        )}

        {/* Комплектация (фильтр) удалена по требованиям */}

        {/* Срок строительства */}
        {config.buildTime && (
        <FilterSection
            title={config.buildTime.title || 'Срок строительства'}
          isOpen={openSections.buildTime}
          onToggle={() => toggleSection('buildTime')}
        >
            {config.buildTime.type === 'checkboxes' && config.buildTime.options && (
          <div className="space-y-2">
                {config.buildTime.options.map((option, idx) => (
                  <label key={idx} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#5D4E37] focus:ring-[#5D4E37] focus:ring-offset-0"
                      checked={filters.buildTime.includes(option.value as string)}
                      onChange={(e) => handleCheckboxChange('buildTime', option.value as string, e.target.checked)}
                />
                    <span className="ml-3 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
            )}
        </FilterSection>
        )}

        {/* Дополнительные опции */}
        {config.features && (
        <FilterSection
            title={config.features.title || 'Дополнительные опции'}
          isOpen={openSections.features}
          onToggle={() => toggleSection('features')}
        >
            {config.features.type === 'checkboxes' && config.features.options && (
          <div className="space-y-2">
                {config.features.options.map((option, idx) => (
                  <label key={idx} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#5D4E37] focus:ring-[#5D4E37] focus:ring-offset-0"
                      checked={filters.features.includes(option.value as string)}
                      onChange={(e) => handleCheckboxChange('features', option.value as string, e.target.checked)}
                />
                    <span className="ml-3 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
            )}
        </FilterSection>
        )}

        {/* Динамические дополнительные фильтры из админки */}
        {Object.entries(config)
          .filter(([key]) => {
            const isDynamic = !knownKeys.has(key)
            if (isDynamic) {
              console.log('[FILTERS] Rendering dynamic filter:', key, config[key])
            }
            return isDynamic
          })
          .map(([key, conf]) => {
            console.log('[FILTERS] Mapping dynamic filter:', key, conf)
            return (
            <FilterSection
              key={key}
              title={conf.title || key}
              isOpen={Boolean((openSections as any)[key])}
              onToggle={() => setOpenSections(prev => ({ ...prev, [key]: !Boolean((prev as any)[key]) }))}
            >
              {conf.type === 'range' ? (
                <RangeSlider
                  min={conf.min ?? 0}
                  max={conf.max ?? 100}
                  step={conf.step ?? 1}
                  value={((filters as any)[key] as [number, number]) || [conf.min ?? 0, conf.max ?? 100]}
                  onChange={(value) => onFiltersChange({ ...(filters as any), [key]: value })}
                  formatValue={(v) => v.toString()}
                />
              ) : conf.type === 'checkboxes' ? (
                <div className="space-y-2">
                  {conf.options && conf.options.length > 0 ? (
                    <>
                      {conf.options.filter(opt => opt.label && opt.value !== '' && opt.value !== null && opt.value !== undefined).map((option, idx) => {
                        const arr = ((filters as any)[key] as any[]) || []
                        const checked = arr.includes(option.value)
                        return (
                          <label key={idx} className="flex items-center">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-[#5D4E37] focus:ring-[#5D4E37] focus:ring-offset-0"
                              checked={checked}
                              onChange={(e) => {
                                const next = e.target.checked ? [...arr, option.value] : arr.filter(v => v !== option.value)
                                console.log('[FILTERS] Checkbox changed:', key, 'option.value:', option.value, 'checked:', e.target.checked, 'next:', next)
                                onFiltersChange({ ...(filters as any), [key]: next })
                              }}
                            />
                            <span className="ml-3 text-sm text-gray-700">{option.label || String(option.value)}</span>
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
              ) : conf.type === 'radio' ? (
                <div className="space-y-2">
                  {conf.options && conf.options.length > 0 ? (
                    <>
                      {conf.options.filter(opt => opt.label && opt.value !== '' && opt.value !== null && opt.value !== undefined).map((option, idx) => (
                        <label key={idx} className="flex items-center">
                          <input
                            type="radio"
                            name={`dyn-${key}`}
                            className="text-[#5D4E37] focus:ring-[#5D4E37] focus:ring-offset-0"
                            checked={((filters as any)[key] as string) === (option.value as string)}
                            onChange={() => onFiltersChange({ ...(filters as any), [key]: option.value })}
                          />
                          <span className="ml-3 text-sm text-gray-700">{option.label || String(option.value)}</span>
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
              ) : (
                <div className="text-xs text-gray-500 italic">Неизвестный тип фильтра: {conf.type || 'undefined'}</div>
              )}
            </FilterSection>
            )
          })}
        </div>
    </div>
  )
}
// Стили для range слайдеров
const rangeStyles = `
  .range-input::-webkit-slider-runnable-track {
    background: transparent;
    height: 8px;
  }

  .range-input::-moz-range-track {
    background: transparent;
    height: 8px;
    border: none;
  }

  .range-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #5D4E37;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    /* Центрируем на треке: (высота thumb - высота трека) / 2 = (20 - 8) / 2 = 6px */
    margin-top: -6px;
  }

  .range-input::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #5D4E37;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  /* Тонкий и незаметный скроллбар для фильтров */
  .filters-scrollable::-webkit-scrollbar {
    width: 6px;
  }

  .filters-scrollable::-webkit-scrollbar-track {
    background: transparent;
  }

  .filters-scrollable::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  .filters-scrollable::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }

  /* Для Firefox */
  .filters-scrollable {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
  }
`

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style")
  styleSheet.textContent = rangeStyles
  document.head.appendChild(styleSheet)
}

