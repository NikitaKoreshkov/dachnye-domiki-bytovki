import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ProjectsCatalog from '@/components/ProjectsCatalog'
import ProcessSteps from '@/components/ProcessSteps'
import Advantages from '@/components/Advantages'
import ContactsCTA from '@/components/ContactsCTA'
import Footer from '@/components/Footer'

// Динамические импорты для тяжелых компонентов (lazy loading)
const Calculator = dynamic(() => import('@/components/Calculator'), {
  ssr: true, // SSR нужен для SEO
})

const ReviewsGallery = dynamic(() => import('@/components/ReviewsGallery'), {
  ssr: false, // Можно отключить SSR так как это интерактивный компонент
})

const FAQ = dynamic(() => import('@/components/FAQ'), {
  ssr: false, // Отключаем SSR для FAQ чтобы данные всегда загружались на клиенте в реальном времени
})

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <ProjectsCatalog />
      <Calculator />
      <ProcessSteps />
      <Advantages />
      <ReviewsGallery />
      <FAQ />
      <ContactsCTA />
      <Footer />
    </main>
  )
}
