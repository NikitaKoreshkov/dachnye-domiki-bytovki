import { prisma } from './prisma'
import type { Metadata } from 'next'

export async function getSiteMetadata(): Promise<{
  siteTitle: string
  siteDescription: string
  siteKeywords: string
  ogImage: string
  companyName: string
}> {
  try {
    const [metadataConfig, footerConfig] = await Promise.all([
      prisma.siteMetadataConfig.findFirst(),
      prisma.footerConfig.findFirst()
    ])

    const companyName = footerConfig?.companyName || 'Дачные-Домики-Бытовки'
    
    return {
      siteTitle: metadataConfig?.siteTitle || `Дачные домики под ключ | ${companyName} - Быстро, качественно, с гарантией`,
      siteDescription: metadataConfig?.siteDescription || 'Строительство дачных домиков под ключ. Каркасные дома от 205 000 руб. Проект, доставка, монтаж и отделка. Рассчитайте стоимость онлайн!',
      siteKeywords: metadataConfig?.siteKeywords || 'дачные домики под ключ, каркасные дома, строительство домов, Москва, Россия, дом под ключ, дача, коттедж',
      ogImage: metadataConfig?.ogImage || '/images/house.jpg',
      companyName
    }
  } catch (error) {
    console.error('[METADATA] Error loading metadata:', error)
    return {
      siteTitle: 'Дачные домики под ключ',
      siteDescription: 'Строительство дачных домиков под ключ. Каркасные дома от 205 000 руб.',
      siteKeywords: 'дачные домики под ключ, каркасные дома, строительство домов, Москва, Россия',
      ogImage: '/images/house.jpg',
      companyName: 'Дачные-Домики-Бытовки'
    }
  }
}

export async function generateSiteMetadata(): Promise<Metadata> {
  const metadata = await getSiteMetadata()
  const baseUrl = 'https://xn-----6kcgfhcg3aadtevltg5e6dydk.xn--p1ai'

  return {
    title: metadata.siteTitle,
    description: metadata.siteDescription,
    keywords: metadata.siteKeywords,
    authors: [{ name: metadata.companyName }],
    creator: metadata.companyName,
    publisher: metadata.companyName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: metadata.siteTitle.split(' - ')[0] || metadata.siteTitle,
      description: metadata.siteDescription,
      url: baseUrl,
      siteName: metadata.companyName,
      images: [
        {
          url: metadata.ogImage,
          width: 1200,
          height: 630,
          alt: `Дачный домик под ключ от ${metadata.companyName}`,
        },
      ],
      locale: 'ru_RU',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.siteTitle.split(' - ')[0] || metadata.siteTitle,
      description: metadata.siteDescription,
      images: [metadata.ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      ...(process.env.GOOGLE_SITE_VERIFICATION && { google: process.env.GOOGLE_SITE_VERIFICATION }),
      ...(process.env.YANDEX_VERIFICATION && { yandex: process.env.YANDEX_VERIFICATION }),
    },
  }
}
