/**
 * The single place this app's editable content is defined.
 *
 * `prisma/seed.ts`, the public read routes, the admin write routes and the
 * in-memory demo store all take their defaults from here. Before that, each of
 * the 15 CMS blocks had its fallback text written twice, once in
 * `/api/<block>` and once in `/api/admin/<block>`, and the two copies had
 * drifted: the calculator offered three house types to visitors and two to the
 * admin, and the WhatsApp message template was a full text in one file and the
 * string `Шаблон MAX` in the other.
 */

export const BRAND = {
  name: 'Дачные-Домики-Бытовки',
  legalName: 'ИП ГЮЛЬАХМЕДОВ АТАЙ ЭДИСОНОВИЧ',
  inn: '055000493170',
  phone: '+7 (495) 023-82-15',
  email: 'info@dachnye-domiki-bytovki.ru',
  region: 'Москва',
  siteUrl: 'https://дачные-домики-бытовки.рф',
  address: {
    line1: '108811, г. Москва,',
    line2: 'Московский п., ул. Картмазовские пруды,',
    line3: 'д. 2, корп. 3, кв. 474',
  },
}

export const HERO_DEFAULT = {
  heroImage: '/images/house.jpg',
  title: 'Ваш каркасный дом мечты',
  subtitle: 'Под ключ. Быстро. Надёжно. С гарантией качества.',
}

export const HEADER_DEFAULT = {
  logoText: BRAND.name,
  logoImage: null,
  showLogoText: true,
}

export const FOOTER_DEFAULT = {
  companyName: BRAND.name,
  companyDescription: 'Строим качественные каркасные дома под ключ. Быстро, надежно, с гарантией качества.',
  whatsappUrl: 'https://max.ru/u/f9LHodD0cOJ11mRNBmwv4GMET8TQOYXsn4AglpOBhEGg5JpR7w9zmuv4jZ8',
  whatsappText:
    `🏠 ${BRAND.name}\n\nЗдравствуйте! Хочу узнать больше о строительстве каркасных домов.\n\nГотов(а) ответить на ваши вопросы!`,
  phone: BRAND.phone,
  email: BRAND.email,
  addressLine1: BRAND.address.line1,
  addressLine2: BRAND.address.line2,
  addressLine3: BRAND.address.line3,
  workingHoursLine1: 'Пн-Пт: 9:00 - 18:00',
  workingHoursLine2: 'Сб-Вс: 10:00 - 16:00',
  newsletterTitle: 'Новости и акции',
  newsletterDescription: 'Подпишитесь на рассылку и получайте информацию о новых проектах и специальных предложениях',
  copyright: `© 2025 ${BRAND.name}. Все права защищены.`,
  ip: `ИП: ${BRAND.legalName.replace('ИП ', '')}`,
  inn: `ИНН: ${BRAND.inn}`,
  legalAddress: `Юридический адрес: 108811, РОССИЯ, Г МОСКВА, МОСКОВСКИЙ П, УЛ КАРТМАЗОВСКИЕ ПРУДЫ, Д 2, КОРП 3. КВ 474`,
}

export const ADVANTAGES_DEFAULT = {
  title: 'Наши преимущества',
  subtitle: 'Почему клиенты выбирают именно нас для строительства своего дома',
  items: [
    { id: 'fast-build', title: 'Быстрое строительство', description: 'От 8 до 20 дней в зависимости от сложности проекта' },
    { id: 'quality-materials', title: 'Качественные материалы', description: 'Используем только сертифицированные материалы от проверенных поставщиков' },
    { id: 'warranty', title: 'Гарантия 5 лет', description: 'Полная гарантия на все работы и материалы в течение 5 лет' },
    { id: 'turnkey', title: 'Под ключ', description: 'Полный цикл работ от проекта до сдачи готового дома' },
    { id: 'experience', title: 'Опыт 10+ лет', description: 'Более 10 лет успешной работы в сфере строительства' },
    { id: 'support', title: 'Техподдержка 24/7', description: 'Круглосуточная поддержка и консультации по всем вопросам' },
  ],
}

