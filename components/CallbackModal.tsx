'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface CallbackModalProps {
  isOpen: boolean
  onClose: () => void
}

const STORAGE_KEY = 'dachnye_domiki_bytovki_callback_data'

export default function CallbackModal({ isOpen, onClose }: CallbackModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Загружаем сохраненные данные при открытии модального окна
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY)
        if (savedData) {
          const parsed = JSON.parse(savedData)
          if (parsed.name && typeof parsed.name === 'string') {
            setName(parsed.name)
          }
          if (parsed.phone && typeof parsed.phone === 'string') {
            setPhone(parsed.phone)
          }
        }
      } catch (error) {
        console.error('Error loading saved callback data:', error)
      }
    }
  }, [isOpen])

  // Блокируем скролл страницы при открытом модальном окне
  useEffect(() => {
    if (typeof window === 'undefined') return
    const body = document.body
    if (isOpen) {
      body.style.overflow = 'hidden'
    } else {
      body.style.overflow = ''
    }
    return () => {
      body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !phone.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Callback response:', data)
        
        // Сохраняем данные в localStorage для следующего раза
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
              name: name.trim(),
              phone: phone.trim()
            }))
          } catch (error) {
            console.error('Error saving callback data:', error)
          }
        }
        
        setIsSuccess(true)
        // НЕ очищаем поля, чтобы данные остались для следующего раза
        // Закрываем модальное окно через 3 секунды
        setTimeout(() => {
          setIsSuccess(false)
          onClose()
        }, 3000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Callback error:', response.status, errorData)
        alert(`Произошла ошибка: ${errorData.error || 'Попробуйте позже'}`)
      }
    } catch (error) {
      console.error('Error submitting callback request:', error)
      alert('Произошла ошибка. Попробуйте позже.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 font-inter">
            Заказать звонок
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Спасибо за заявку!
              </h3>
              <p className="text-gray-600">
                Наш менеджер свяжется с вами в ближайшее время
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Ваше имя
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D4E37] focus:border-transparent outline-none transition-all"
                  placeholder="Введите ваше имя"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Номер телефона
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D4E37] focus:border-transparent outline-none transition-all"
                  placeholder="+7 (___) ___-__-__"
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || !phone.trim()}
                className="w-full py-3 bg-[#5D4E37] hover:bg-[#6D5D4A] text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

