# Дачные-Домики-Бытовки — Каркасные дома под ключ

Современный e-commerce сайт для компании по строительству каркасных дачных домиков и бытовок.

## 🚀 Особенности

- **Полнофункциональный каталог проектов** с фильтрацией по параметрам
- **Интерактивный калькулятор стоимости** с пошаговым расчетом
- **Адаптивный дизайн** для мобильных и десктопов
- **SEO оптимизация** с метаданными и структурированными данными
- **CMS админ-панель** для управления контентом
- **Демо-режим работы без базы данных** (in-memory store)
- **Загрузка документов в PDF** через puppeteer
- **Интеграция с WhatsApp** для сбора лидов

## 🛠 Технологии

- **Next.js 14** (App Router, Server Components)
- **TypeScript** с strict режимом
- **Tailwind CSS** 3.x + Framer Motion
- **Prisma ORM** + PostgreSQL
- **NextAuth.js** для авторизации
- **Argon2** для хеширования паролей (lazy import для Vercel)

## ⚡ Производительность

- Встроенный демо-режим для запуска без BDD
- Оптимизированные изображения (AI-generated renders, cropped variants)
- Force-dynamic API routes для реальных данных
- Rate limiting на все публичные формы
- Input sanitization для безопасности

## 📦 Быстрый старт

### Предварительные требования

- Node.js 18+
- npm или yarn
- PostgreSQL (опционально, есть демо-режим)

### Установка

```bash
cd dachnye-domiki-bytovki
npm install
```

### Демо-режим (без БД)

Проект работает сразу после установки - используется in-memory Prisma client:

```bash
npm run dev
```

Откройте http://localhost:3000

### Production setup

```bash
# Настройка базы данных
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
npm run db:push
npm run db:generate
npm run db:seed

# Сборка и запуск
npm run build
npm start
```

**Логин админа после seed:** `a@gmail.com` / `123`

## 🏷 Бренд

**Название:** Дачные-Домики-Бытовки  
**Директор:** ИП ГЮЛЬАХМЕДОВ АТАЙ ЭДИСОНОВИЧ  
**ИНН:** 055000493170  
**Телефон:** +7 (495) 023-82-15  
**Email:** info@dachnye-domiki-bytovki.ru  
**Регион:** Москва  
**Домен:** дачные-домики-бытовки.рф (xn-----6kcgfhcg3aadtevltg5e6dydk.xn--p1ai)

## 📁 Структура проекта

```
dachnye-domiki-bytovki/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── admin/        # Protected admin routes
│   │   └── [public]      # Public read endpoints
│   ├── catalog/          # Product catalogue page
│   ├── project/          # Single product detail
│   └── (public)/         # Landing pages & sections
├── components/           # React components
│   ├── content/          # CMS block components
│   └── catalog/          # Catalog UI components
├── lib/
│   ├── content/          # Content factory + mappers
│   ├── api.ts           # Unified error handling
│   ├── passwords.ts     # Lazy argon2 loader
│   ├── demo.ts          # In-memory Prisma store
│   └── rate-limit.ts    # Public form protection
├── prisma/
│   └── schema.prisma    # 26 models, seeded fixtures
└── public/images/       # Hero render + 11 crop variants
```

## 🔐 Безопасность

- Lazy loading argon2 (избегает native module failures на Vercel)
- Timing-safe comparison для паролей и API keys
- Rate limiting на all public forms (WhatsAppLead, Newsletter, Calculator)
- HTML sanitization (blocks script, iframe, object, embed)
- Error response containment (serverError() without request details)
- RequireAdmin()/RequireSuperAdmin() guards on all mutations

## 🌐 Деплой

### Vercel

```bash
vercel deploy --prod
```

Переменные окружения:
- `DATABASE_URL` (Production)
- `NEXTAUTH_SECRET` (min 32 chars)
- `NEXTAUTH_URL` (production domain)
- `SMTP_*` (optional for email)

### Netlify/Any Static Host

```bash
npm run build
# Deploy .next/ output
```

## 🧪 Тестирование

```bash
# Type check
npx tsc --noEmit

# Build test
npm run build

# Run production build
npm start
```

## English

### Dacha Houses & Garden Cottages — Custom Modular Home Builder

Modern e-commerce platform for construction company specializing in turnkey frame houses and garden cottages.

**Key Features:**
- Full product catalog with filtering (price, area, build time, features)
- Interactive cost calculator with step-by-step pricing
- Responsive design for mobile and desktop
- SEO optimization with structured data
- CMS admin panel for content management
- Demo mode (in-memory Prisma store works without database)
- PDF document generation via puppeteer
- WhatsApp integration for lead capture

**Brand Information:**
- **Company:** Дачные-Домики-Бытовки
- **Director:** Individual Entrepreneur GYULAKHMEDOV ATAY EDISONOVICH
- **INN:** 055000493170
- **Phone:** +7 (495) 023-82-15
- **Email:** info@dachnye-domiki-bytovki.ru
- **Region:** Moscow
- **Domain:** дачные-домики-бытовки.рф (xn-----6kcgfhcg3aadtevltg5e6dydk.xn--p1ai)

---

Коротко по-русски: современный сайт для продажи каркасных домов с каталогом, калькулятором стоимости и админ-панелью. Работает без базы данных в демо-режиме. Развёрнут на Vercel.

## © Права

© 2026 ИП ГЮЛЬАХМЕДОВ АТАЙ ЭДИСОНОВИЧ. Все права защищены.

- ИНН: 055000493170
- Адрес: 108811, г. Москва, Московский п., ул. Картмазовские пруды, д. 2, корп. 3, кв. 474

Все торговые марки и бренды принадлежат их правообладателям.

## 📄 Лицензия

MIT License

---

**Дачные-Домики-Бытовки** — ваш каркасный дом мечты под ключ! 🏠✨
