/**
 * Скрипт для обновления названия компании с KarkasDom на Дачные-Домики-Бытовки
 * Запуск: npx tsx scripts/update-company-name.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateCompanyName() {
  try {
    console.log('🔄 Начинаю обновление названия компании...')

    // Обновляем FooterConfig
    const footerConfig = await prisma.footerConfig.findFirst()
    if (footerConfig) {
      const updated = await prisma.footerConfig.update({
        where: { id: footerConfig.id },
        data: {
          companyName: footerConfig.companyName === 'KarkasDom' 
            ? 'Дачные-Домики-Бытовки' 
            : footerConfig.companyName,
          whatsappText: footerConfig.whatsappText?.includes('KarkasDom')
            ? footerConfig.whatsappText.replace(/KarkasDom/g, 'Дачные-Домики-Бытовки')
            : footerConfig.whatsappText,
          copyright: footerConfig.copyright?.includes('KarkasDom')
            ? footerConfig.copyright.replace(/KarkasDom/g, 'Дачные-Домики-Бытовки')
            : footerConfig.copyright,
        }
      })
      console.log('✅ FooterConfig обновлен:', updated.companyName)
    } else {
      console.log('ℹ️  FooterConfig не найден, будет создан с новым названием при первом запросе')
    }

    // Обновляем SiteMetadataConfig
    const metadataConfig = await prisma.siteMetadataConfig.findFirst()
    if (metadataConfig) {
      const updated = await prisma.siteMetadataConfig.update({
        where: { id: metadataConfig.id },
        data: {
          siteTitle: metadataConfig.siteTitle?.includes('KarkasDom')
            ? metadataConfig.siteTitle.replace(/KarkasDom/g, 'Дачные-Домики-Бытовки')
            : metadataConfig.siteTitle,
        }
      })
      console.log('✅ SiteMetadataConfig обновлен:', updated.siteTitle)
    } else {
      console.log('ℹ️  SiteMetadataConfig не найден, будет создан с новым названием при первом запросе')
    }

    console.log('✅ Обновление завершено успешно!')
  } catch (error) {
    console.error('❌ Ошибка при обновлении:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateCompanyName()
  .then(() => {
    console.log('🎉 Скрипт выполнен успешно')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Критическая ошибка:', error)
    process.exit(1)
  })
