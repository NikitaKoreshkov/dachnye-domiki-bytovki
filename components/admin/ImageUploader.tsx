'use client'

import { useState, useRef, useId } from 'react'

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  placeholder?: string
}

export default function ImageUploader({ value, onChange, placeholder = 'URL или загрузить файл' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadId = useId()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Показываем превью
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Загружаем на сервер
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        if (data.url) {
          onChange(data.url)
          setPreview(null) // Очищаем превью после успешной загрузки
        } else {
          alert('Ошибка: сервер не вернул URL файла')
          setPreview(null)
        }
      } else {
        try {
          const error = await res.json()
          console.error('Upload error:', error)
          alert(error.error || error.details || `Ошибка загрузки (${res.status})`)
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          alert(`Ошибка загрузки файла. Статус: ${res.status}`)
        }
        setPreview(null)
      }
    } catch (error: any) {
      console.error('Upload request error:', error)
      alert(`Ошибка загрузки файла: ${error.message || 'Неизвестная ошибка'}`)
      setPreview(null)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          id={uploadId}
        />
        <label
          htmlFor={uploadId}
          className="px-3 py-2 bg-[#5D4E37] text-white rounded cursor-pointer hover:bg-[#6D5D4A] disabled:opacity-50"
        >
          {uploading ? 'Загрузка...' : '📁 Загрузить'}
        </label>
      </div>
      {(preview || value) && (
        <div className="relative w-32 h-32 border rounded overflow-hidden">
          <img
            src={preview || value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}
    </div>
  )
}

