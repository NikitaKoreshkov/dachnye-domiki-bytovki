'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import GlassModal from './GlassModal'
import OTPInput from './OTPInput'
import { Mail, Lock, Loader } from 'lucide-react'

type Tab = 'password' | 'otp' | 'google'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Неверный email или пароль')
      } else {
        onClose()
        window.location.reload()
      }
    } catch (err) {
      setError('Произошла ошибка при входе')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOTP = async () => {
    if (!email) {
      setError('Введите email')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Не удалось отправить код')
      } else {
        setOtpSent(true)
      }
    } catch (err) {
      setError('Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPLogin = async (code: string) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        await signIn('credentials', {
          email: data.user.email,
          redirect: true,
        })
      }
    } catch (err) {
      setError('Произошла ошибка при входе')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/' })
  }

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Войти в личный кабинет">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'password'
                ? 'bg-[#6B8E6B] text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Email / Пароль
          </button>
          <button
            onClick={() => setActiveTab('otp')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'otp'
                ? 'bg-[#6B8E6B] text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            По коду
          </button>
          <button
            onClick={() => setActiveTab('google')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'google'
                ? 'bg-[#6B8E6B] text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Google
          </button>
        </div>

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-[#6B8E6B] transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-[#6B8E6B] transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#6B8E6B] hover:bg-[#5D7A5D] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Войти'}
            </button>

            <a href="#" className="block text-center text-sm text-white/70 hover:text-[#6B8E6B] transition-colors">
              Забыли пароль?
            </a>
          </form>
        )}

        {/* OTP Tab */}
        {activeTab === 'otp' && (
          <div className="space-y-4">
            {!otpSent ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-[#6B8E6B] transition-colors"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full py-3 bg-[#6B8E6B] hover:bg-[#5D7A5D] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Отправить код'}
                </button>
              </>
            ) : (
              <>
                <p className="text-white/70 text-center text-sm">
                  Отправили код на {email}
                </p>
                <OTPInput onComplete={handleOTPLogin} error={error} />
                <button
                  onClick={() => setOtpSent(false)}
                  className="text-sm text-white/70 hover:text-[#6B8E6B] transition-colors"
                >
                  Изменить email
                </button>
              </>
            )}
          </div>
        )}

        {/* Google Tab */}
        {activeTab === 'google' && (
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Войти через Google
          </button>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <p className="text-center text-sm text-white/50">
          Нет аккаунта?{' '}
          <a href="/auth/register" className="text-[#6B8E6B] hover:underline">
            Зарегистрироваться
          </a>
        </p>
      </div>
    </GlassModal>
  )
}

