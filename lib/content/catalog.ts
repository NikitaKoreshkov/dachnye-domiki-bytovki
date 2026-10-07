import projectsFixture from '../../data/projects.json'

/**
 * The catalogue itself: projects, reviews, FAQ, and the option lists the product
 * page offers. `data/projects.json` stays the fixture the seed reads, so the
 * demo store and PostgreSQL are built from the same 19 rows.
 */

export type ProjectFixture = {
  id: string
  title: string
  area: number
  priceFrom: number
  priceTo?: number | null
  floors: number
  material: string
  buildTime: number
  completion: string
  region: string
  image: string
  images: string[]
  tags: string[]
  hasTerrasse: boolean
  hasBath: boolean
  hasGarage: boolean
  features: string[]
  description?: string | null
  advantages?: string[]
  specs?: unknown
}

export const PROJECTS: ProjectFixture[] = (projectsFixture as ProjectFixture[]).map((project, index) => ({
  ...project,
  // the client shot one render for the whole catalogue; the crops below let 19
  // projects look like 19 houses without inventing photography
  image: project.image === '/images/house.jpg' ? projectImage(index) : project.image,
  images: [projectImage(index), projectImage(index + 3), projectImage(index + 5)],
}))

/** Eight views of the same house, cycled across the catalogue and the reviews. */
export function projectImage(index: number): string {
  return `/images/house-${(index % 8) + 1}.jpg`
}

export type ReviewFixture = { name: string; city: string; text: string; image: string; date: Date }

export const REVIEWS: ReviewFixture[] = [
  {
    name: 'Александр Петров',
    city: 'Москва',
    text: 'Очень доволен результатом! Дом построили за 12 дней, как и обещали. Качество отличное, все материалы качественные. Рекомендую!',
    image: projectImage(0),
    date: new Date('2024-03-15'),
  },
  {
    name: 'Мария Козлова',
    city: 'Санкт-Петербург',
    text: 'Спасибо за профессиональную работу! Строители очень аккуратные, все сделали чисто и быстро. Дом получился именно таким, как мы хотели.',
    image: projectImage(1),
    date: new Date('2024-02-28'),
  },
  {
    name: 'Дмитрий Смирнов',
    city: 'Екатеринбург',
    text: 'Заказывал дом "Лесной" 6x8. Остался очень доволен! Цена соответствует качеству, сроки соблюдены. Буду рекомендовать друзьям.',
    image: projectImage(2),
    date: new Date('2024-02-10'),
  },
  {
    name: 'Елена Волкова',
    city: 'Новосибирск',
    text: 'Отличная команда! Все вопросы решались быстро, менеджер всегда на связи. Дом получился очень уютным и теплым.',
    image: projectImage(3),
    date: new Date('2024-02-05'),
  },
  {
    name: 'Игорь Лебедев',
    city: 'Казань',
    text: 'Построили каркасный дом под ключ. Все этапы контролировались, строители работали профессионально. Дом теплый, уютный, все продумано до мелочей. Очень рекомендую компанию!',
    image: projectImage(4),
    date: new Date('2024-01-22'),
  },
  {
    name: 'Анна Соколова',
    city: 'Нижний Новгород',
    text: 'Строительство прошло без задержек, качество материалов превосходное. Особенно понравилось, что учли все наши пожелания. Дом уже год стоит, никаких нареканий нет!',
    image: projectImage(5),
    date: new Date('2024-01-18'),
  },
  {
    name: 'Сергей Кузнецов',
    city: 'Краснодар',
    text: 'Выбрали проект дома 8x10. Построили быстро, качественно. Отделка тоже на высоте. Соседи уже спрашивают, кто строил. Спасибо за отличную работу!',
    image: projectImage(6),
    date: new Date('2024-01-12'),
  },
  {
    name: 'Ольга Морозова',
    city: 'Челябинск',
    text: 'Очень довольна результатом! Дом построен с учетом всех современных технологий. Зимой тепло, летом прохладно. Менеджер сопровождал на всех этапах. Рекомендую!',
    image: projectImage(7),
    date: new Date('2024-01-08'),
  },
  {
    name: 'Владимир Новиков',
    city: 'Самара',
    text: 'Заказывали дачный домик. Построили точно в срок, даже быстрее. Качество работ отличное, цена справедливая. Сейчас отдыхаем каждые выходные в своем доме!',
    image: projectImage(2),
    date: new Date('2024-01-03'),
  },
]

export type FaqFixture = { question: string; answer: string; order: number }

