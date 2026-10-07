'use client'

import Link from 'next/link'
import Image from 'next/image'
import { signOut, useSession } from 'next-auth/react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useFavoritesCompare } from '@/components/providers/FavoritesCompareProvider'
import { BRAND } from '@/lib/content/configs'

type Saved = { id: string; slug?: string; title: string; image: string; priceFrom: number; area: number; material?: string }

function price(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽'
}

function SavedCard({ item, onRemove, label }: { item: Saved; onRemove: () => void; label: string }) {
  const href = `/project/${item.slug || item.id}`
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
      <Link href={href} className="relative aspect-[4/3] bg-gray-100 block">
        <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
      </Link>
      <div className="p-5 flex flex-col gap-3 flex-grow">
        <Link href={href} className="font-semibold text-gray-900 hover:text-[#5D4E37] transition-colors line-clamp-2">
          {item.title}
        </Link>
        <div className="text-sm text-gray-600">
          {item.area} м² · {item.material}
        </div>
        <div className="mt-auto font-bold text-gray-900">{price(item.priceFrom)}</div>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors text-left"
        >
          {label}
        </button>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const { favoritesList = [], compareList = [], removeFavorite, removeCompare } = useFavoritesCompare() ?? {}

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-40 pb-40 text-center text-gray-500">Загрузка…</div>
        <Footer />
      </main>
    )
  }

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-32 pb-32 max-w-lg mx-auto px-4 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Нужен вход в аккаунт</h1>
          <p className="mt-3 text-gray-600">
            Избранное и сравнение проектов сохраняются по адресу электронной почты. Войдите, чтобы увидеть их.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex mt-8 px-6 py-3 rounded-lg bg-[#5D4E37] text-white font-semibold hover:bg-[#4a3e2c] transition-colors"
          >
            Войти
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-28 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-8 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Мой профиль</h1>
            <p className="mt-2 text-gray-600">
              {session.user.name || session.user.email}
              {' · '}
              {session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN' ? 'доступ к редактированию контента' : 'сохранённые проекты'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-white transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Избранное{' '}
            <span className="text-gray-500 font-normal">({favoritesList.length})</span>
          </h2>
          {favoritesList.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoritesList.map((item: Saved) => (
                <SavedCard
                  key={item.id}
                  item={item}
                  label="Убрать из избранного"
                  onRemove={() => removeFavorite?.(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
              <p className="text-gray-600">Пока ничего не сохранено.</p>
              <Link href="/catalog" className="inline-block mt-4 text-[#5D4E37] font-semibold hover:underline">
                Выбрать проект в каталоге
              </Link>
            </div>
          )}
        </section>

        <section className="mt-16">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Сравнение{' '}
            <span className="text-gray-500 font-normal">({compareList.length})</span>
          </h2>
          {compareList.length ? (
            <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200">
                    <th className="px-6 py-4 font-medium">Проект</th>
                    <th className="px-6 py-4 font-medium">Площадь</th>
                    <th className="px-6 py-4 font-medium">Материал</th>
                    <th className="px-6 py-4 font-medium">Цена от</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {compareList.map((item: Saved) => (
                    <tr key={item.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <Link href={`/project/${item.slug || item.id}`} className="hover:text-[#5D4E37] transition-colors">
                          {item.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{item.area} м²</td>
                      <td className="px-6 py-4 text-gray-700">{item.material}</td>
                      <td className="px-6 py-4 text-gray-900 font-semibold">{price(item.priceFrom)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => removeCompare?.(item.id)}
                          className="text-gray-500 hover:text-red-600 transition-colors"
                        >
                          Убрать
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">Добавьте два-три проекта из каталога, чтобы сравнить их по площади и цене.</p>
          )}
        </section>

        <p className="mt-16 text-sm text-gray-500">
          Вопросы по сохранённым проектам: {BRAND.phone} или {BRAND.email}.
        </p>
      </div>
      <Footer />
    </main>
  )
}
