'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/i18n/LanguageProvider'

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, showError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      showError(t('auth.errors.emailRequired'))
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      showError(t('auth.errors.emailInvalid'))
      return
    }

    setLoading(true)
    showError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(result.message)
        // 3秒后自动跳转到登录页面
        setTimeout(() => {
          router.push('/auth')
        }, 3000)
      } else {
        showError(result.error || t('auth.errors.sendFailed'))
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      showError(t('auth.errors.networkError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{t('auth.forgotPassword.title')}</h2>
            <p className="text-gray-600 mt-2">
              {t('auth.forgotPassword.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.form.email')} *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  showError('')
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('auth.forgotPassword.emailPlaceholder')}
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
                <p className="text-sm mt-1">{t('auth.forgotPassword.redirectMessage')}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !!success}
            >
              {loading ? t('auth.form.loading') : t('auth.forgotPassword.sendButton')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('auth.forgotPassword.rememberPassword')}
              <Link
                href="/auth"
                className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
              >
                {t('auth.forgotPassword.backToLogin')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}