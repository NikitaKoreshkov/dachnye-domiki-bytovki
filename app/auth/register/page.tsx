'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Header from '@/components/Header'
import { Mail, Lock, User, Loader, Eye, EyeOff, ArrowLeft } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Состояния для верификации
  // const [verificationMode, setVerificationMode] = useState(false)
  // const [userId, setUserId] = useState('')
  // const [code, setCode] = useState('')
  // const [verifying, setVerifying] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    if (password.length < 8) {
      setError('Пароль должен быть не менее 8 символов')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Ошибка при регистрации')
        setLoading(false)
        return
      }

      // После успешной регистрации сразу логиним пользователя
      console.log('Регистрация успешна, выполняю вход...')
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/profile'
      })
      
      console.log('Результат входа после регистрации:', result)
      
      if (result?.ok) {
        // Вход успешен - делаем редирект на профиль
        console.log('Вход успешен, редирект на /profile')
        window.location.href = '/profile'
        return
      } else if (result?.error) {
        console.error('Ошибка входа после регистрации:', result.error)
        setError('Ошибка авторизации после регистрации. Попробуйте войти вручную.')
        setLoading(false)
      } else {
        // Нет результата - попробуем еще раз через секунду
        await new Promise(resolve => setTimeout(resolve, 1000))
        const sessionCheck = await fetch('/api/auth/session', { cache: 'no-store' })
        const sessionData = await sessionCheck.json()
        
        if (sessionData?.user) {
          window.location.href = '/profile'
        } else {
          setError('Регистрация успешна, но не удалось войти. Попробуйте войти вручную.')
          setLoading(false)
        }
      }
    } catch (err) {
      setError('Произошла ошибка при регистрации')
      setLoading(false)
    }
  }

  // const handleVerify = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setError('')

  //   if (code.length !== 6) {
  //     setError('Код должен содержать 6 цифр')
  //     return
  //   }

  //   setVerifying(true)

  //   try {
  //     const response = await fetch('/api/auth/verify', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ userId, code, email, password })
  //     })

  //     const data = await response.json()

  //     if (!response.ok) {
  //       setError(data.error || 'Неверный код подтверждения')
  //       setVerifying(false)
  //       return
  //     }

  //     // Автоматически логиним пользователя после успешной верификации
  //     const result = await signIn('credentials', {
  //       email,
  //       password,
  //       redirect: false,
  //     })

  //     if (result?.ok) {
  //       router.push('/profile')
  //     } else {
  //       router.push('/auth/signin?verified=true')
  //     }
  //   } catch (err) {
  //     setError('Произошла ошибка при проверке кода')
  //     setVerifying(false)
  //   }
  // }

  // const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value.replace(/\D/g, '').slice(0, 6)
  //   setCode(value)
  // }

  // if (verificationMode) {
  //   return (
  //     <>
  //       <Header />
  //       <div className="min-h-screen pt-16 relative overflow-hidden bg-gradient-to-br from-[#F5F1E8] via-[#E8DCC6] to-[#F5F1E8]">
  //         <div className="absolute inset-0 opacity-10">
  //           <div className="absolute top-20 left-20 w-72 h-72 bg-[#8B6F47] rounded-full blur-3xl animate-pulse"></div>
  //           <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#5D4E37] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
  //         </div>

  //         <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
  //           <div className="w-full max-w-md">
  //             <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl overflow-hidden">
  //               <div className="p-8 space-y-6">
  //                 <button
  //                   onClick={() => {
  //                     setVerificationMode(false)
  //                     setCode('')
  //                     setError('')
  //                   }}
  //                   className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
  //                 >
  //                   <ArrowLeft className="w-5 h-5" />
  //                   Назад
  //                 </button>

  //                 <div className="text-center mb-8">
  //                   <div className="w-16 h-16 bg-[#5D4E37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
  //                     <Mail className="w-8 h-8 text-[#5D4E37]" />
  //                   </div>
  //                   <h1 className="text-3xl font-bold text-gray-900 mb-2">Проверьте почту</h1>
  //                   <p className="text-gray-600">
  //                     Мы отправили 6-значный код на<br />
  //                     <span className="font-semibold text-gray-900">{email}</span>
  //                   </p>
  //                 </div>

  //                 {error && (
  //                   <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 text-sm">
  //                     {error}
  //                   </div>
  //                 )}

  //                 <form onSubmit={handleVerify} className="space-y-6">
  //                   <div>
  //                     <label className="block text-sm font-medium text-gray-700 mb-2">
  //                       Код подтверждения
  //                     </label>
  //                     <input
  //                       type="text"
  //                       required
  //                       value={code}
  //                       onChange={handleCodeChange}
  //                       className="w-full text-center text-3xl tracking-widest py-4 px-6 rounded-xl bg-white/50 backdrop-blur-sm border-2 border-gray-200 focus:border-[#5D4E37] focus:outline-none focus:ring-2 focus:ring-[#5D4E37]/20 transition-all font-mono"
  //                       placeholder="000000"
  //                       maxLength={6}
  //                       autoComplete="off"
  //                     />
  //                     <p className="text-xs text-gray-500 mt-2 text-center">
  //                       Код действителен в течение 15 минут
  //                     </p>
  //                   </div>

  //                   <button
  //                     type="submit"
  //                     disabled={verifying || code.length !== 6}
  //                     className="w-full py-3.5 bg-[#5D4E37] text-white font-bold rounded-xl text-base hover:bg-[#6D5D4A] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#5D4E37]/30"
  //                   >
  //                     {verifying ? (
  //                       <>
  //                         <Loader className="w-5 h-5 animate-spin" />
  //                         Проверка...
  //                       </>
  //                     ) : (
  //                       'Подтвердить'
  //                     )}
  //                   </button>
  //                 </form>

  //                 <div className="text-center text-sm text-gray-600">
  //                   Не получили код?{' '}
  //                   <button
  //                     onClick={async () => {
  //                       // Пересоздаем код
  //                       const response = await fetch('/api/auth/register', {
  //                         method: 'POST',
  //                         headers: { 'Content-Type': 'application/json' },
  //                         body: JSON.stringify({ name, email, password })
  //                       })
  //                       const data = await response.json()
  //                       if (response.ok) {
  //                         setUserId(data.userId)
  //                         setCode('')
  //                         setError('')
  //                         alert('Новый код отправлен на вашу почту')
  //                       }
  //                     }}
  //                     className="font-semibold text-[#5D4E37] hover:text-[#6D5D4A] underline underline-offset-2 transition-colors"
  //                   >
  //                     Отправить повторно
  //                   </button>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </>
  //     )
  // }

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
              
              <div className="relative p-8 space-y-5">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-black text-gray-900 mb-2 font-inter">Создать аккаунт</h1>
                  <p className="text-gray-600">Начните строить свой дом мечты</p>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 text-sm animate-shake">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Имя
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#5D4E37] transition-colors" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border-2 border-gray-200 focus:border-[#5D4E37] focus:outline-none focus:ring-2 focus:ring-[#5D4E37]/20 transition-all"
                        placeholder="Ваше имя"
                      />
                    </div>
                  </div>

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

                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Подтвердите пароль
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#5D4E37] transition-colors" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/50 backdrop-blur-sm border-2 border-gray-200 focus:border-[#5D4E37] focus:outline-none focus:ring-2 focus:ring-[#5D4E37]/20 transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                        Регистрация...
                      </>
                    ) : (
                      'Зарегистрироваться'
                    )}
                  </button>
                </form>

                <div className="text-center text-sm text-gray-600 mt-6">
                  Уже есть аккаунт?{' '}
                  <a href="/auth/signin" className="font-semibold text-[#5D4E37] hover:text-[#6D5D4A] underline underline-offset-2 transition-colors">
                    Войти
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
