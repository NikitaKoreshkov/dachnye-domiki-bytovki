import type { Metadata } from 'next'
import { Inter, Lora } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Providers from '@/components/providers/SessionProvider'
import { FavoritesCompareProvider } from '@/components/providers/FavoritesCompareProvider'
import MetadataTags from '@/components/MetadataTags'
import { generateSiteMetadata, getSiteMetadata } from '@/lib/metadata'

// Отключаем кеширование для динамических метаданных
export const dynamic = 'force-dynamic'
export const revalidate = 0

const inter = Inter({ 
  subsets: ['cyrillic', 'latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800', '900']
})

const lora = Lora({ 
  subsets: ['cyrillic', 'latin'],
  variable: '--font-lora',
  weight: ['400', '500', '600', '700']
})

export async function generateMetadata(): Promise<Metadata> {
  return generateSiteMetadata()
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const metadata = await getSiteMetadata()
  const baseUrl = 'https://xn-----6kcgfhcg3aadtevltg5e6dydk.xn--p1ai'
  const companyName = metadata.companyName

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: companyName,
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`,
          width: 200,
          height: 60
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+7-495-023-82-15',
          contactType: 'customer service',
          areaServed: 'RU',
          availableLanguage: 'Russian'
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Московский п., ул. Картмазовские пруды, д. 2, корп. 3, кв. 474',
          addressLocality: 'Москва',
          addressRegion: 'Московская область',
          postalCode: '108811',
          addressCountry: 'RU'
        },
        sameAs: [
          'https://twitter.com/dachnye-domiki-bytovki',
          'https://facebook.com/dachnye-domiki-bytovki',
          'https://instagram.com/dachnye-domiki-bytovki'
        ]
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${baseUrl}/#localbusiness`,
        name: `${companyName} - Строительство дачных домиков`,
        image: `${baseUrl}${metadata.ogImage}`,
        telephone: '+7-495-023-82-15',
        email: 'info@dachnye-domiki-bytovki.ru',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Московский п., ул. Картмазовские пруды, д. 2, корп. 3, кв. 474',
          addressLocality: 'Москва',
          addressRegion: 'Московская область',
          postalCode: '108811',
          addressCountry: 'RU'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 55.7558,
          longitude: 37.6173
        },
        url: baseUrl,
        priceRange: '950000-3500000',
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00'
        },
        serviceArea: {
          '@type': 'GeoCircle',
          geoMidpoint: {
            '@type': 'GeoCoordinates',
            latitude: 55.7558,
            longitude: 37.6173
          },
          geoRadius: '100000'
        }
      },
      {
        '@type': 'Service',
        '@id': `${baseUrl}/#service`,
        name: 'Строительство дачных домиков под ключ',
        description: 'Полный цикл строительства дачных домиков: проектирование, производство, доставка, монтаж и отделка',
        provider: {
          '@id': `${baseUrl}/#organization`
        },
        areaServed: {
          '@type': 'Country',
          name: 'Россия'
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Проекты домов',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Product',
                name: 'Дом "Лесной" 6×8',
                description: 'Каркасный дом площадью 48 м² с террасой'
              }
            }
          ]
        }
      }
    ]
  }

  return (
    <html lang="ru" className={`${inter.variable} ${lora.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <MetadataTags />
        <Script
          id="yandex-metrika"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

              ym(106293907, "init", {
                clickmap:true,
                trackLinks:true,
                accurateTrackBounce:true,
                webvisor:true
              });
            `,
          }}
        />
      </head>
      <body className="font-inter">
        <Providers>
          <FavoritesCompareProvider>{children}</FavoritesCompareProvider>
        </Providers>
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/106293907" style={{position:'absolute', left:'-9999px'}} alt="" />
          </div>
        </noscript>
      </body>
    </html>
  )
}
