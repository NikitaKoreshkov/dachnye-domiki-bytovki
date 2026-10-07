/**
 * Скрипт для обновления email адресов с info@karkasdom.ru на info@dachnye-domiki-bytovki.ru
 * Запуск: npx tsx scripts/update-email-addresses.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateEmailAddresses() {
  try {
    console.log('🔄 Начинаю обновление email адресов...')

    // Обновляем FooterConfig
    const footerConfig = await prisma.footerConfig.findFirst()
    if (footerConfig && footerConfig.email === 'info@karkasdom.ru') {
      const updated = await prisma.footerConfig.update({
        where: { id: footerConfig.id },
        data: {
          email: 'info@dachnye-domiki-bytovki.ru'
        }
      })
      console.log('✅ FooterConfig email обновлен:', updated.email)
    } else if (footerConfig) {
      console.log('ℹ️  FooterConfig email уже обновлен:', footerConfig.email)
    } else {
      console.log('ℹ️  FooterConfig не найден, будет создан с новым email при первом запросе')
    }

    console.log('✅ Обновление email адресов завершено успешно!')
  } catch (error) {
    console.error('❌ Ошибка при обновлении:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateEmailAddresses()
  .then(() => {
    console.log('🎉 Скрипт выполнен успешно')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Критическая ошибка:', error)
    process.exit(1)
  })