export const FAQ: FaqFixture[] = [
  {
    question: 'Сколько времени занимает строительство дома?',
    answer: 'Время строительства зависит от сложности проекта и составляет от 8 до 20 дней. Каркасные дома строятся быстрее всего - за 8-12 дней, брусовые - за 12-15 дней, модульные - за 15-20 дней.',
    order: 1,
  },
  {
    question: 'Какие материалы используются в строительстве?',
    answer: 'Мы используем только сертифицированные материалы: качественную древесину, утеплители, кровельные материалы от проверенных поставщиков. Все материалы имеют соответствующие сертификаты качества.',
    order: 2,
  },
  {
    question: 'Предоставляете ли вы гарантию на построенные дома?',
    answer: 'Да, мы предоставляем полную гарантию 5 лет на все работы и материалы. Гарантия покрывает конструкцию, отделку и все инженерные системы.',
    order: 3,
  },
  {
    question: 'Можно ли изменить проект под свои потребности?',
    answer: 'Конечно! Мы предлагаем как готовые типовые проекты, так и индивидуальное проектирование. Наши архитекторы помогут адаптировать любой проект под ваши требования.',
    order: 4,
  },
  {
    question: 'Входит ли в стоимость фундамент?',
    answer: 'Фундамент входит в базовую стоимость только для некоторых проектов. В большинстве случаев фундамент рассчитывается отдельно в зависимости от типа грунта и выбранного типа фундамента.',
    order: 5,
  },
  {
    question: 'Как происходит оплата за работу?',
    answer: 'Оплата происходит поэтапно: 30% при подписании договора, 40% при начале строительства, 30% при сдаче объекта. Возможны индивидуальные условия оплаты.',
    order: 6,
  },
  {
    question: 'Нужно ли получать разрешения на строительство?',
    answer: 'Для дачных домов площадью до 100 м² разрешение на строительство не требуется. Мы поможем оформить все необходимые документы для регистрации дома.',
    order: 7,
  },
  {
    question: 'Можно ли строить зимой?',
    answer: 'Да, каркасные дома можно строить круглый год. Современные технологии позволяют вести строительные работы при температуре до -15°C без потери качества.',
    order: 8,
  },
  {
    question: 'Предоставляете ли вы услуги по подключению коммуникаций?',
    answer: 'Да, мы оказываем полный спектр услуг по подключению электричества, водоснабжения, канализации и отопления. Все работы выполняются квалифицированными специалистами.',
    order: 9,
  },
  {
    question: 'Что делать, если возникли проблемы после сдачи дома?',
    answer: 'Наша служба поддержки работает 24/7. При возникновении любых проблем мы оперативно их решаем в рамках гарантийных обязательств. Звоните нам в любое время!',
    order: 10,
  },
]

type Option = { id: string; label: string; price: number; isDefault: boolean }

export type ProjectOptions = {
  finishing: Option[]
  insulation: Option[]
  floor: Option[]
  foundation: Option[]
}

/** The option panels on the product page, in the shape the column stores. */
export const PROJECT_OPTIONS_DEFAULT: ProjectOptions = {
  finishing: [
    { id: 'vagonka', label: 'Вагонка', price: 0, isDefault: true },
    { id: 'imitation', label: 'Имитация бруса', price: 25000, isDefault: false },
  ],
  insulation: [
    { id: '100mm', label: '100мм', price: 0, isDefault: true },
    { id: '150mm', label: '150мм', price: 80000, isDefault: false },
  ],
  floor: [
    { id: 'osb', label: 'ОСБ', price: 0, isDefault: true },
    { id: 'shpunt', label: 'Шпунтованный 28мм', price: 19000, isDefault: false },
  ],
  foundation: [
    { id: 'blocks', label: 'Фундаментные блоки (40x20x20)', price: 0, isDefault: true },
    { id: 'piles', label: 'Сваи металлические', price: 43200, isDefault: false },
  ],
}

/**
 * The filter rail is data: `{ key, label, type, options }` blocks plus a layout.
 * An empty table used to render no filters at all, so the shipped default is the
 * set the catalogue actually supports.
 */
export const CATALOG_FILTERS_DEFAULT = {
  blocks: [
    { key: 'price', label: 'Цена', type: 'range', min: 0, max: 30000000 },
    { key: 'area', label: 'Площадь, м²', type: 'range', min: 20, max: 250 },
    {
      key: 'floors',
      label: 'Этажность',
      type: 'checkbox',
      options: [
        { value: '1', label: 'Одноэтажные' },
        { value: '2', label: 'Двухэтажные' },
      ],
    },
    {
      key: 'material',
      label: 'Материал',
      type: 'checkbox',
      options: [
        { value: 'каркасный', label: 'Каркасный' },
        { value: 'брус', label: 'Брус' },
        { value: 'модульный', label: 'Модульный' },
      ],
    },
    {
      key: 'features',
      label: 'Особенности',
      type: 'checkbox',
      options: [
        { value: 'утепление', label: 'Утепление' },
        { value: 'отделка', label: 'Отделка' },
        { value: 'терраса', label: 'Терраса' },
        { value: 'баня', label: 'Баня' },
        { value: 'гараж', label: 'Гараж' },
      ],
    },
  ],
  layout: ['price', 'area', 'floors', 'material', 'features'],
}
