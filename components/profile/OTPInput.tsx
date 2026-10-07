'use client'

import { useRef, useEffect, useState } from 'react'

interface OTPInputProps {
  length?: number
  onComplete: (code: string) => void
  error?: string
}

export default function OTPInput({ length = 4, onComplete, error }: OTPInputProps) {
  const [values, setValues] = useState<string[]>(new Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newValues = [...values]
    newValues[index] = value.slice(-1)
    setValues(newValues)

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if complete
    if (newValues.every(v => v !== '')) {
      onComplete(newValues.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData('text').trim()
    if (/^\d+$/.test(pastedData) && pastedData.length === length) {
      const newValues = pastedData.split('')
      setValues(newValues)
      inputRefs.current[length - 1]?.focus()
      onComplete(pastedData)
    }
  }

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-3">
        {values.map((value, index) => (
          <input
            key={index}
            ref={(el: HTMLInputElement | null) => {
              if (el) inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`w-14 h-14 text-center text-2xl font-bold rounded-xl bg-white/5 border-2 transition-all duration-200 focus:outline-none focus:border-[#6B8E6B] ${
              value ? 'border-[#6B8E6B] bg-white/10' : 'border-white/20'
            } ${error ? 'border-red-400 animate-shake' : ''} text-white`}
          />
        ))}
      </div>
      {error && (
        <p className="text-red-400 text-sm text-center animate-shake">{error}</p>
      )}
    </div>
  )
}

