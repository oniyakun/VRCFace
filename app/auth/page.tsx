'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import AuthForm from '@/components/auth/AuthForm'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
  
  const redirectPath = searchParams.get('redirect') || '/'

  useEffect(() => {
    // 检查用户是否已登录
    if (isAuthenticated) {
      router.push(redirectPath) // 已登录用户重定向到指定页面或首页
    }
  }, [isAuthenticated, router, redirectPath])

  const handleAuthSuccess = (user: any) => {
    // 登录成功后重定向到指定页面或首页
    router.push(redirectPath)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <AuthForm 
          mode={mode} 
          onModeChange={setMode}
          onSuccess={handleAuthSuccess}
        />
      </div>
    </div>
  )
}