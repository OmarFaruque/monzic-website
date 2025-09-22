"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { useEffect, useRef } from "react"

interface VerificationCodeInputProps {
  value: string[]
  onChange: (index: number, value: string) => void
  onKeyDown: (index: number, e: React.KeyboardEvent) => void
  idPrefix: string
  isVerifying?: boolean
}

export function VerificationCodeInput({
  value,
  onChange,
  onKeyDown,
  idPrefix,
  isVerifying = false,
}: VerificationCodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0] && !isVerifying) {
      inputRefs.current[0].focus()
    }
  }, [isVerifying])

  return (
    <div className="flex justify-center gap-1 sm:gap-2">
      {value.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          id={`${idPrefix}-${index}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          value={digit}
          onChange={(e) => onChange(index, e.target.value)}
          onKeyDown={(e) => onKeyDown(index, e)}
          className="w-9 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 border-gray-200 focus:border-teal-500 rounded-lg p-0"
          autoComplete="off"
          disabled={isVerifying}
        />
      ))}
    </div>
  )
}
