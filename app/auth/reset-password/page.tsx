'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, showError] = useState('')
  const [success, setSuccess] = useState('')
  const [tokens, setTokens] = useState<{ accessToken: string; refreshToken: string } | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Supabase的密码重置链接格式通常是 #access_token=xxx&refresh_token=xxx&type=recovery
    // 我们需要从URL的hash部分获取参数
    const hash = window.location.hash.substring(1) // 移除 # 号
    const params = new URLSearchParams(hash)
    
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const type = params.get('type')
    
    console.log('URL hash:', hash)
    console.log('Access token:', accessToken)
    console.log('Refresh token:', refreshToken)
    console.log('Type:', type)
    
    if (!accessToken || !refreshToken || type !== 'recovery') {
      showError('无效的重置链接或链接已过期')
      return
    }

    setTokens({ accessToken, refreshToken })
  }, [])

  const validateForm = (): boolean => {
    if (!password || !confirmPassword) {
      showError('请填写所有字段')
      return false
    }

    if (password.length < 6) {
      showError('密码长度至少为6位')
      return false
    }

    if (password !== confirmPassword) {
      showError('两次输入的密码不一致')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !tokens) return

    setLoading(true)
    showError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(result.message)
        // 3秒后自动跳转到登录页面
        setTimeout(() => {
          router.push('/auth')
        }, 3000)
      } else {
        showError(result.error || '密码重置失败，请稍后重试')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      showError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 如果没有有效的令牌，显示错误页面
  if (!tokens && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">链接无效</h2>
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                重新申请密码重置
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">重置密码</h2>
            <p className="text-gray-600 mt-2">
              请输入您的新密码
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                新密码 *
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  showError('')
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入新密码（至少6位）"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                确认新密码 *
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  showError('')
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请再次输入新密码"
                disabled={loading}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                {success}
                <p className="text-sm mt-1">3秒后将自动跳转到登录页面...</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !!success}
            >
              {loading ? '重置中...' : '重置密码'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              记起密码了？
              <Link
                href="/auth"
                className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
              >
                返回登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}