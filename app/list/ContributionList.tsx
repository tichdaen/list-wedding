'use client'

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

type Props = {
  isAdmin?: boolean
}

type Contribution = {
    id?: number
    name?: string
    note?: string
    amount?: number
}

function formatKoreanCurrency(amount: number | undefined): string {

    if (amount === 0 || amount === undefined) return '0원'

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

export default function ContributionList({ isAdmin = false }: Props) {
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [tags, setTags] = useState<Record<number, string>>({})
  const [total, setTotal] = useState(0)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  // fetch, total 계산은 동일하므로 재사용
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('contributions').select('*')
      if (data) {
        setContributions(data)

        const totalAmount = (data || []).reduce((sum, item) => sum + item.amount, 0)
        setTotal(totalAmount)
      }
    }
    fetchData()
  }, [])

  const toggleSelection = (id: number | undefined) => {
    if ( id === undefined ) return
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSort = () => {
    console.log(`sortOrder : ${sortOrder}`)
    const newOrder = sortOrder === null ? 'asc' : (sortOrder === 'asc' ? 'desc' : null)
    setSortOrder(newOrder)

    if ( newOrder === null ) {
      const original = [...contributions].sort((a, b) => {
        return (a.id ?? 0) - (b.id ?? 0)
      })

      setContributions(original)
      return
    }

    const sorted = [...contributions].sort((a, b) => {
      if ( sortOrder === 'asc' ) return (a.amount ?? 0) - (b.amount ?? 0)
      return (b.amount ?? 0) - (a.amount ?? 0)
    })

    setContributions(sorted)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleTagChange = (id: number, tag: string) => {
    setTags((prev) => ({ ...prev, [id]: tag }))
  }

  const handleSaveTags = async () => {
    const updates = selectedIds.map((id) => ({
      id,
      tag: tags[id] || '',
    }))

    for (const update of updates) {
      await supabase.from('contributions').update({ tag: update.tag }).eq('id', update.id)
    }

  }

  return (
    <div className="pt-20 px-4 max-w-2xl mx-auto">
      {
        isAdmin && (
          <h2 className="text-xl font-bold mb-4">
            관리자
          </h2>
        )
      }
      {/* 상단 고정 전체 금액 */}
      <div className="fixed top-0 left-0 right-0 bg-[var(--background)] text-[var(--foreground)] z-10 border-b p-4 shadow-md">
        <h2 className="text-xl font-bold text-center">총 금액: {formatCurrency(total)} ({formatKoreanCurrency(total)})</h2>
      </div>

      <table className="w-full border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr>
            {isAdmin && <th />}
            <th>이름</th>
            <th>비고</th>
            <th className="cursor-pointer" onClick={toggleSort}>
              금액 { sortOrder === 'asc' ? '▲' : sortOrder === 'desc' ? '▼' : '' }
            </th>
            {isAdmin && <th>태그</th>}
          </tr>
        </thead>
        <tbody>
          {contributions.map((item) => (
            <tr key={item.id} className="bg-gray-100 dark:bg-neutral-800 rounded">
              {isAdmin && (
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id || 0)}
                    onChange={() => toggleSelection(item.id)}
                  />
                </td>
              )}
              <td className="px-2 py-2">{item.name}</td>
              <td className="px-2 py-2">{item.note}</td>
              <td className="px-2 py-2 text-center whitespace-nowrap">{formatKoreanCurrency(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {isAdmin && (
        <div className="mt-4 text-right">
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleSaveTags}
          >
            태그 저장
          </button>
        </div>
      )}
    </div>
  )
}
