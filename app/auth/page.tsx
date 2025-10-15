'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import AuthForm from '@/components/auth/AuthForm'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [isProcessingVerification, setIsProcessingVerification] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
  
  const redirectPath = searchParams.get('redirect') || '/'
  const isVerified = searchParams.get('verified') === 'true'

  useEffect(() => {
    // 检查用户是否已登录
    if (isAuthenticated) {
      router.push(redirectPath) // 已登录用户重定向到指定页面或首页
      return
    }

    // 处理邮箱验证后的自动登录
    const handleEmailVerification = async () => {
      if (isVerified && !isProcessingVerification) {
        setIsProcessingVerification(true)
        
        try {
          // 检查URL中是否有认证token（从hash或query参数中获取）
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const queryParams = new URLSearchParams(window.location.search)
          
          const accessToken = hashParams.get('access_token') || queryParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token')
          const tokenType = hashParams.get('type') || queryParams.get('type')
          
          if (accessToken && refreshToken && tokenType === 'signup') {
            // 使用token设置会话，实现自动登录
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
            
            if (error) {
              console.error('Auto login error:', error)
              // 如果自动登录失败，显示成功消息但不自动登录
              // 用户需要手动登录
            } else if (data.user) {
              // 自动登录成功，用户会通过AuthProvider的onAuthStateChange自动重定向
              console.log('Auto login successful for user:', data.user.email)
              return
            }
          }
          
          // 如果没有token或自动登录失败，显示验证成功消息
          // 清理URL中的verified参数
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.delete('verified')
          window.history.replaceState({}, '', newUrl.toString())
          
        } catch (error) {
          console.error('Email verification processing error:', error)
        } finally {
          setIsProcessingVerification(false)
        }
      }
    }

    handleEmailVerification()
  }, [isAuthenticated, router, redirectPath, isVerified, isProcessingVerification])

  const handleAuthSuccess = (user: any) => {
    // 登录成功后重定向到指定页面或首页
    router.push(redirectPath)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {isProcessingVerification ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">正在处理邮箱验证...</p>
          </div>
        ) : (
          <AuthForm 
            mode={mode} 
            onModeChange={setMode}
            onSuccess={handleAuthSuccess}
          />
        )}
      </div>
    </div>
  )
}