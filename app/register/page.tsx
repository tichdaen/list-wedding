'use client'

import { supabase } from '@/lib/supabase'
import { useState, useRef } from 'react'
import ProtectedPage from '../ProtectedPage'

export default function RegisterPage() {
  const [step, setStep] = useState<'name' | 'note' | 'amount'>('name')
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [dupPass, setDupPass] = useState(true)
  const [currentAmount, setCurrentAmount] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const nameInputRef = useRef<HTMLInputElement>(null!)
  const noteInputRef = useRef<HTMLInputElement>(null!)
  const hiddenAmountInputRef = useRef<HTMLInputElement>(null!)

  const focusInput = (ref: React.RefObject<HTMLInputElement>) => {
    setTimeout(() => {
      ref.current?.focus()
    }, 0)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(value)
  }

  function formatKoreanCurrency(amount: number): string {
    if (amount === 0) return '0원'

    const units = ['', '만', '억', '조']
    let result = ''
    let unitIndex = 0

    while (amount > 0) {
      const chunk = amount % 10000
      if (chunk > 0) {
        result = `${chunk}${units[unitIndex]} ` + result
      }
      amount = Math.floor(amount / 10000)
      unitIndex++
    }

    return result.trim() + '원'
  }


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (step === 'name' && e.key === 'Enter') {
      if (name.trim()) {
        setStep('note')
        focusInput(noteInputRef)
      }
    } else if (step === 'note' && e.key === 'Enter') {
      setStep('amount')
      focusInput(hiddenAmountInputRef)
    }
  }

  const handleAmountKey = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (step !== 'amount') return

    const keyMap: Record<string, number> = {
      '1': 10000,
      '2': 50000,
      '3': 100000,
      '4': 500000,
    }

    if ( e.key === 'Backspace' ) {
      setCurrentAmount(0)
    }

    if (e.key === 'Enter') {
      setIsSubmitting(true)

      const { data: existing, error: checkError } = await supabase
        .from('contributions')
        .select('name')
        .eq('name', name.trim())

      if ( checkError ) {
        alert("중복체크 에러")
        return
      }
      console.log(existing)

      if ( existing.length > 0 && dupPass ) {
        alert("어? 이름 있는데?")
        setDupPass(false)
        return
      }

      const { error } = await supabase.from('contributions').insert([
        {
          name,
          note,
          amount: currentAmount,
        },
      ])

      if (!error) {
        setName('')
        setNote('')
        setCurrentAmount(0)
        setStep('name')
        focusInput(nameInputRef)
      } else {
        alert('에러 발생: ' + error.message)
      }

      setDupPass(true)

      setIsSubmitting(false)
    }

    if (keyMap[e.key]) {
      const selectedAmount = keyMap[e.key]
      setCurrentAmount((prev) => Math.max(0, prev + selectedAmount))
    }
  }

  return (
    <ProtectedPage isUserPage={false}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">등록 페이지</h1>
        <div className="flex flex-col gap-4 w-64">
          <input
            ref={nameInputRef}
            className="p-2 border rounded"
            placeholder="이름 입력"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setStep('name')
              focusInput(nameInputRef)
            }}
          />
          <input
            ref={noteInputRef}
            className="p-2 border rounded"
            placeholder="비고 입력"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setStep('note')
              focusInput(noteInputRef)
            }}
          />
          {step === 'amount' && (
            <>
              <div className="text-sm text-gray-600">
                금액 선택: 1 (₩10,000), 2 (₩50,000), 3 (₩100,000), 4 (₩500,000)
              </div>
              <input
                ref={hiddenAmountInputRef}
                onKeyDown={handleAmountKey}
                className="opacity-0 h-0 w-0 pointer-events-none"
                autoFocus
              />
              <div className="text-lg font-semibold">
                금액: {formatCurrency(currentAmount)} ( {formatKoreanCurrency(currentAmount) } )
              </div>
            </>
          )}
          {isSubmitting && <p>등록 중...</p>}
        </div>
      </div>
    </ProtectedPage>
  )
}
