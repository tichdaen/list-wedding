'use client'

import { useEffect, useState } from 'react'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
const USER_PASSWORD = process.env.NEXT_PUBLIC_USER_PASSWORD

const userKey = 'user-authenticated'
const adminKey = 'admin-authenticated'
export default function ProtectedPage({ children, isUserPage = false }: { children: React.ReactNode, isUserPage: boolean }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [input, setInput] = useState('')

  useEffect(() => {
    const key = isUserPage ? userKey : adminKey
    const saved = localStorage.getItem(key)
    if (saved === 'true') {
      setAuthenticated(true)
    }
  }, [])

  const handleCheck = () => {
    const password = isUserPage ? USER_PASSWORD : ADMIN_PASSWORD
    if (input === password) {
      setAuthenticated(true)
      const key = isUserPage ? userKey : adminKey
      localStorage.setItem(key, 'true')
    } else {
      alert('비밀번호가 틀렸습니다.')
    }
  }

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
        <h1 className="text-xl font-bold">비밀번호가 필요해요</h1>
        <input
          className="p-2 border rounded"
          type="password"
          placeholder="비밀번호 입력"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleCheck}>
          확인
        </button>
      </div>
    )
  }

  return <>{children}</>
}
