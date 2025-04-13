'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Contribution = {
  id: number
  name: string
  note: string
  amount: number
}

const formatWon = (amount: number) =>
  new Intl.NumberFormat('ko-KR').format(amount) + '원'

export default function ListPage() {
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) {
        alert('데이터 불러오기 실패: ' + error.message)
        return
      }

      setContributions(data || [])

      const totalAmount = (data || []).reduce(
        (sum, item) => sum + item.amount,
        0
      )
      setTotal(totalAmount)
    }

    fetchData()
  }, [])

  return (
    <div className="pt-20 px-4 max-w-2xl mx-auto">
      {/* 상단 고정 전체 금액 */}
      <div className="fixed top-0 left-0 right-0 bg-[var(--background)] text-[var(--foreground)] z-10 border-b p-4 shadow-md">
        <h2 className="text-xl font-bold text-center">총 금액: {formatWon(total)}</h2>
      </div>

      {/* 리스트 형태 */}
      <table className="w-full mt-4 text-sm border-separate border-spacing-y-2">
        <thead className="sticky top-16 bg-[var(--background)] text-[var(--foreground)] text-left border-b">
          <tr>
            <th className="px-2 py-1">이름</th>
            <th className="px-2 py-1">비고</th>
            <th className="px-2 py-1 text-right">금액</th>
          </tr>
        </thead>
        <tbody>
          {contributions.map((item) => (
            <tr
              key={item.id}
              className="bg-gray-100 dark:bg-neutral-800 rounded-md text-[var(--foreground)]"
            >
              <td className="px-2 py-2 font-medium">{item.name}</td>
              <td className="px-2 py-2 text-gray-600 dark:text-gray-400">{item.note}</td>
              <td className="px-2 py-2 text-right font-semibold">{formatWon(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
