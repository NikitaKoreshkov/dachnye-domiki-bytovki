'use client'

import { useEffect, useMemo, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CatalogFilters from '@/components/CatalogFilters'
import MobileFilters, { type FilterState } from '@/components/MobileFilters'
import CatalogSortBar from '@/components/CatalogSortBar'
import CatalogGrid from '@/components/CatalogGrid'
import CatalogSeoText from '@/components/CatalogSeoText'

type Project = {
  id: string
  slug: string
  title: string
  area: number
  priceFrom: number
  priceTo?: number | null
  floors: number
  material: string
  completion: string
  buildTime: number
  region: string
  image: string
  tags: string[]
  hasTerrasse?: boolean
  hasBath?: boolean
  hasGarage?: boolean
  features?: string[]
  description?: string
}

type SortState = { field: 'popularity' | 'price' | 'area' | 'new'; direction: 'asc' | 'desc' }

const PRICE_LIMITS: [number, number] = [0, 50000000]
const AREA_LIMITS: [number, number] = [20, 250]

const EMPTY_FILTERS: FilterState = {
  priceRange: PRICE_LIMITS,
  areaRange: AREA_LIMITS,
  material: [],
  buildTime: [],
  region: '',
  features: [],
  searchQuery: '',
}

/** Build-time buckets in months, matching the labels the filter rail offers. */
function buildTimeBucket(days: number): string[] {
  const months = days / 30
  const buckets = []
  if (months <= 2) buckets.push('до 2 мес')
  if (months <= 4) buckets.push('до 4 мес')
  if (months > 4) buckets.push('4+ мес')
  return buckets
}

const PAGE_SIZE = 9

export default function CatalogPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [sort, setSort] = useState<SortState>({ field: 'popularity', direction: 'desc' })
  const [filtersVisible, setFiltersVisible] = useState(true)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [visible, setVisible] = useState(PAGE_SIZE)

  useEffect(() => {
    fetch('/api/projects', { cache: 'no-store' })
      .then(response => (response.ok ? response.json() : []))
      .then((rows: Project[]) => setProjects(Array.isArray(rows) ? rows : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const query = filters.searchQuery.trim().toLowerCase()
    const result = projects.filter(project => {
      if (project.priceFrom < filters.priceRange[0] || project.priceFrom > filters.priceRange[1]) return false
      if (project.area < filters.areaRange[0] || project.area > filters.areaRange[1]) return false
      if (filters.material.length && !filters.material.includes(project.material)) return false
      if (filters.buildTime.length && !filters.buildTime.some(bucket => buildTimeBucket(project.buildTime).includes(bucket))) return false
      if (filters.region && project.region !== filters.region) return false
      if (filters.features.length && !filters.features.every(feature => (project.features ?? []).includes(feature))) return false
      if (query && !`${project.title} ${project.description ?? ''} ${project.tags.join(' ')}`.toLowerCase().includes(query)) return false
      return true
    })

    const direction = sort.direction === 'asc' ? 1 : -1
    return result.sort((a, b) => {
      switch (sort.field) {
        case 'price':
          return (a.priceFrom - b.priceFrom) * direction
        case 'area':
          return (a.area - b.area) * direction
        case 'new':
          return direction
        default:
          return (b.tags.includes('бестселлер') ? 1 : 0) - (a.tags.includes('бестселлер') ? 1 : 0)
      }
    })
  }, [projects, filters, sort])

  useEffect(() => setVisible(PAGE_SIZE), [filters, sort])

  const houses = useMemo(
    () =>
      filtered.slice(0, visible).map(project => ({
        id: project.slug || project.id,
        title: project.title,
        area: project.area,
        price: project.priceFrom,
        floors: project.floors,
        material: project.material as 'каркасный' | 'SIP' | 'комбинированный',
        completion: project.completion as 'под ключ' | 'тёплый контур' | 'коробка',
        buildTime: project.buildTime,
        region: project.region,
        image: project.image,
        tags: project.tags,
        hasTerrasse: project.hasTerrasse,
        hasBath: project.hasBath,
        hasGarage: project.hasGarage,
        features: project.features,
      })),
    [filtered, visible],
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Проекты домов {projects.length > 0 && <span className="text-gray-500 text-2xl font-semibold">({projects.length})</span>}
              </h1>
              <p className="mt-2 text-gray-600 max-w-2xl">
                Каркасные, SIP и комбинированные дома под ключ. Отфильтруйте по бюджету, площади и сроку строительства.
              </p>
            </div>
          </div>

          <CatalogSortBar
            searchQuery={filters.searchQuery}
            onSearchChange={searchQuery => setFilters(current => ({ ...current, searchQuery }))}
            sort={sort}
            onSortChange={setSort}
            isFiltersVisible={filtersVisible}
            onToggleFilters={() => setFiltersVisible(value => !value)}
            onOpenMobileFilters={() => setMobileFiltersOpen(true)}
            resultsCount={filtered.length}
          />

          <div className="flex flex-col lg:flex-row gap-8 mt-6">
            <aside className={filtersVisible ? 'lg:w-80 lg:flex-shrink-0' : 'hidden'}>
              <CatalogFilters
                filters={filters}
                onFiltersChange={setFilters}
                onResetFilters={() => setFilters(EMPTY_FILTERS)}
                isVisible={filtersVisible}
              />
            </aside>

            <div className="flex-1 min-w-0">
              <CatalogGrid
                houses={houses}
                isLoading={loading}
                hasMore={visible < filtered.length}
                onLoadMore={() => setVisible(count => count + PAGE_SIZE)}
                isFiltersVisible={filtersVisible}
              />
              {!loading && !houses.length && (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                  <p className="text-lg text-gray-900 font-semibold">Под эти фильтры проектов нет</p>
                  <p className="text-gray-600 mt-2">Сбросьте часть условий или расширьте диапазон цены и площади.</p>
                  <button
                    type="button"
                    onClick={() => setFilters(EMPTY_FILTERS)}
                    className="mt-6 px-6 py-3 rounded-lg border-2 border-[#5D4E37] text-[#5D4E37] font-semibold hover:bg-[#5D4E37] hover:text-white transition-colors"
                  >
                    Сбросить фильтры
                  </button>
                </div>
              )}
            </div>
          </div>

          <CatalogSeoText />
        </div>
      </div>

      <MobileFilters
        filters={filters}
        onFiltersChange={setFilters}
        onResetFilters={() => setFilters(EMPTY_FILTERS)}
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
      />
      <Footer />
    </main>
  )
}
