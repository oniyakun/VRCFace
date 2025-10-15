'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/i18n/LanguageProvider'

export default function ResetPasswordPage() {
  const { t } = useLanguage()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, showError] = useState('')
  const [success, setSuccess] = useState('')
  const [tokens, setTokens] = useState<{ accessToken: string; refreshToken: string } | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // 检查URL参数的多种可能格式
    const checkUrlParams = () => {
      // 方法1: 检查hash参数 (#access_token=xxx&refresh_token=xxx&type=recovery)
      const hash = window.location.hash.substring(1)
      if (hash) {
        const hashParams = new URLSearchParams(hash)
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')
        
        console.log('检查Hash参数:', { hash, accessToken: !!accessToken, refreshToken: !!refreshToken, type })
        
        if (accessToken && refreshToken && type === 'recovery') {
          setTokens({ accessToken, refreshToken })
          return true
        }
      }
      
      // 方法2: 检查查询参数 (?access_token=xxx&refresh_token=xxx&type=recovery)
      const searchParams = new URLSearchParams(window.location.search)
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')
      const type = searchParams.get('type')
      
      console.log('检查查询参数:', { 
        search: window.location.search, 
        accessToken: !!accessToken, 
        refreshToken: !!refreshToken, 
        type 
      })
      
      if (accessToken && refreshToken && type === 'recovery') {
        setTokens({ accessToken, refreshToken })
        return true
      }
      
      return false
    }
    
    // 延迟检查，确保页面完全加载
    const timer = setTimeout(() => {
      const hasValidParams = checkUrlParams()
      
      if (!hasValidParams) {
        console.log('完整URL信息:', {
          href: window.location.href,
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash
        })
        showError(t('auth.resetPassword.invalidLink'))
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  const validateForm = (): boolean => {
    if (!password || !confirmPassword) {
      showError(t('auth.resetPassword.fillAllFields'))
      return false
    }

    if (password.length < 6) {
      showError(t('auth.resetPassword.passwordTooShort'))
      return false
    }

    if (password !== confirmPassword) {
      showError(t('auth.resetPassword.passwordMismatch'))
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
        showError(result.error || t('auth.resetPassword.resetFailed'))
      }
    } catch (error) {
      console.error('Reset password error:', error)
      showError(t('auth.errors.networkError'))
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('auth.resetPassword.invalidLinkTitle')}</h2>
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {t('auth.resetPassword.requestNewReset')}
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
            <h2 className="text-2xl font-bold text-gray-900">{t('auth.resetPassword.title')}</h2>
            <p className="text-gray-600 mt-2">
              {t('auth.resetPassword.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.resetPassword.newPassword')} *
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
                placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.resetPassword.confirmPassword')} *
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
                placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
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
                <p className="text-sm mt-1">{t('auth.resetPassword.redirectMessage')}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !!success}
            >
              {loading ? t('auth.resetPassword.resetting') : t('auth.resetPassword.resetButton')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('auth.resetPassword.rememberPassword')}
              <Link
                href="/auth"
                className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
              >
                {t('auth.resetPassword.backToLogin')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}