export const PROCESS_STEPS_DEFAULT = {
  title: 'Как мы работаем',
  subtitle: 'Простой и понятный процесс от проекта до готового дома',
  steps: [
    { id: 1, title: 'Выбор проекта', description: 'Вы выбираете проект или заказываете индивидуальный' },
    { id: 2, title: 'Договор и смета', description: 'Подписываем договор и согласовываем смету' },
    { id: 3, title: 'Производство', description: 'Производство и доставка материалов' },
    { id: 4, title: 'Монтаж', description: 'Монтаж и внутренние работы' },
    { id: 5, title: 'Сдача и гарантия', description: 'Приём работы и гарантия' },
  ],
}

export const CALCULATOR_WHATSAPP_TEMPLATE = `🏠 РАСЧЁТ СТОИМОСТИ ДОМА

📋 Параметры:
• Тип дома: {{houseType}}
• Площадь: {{area}} м²

🎨 Отделка:
{{finishing}}

✨ Дополнительные опции:
{{options}}

💰 Предварительная стоимость:
{{price}}

📞 Свяжитесь со мной для получения точного расчёта и консультации!`

export const CALCULATOR_DEFAULT = {
  houseTypes: [
    { id: 'frame', name: 'Каркасный', basePrice: 5300, image: '/images/house-frame.jpg' },
    { id: 'timber', name: 'Брусовой', basePrice: 7300, image: '/images/house-timber.jpg' },
    { id: 'modular', name: 'Модульный', basePrice: 8400, image: '/images/house-modular.jpg' },
  ],
  finishingOptions: [
    { id: 'none', name: 'Без отделки', multiplier: 0 },
    { id: 'basic', name: 'Чистовая отделка', multiplier: 0.3 },
    { id: 'euro', name: 'Евро отделка', multiplier: 0.5 },
  ],
  additionalOptions: [
    { id: 'terrace', name: 'Терраса', price: 31500 },
    { id: 'attic', name: 'Мансарда', price: 42000 },
    { id: 'veranda', name: 'Веранда', price: 21000 },
    { id: 'foundation', name: 'Фундамент', price: 63000 },
  ],
  stepTexts: {
    step1Title: 'Выберите тип дома',
    step2Title: 'Укажите площадь дома',
    step3Title: 'Выберите тип отделки',
    step4Title: 'Дополнительные опции',
  },
  areaSettings: { minArea: 20, maxArea: 120, defaultArea: 50 },
  formula: 'basePrice = house.basePrice * area; basePrice += finishingSum; basePrice += optionsSum; return Math.round(basePrice);',
  whatsappTemplate: CALCULATOR_WHATSAPP_TEMPLATE,
  estimateTemplate: '',
}

export const CATALOG_SEO_DEFAULT = {
  title: 'Каркасные дома под ключ в России',
  content: `Наша компания «${BRAND.name}» специализируется на строительстве каркасных домов под ключ по всей России. Мы предлагаем широкий выбор готовых проектов домов различной площади и планировки. Строительство каркасных домов — это современная технология, позволяющая построить качественный и энергоэффективный дом в кратчайшие сроки.

В нашем каталоге представлены проекты каркасных домов от 60 до 250 м², включая одноэтажные и двухэтажные варианты. Все дома строятся по канадской технологии с использованием качественных материалов. Мы работаем в Москве, Санкт-Петербурге, Нижнем Новгороде и других городах России.

Каждый проект включает детальную планировку, современные инженерные системы и может быть адаптирован под ваши потребности. Строительство домов под ключ включает все этапы: от фундамента до финишной отделки. Гарантия качества на все работы — 5 лет.`,
}

export const METADATA_DEFAULT = {
  faviconUrl: null,
  appleTouchIcon: null,
  siteTitle: `Дачные домики под ключ | ${BRAND.name}`,
  siteDescription: 'Строительство дачных домиков под ключ в Москве. Каркасные дома от 205 000 руб. Проект, доставка, монтаж и отделка.',
  siteKeywords: 'дачные домики под ключ, каркасные дома, строительство домов, Москва, Россия, дом под ключ, дача, коттедж',
  ogImage: '/images/house.jpg',
}

export const REVIEWS_CONFIG_DEFAULT = {
  title: 'Реальные фото и отзывы наших клиентов',
  description: 'Мы собрали часть отзывов — чтобы вы могли увидеть, как строим дома на практике.\n\nОстальные отзывы можно посмотреть по запросу или в наших соцсетях.',
}

export const CONTRACT_TEMPLATE_DEFAULT = {
  filePath: null,
}
