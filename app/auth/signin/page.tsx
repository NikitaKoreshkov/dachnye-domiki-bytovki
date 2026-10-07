'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Mail, Lock, Loader, Eye, EyeOff } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Начало входа...')
      // Таймаут 8 секунд
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 8000)
      )

      // Используем redirect: false чтобы обработать ошибки
      // Затем сами делаем редирект после успешного входа
      const result = await Promise.race([
        signIn('credentials', {
          email,
          password,
          redirect: false,
          callbackUrl: '/profile'
        }),
        timeoutPromise
      ]) as any
      
      console.log('SignIn result:', result)

      if (result?.error) {
        const errorMsg = result.error === 'CredentialsSignin' 
          ? 'Неверный email или пароль' 
          : result.error
        setError(errorMsg)
        setLoading(false)
        return
      }

      if (result?.ok) {
        // Вход успешен - делаем редирект на профиль
        window.location.href = '/profile'
        return
      }
      
      // Если нет результата - неизвестная ошибка
      setError('Ошибка входа. Попробуйте еще раз.')
      setLoading(false)
    } catch (err: any) {
      console.error('SignIn error:', err)
      const errorMsg = err?.message?.includes('Timeout')
        ? 'Превышено время ожидания (8 сек). Проверьте подключение или попробуйте еще раз.'
        : 'Произошла ошибка при входе. Попробуйте обновить страницу.'
      setError(errorMsg)
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: '/admin' })
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-16 relative overflow-hidden bg-gradient-to-br from-[#F5F1E8] via-[#E8DCC6] to-[#F5F1E8]">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#8B6F47] rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#5D4E37] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Glass Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl overflow-hidden">
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
              
              <div className="relative p-8 space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-black text-gray-900 mb-2 font-inter">Добро пожаловать!</h1>
                  <p className="text-gray-600">Войдите в свой личный кабинет</p>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 text-sm animate-shake">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#5D4E37] transition-colors" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border-2 border-gray-200 focus:border-[#5D4E37] focus:outline-none focus:ring-2 focus:ring-[#5D4E37]/20 transition-all"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Пароль
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#5D4E37] transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/50 backdrop-blur-sm border-2 border-gray-200 focus:border-[#5D4E37] focus:outline-none focus:ring-2 focus:ring-[#5D4E37]/20 transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#5D4E37] text-white font-bold rounded-xl text-base hover:bg-[#6D5D4A] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#5D4E37]/30"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Вход...
                      </>
                    ) : (
                      'Войти'
                    )}
                  </button>
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/10 backdrop-blur-sm text-gray-500">или</span>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-600 mt-6">
                  Нет аккаунта?{' '}
                  <a href="/auth/register" className="font-semibold text-[#5D4E37] hover:text-[#6D5D4A] underline underline-offset-2 transition-colors">
                    Зарегистрироваться
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </>
  )
}
