'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/AuthProvider'
import { useLanguage } from '@/components/i18n/LanguageProvider'

interface AuthFormProps {
  mode: 'login' | 'register'
  onModeChange: (mode: 'login' | 'register') => void
  onSuccess?: (user: any) => void
}

interface FormData {
  email: string
  password: string
  username?: string
  displayName?: string
  confirmPassword?: string
}

export default function AuthForm({ mode, onModeChange, onSuccess }: AuthFormProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    username: '',
    displayName: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, showError] = useState('')
  const [success, setSuccess] = useState('')
  const [showResendButton, setShowResendButton] = useState(false)
  
  // 使用 AuthProvider 的 login 方法
  const { login } = useAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    showError('')
  }

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      showError(t('auth.validation.emailPasswordRequired'))
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      showError(t('auth.validation.invalidEmail'))
      return false
    }

    if (formData.password.length < 6) {
      showError(t('auth.validation.passwordTooShort'))
      return false
    }

    if (mode === 'register') {
      if (!formData.username) {
        showError(t('auth.validation.usernameRequired'))
        return false
      }

      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
      if (!usernameRegex.test(formData.username)) {
        showError(t('auth.validation.invalidUsername'))
        return false
      }

      if (formData.password !== formData.confirmPassword) {
        showError(t('auth.validation.passwordMismatch'))
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    showError('')
    setSuccess('')

    try {
      if (mode === 'login') {
        // 使用 AuthProvider 的 login 方法
        const result = await login(formData.email, formData.password)
        
        if (result.success) {
          setSuccess(t('auth.success.loginSuccess'))
          onSuccess?.(null) // 用户信息会通过 AuthProvider 自动更新
        } else {
          showError(result.error || t('auth.errors.loginFailed'))
          
          // 如果是登录失败且提示需要验证邮箱，显示重新发送按钮
          if (result.error?.includes('验证')) {
            setShowResendButton(true)
          }
        }
      } else {
        // 注册逻辑保持不变
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            username: formData.username,
            displayName: formData.displayName || formData.username
          }),
        })

        const result = await response.json()

        if (result.success) {
          setSuccess(result.message || t('auth.success.registerSuccess'))
          
          // 注册成功后切换到登录模式
          setTimeout(() => {
            onModeChange('login')
            setFormData({
              email: formData.email,
              password: '',
              username: '',
              displayName: '',
              confirmPassword: ''
            })
          }, 2000)
        } else {
          showError(result.error || t('auth.errors.registerFailed'))
        }
      }
    } catch (error) {
      // Auth error handled silently
      showError(t('auth.errors.networkError'))
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      showError(t('auth.errors.emailRequired'))
      return
    }

    setLoading(true)
    showError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(result.message)
        setShowResendButton(false)
      } else {
        showError(result.error || t('auth.errors.resendFailed'))
      }
    } catch (error) {
      // Resend confirmation error handled silently
      showError(t('auth.errors.networkError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? t('auth.welcome.loginTitle') : t('auth.welcome.registerTitle')}
          </h1>
          <p className="text-gray-600">
            {mode === 'login' ? t('auth.welcome.loginSubtitle') : t('auth.welcome.registerSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.form.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('auth.form.emailPlaceholder')}
                required
              />
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.form.username')}
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('auth.form.usernamePlaceholder')}
                  required
                />
              </div>

              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.form.displayName')}
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('auth.form.displayNamePlaceholder')}
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.form.password')}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('auth.form.passwordPlaceholder')}
              required
            />
            {mode === 'login' && (
              <div className="text-right mt-2">
                <a
                  href="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {t('auth.form.forgotPassword')}
                </a>
              </div>
            )}
          </div>

          {mode === 'register' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.form.confirmPassword')}
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('auth.form.confirmPasswordPlaceholder')}
                required
              />
            </div>
          )}



          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? t('auth.form.loading') : (mode === 'login' ? t('auth.form.loginButton') : t('auth.form.registerButton'))}
          </Button>

          {showResendButton && mode === 'login' && (
            <Button
              type="button"
              variant="outline"
              className="w-full mt-3"
              onClick={handleResendConfirmation}
              disabled={loading}
            >
              {loading ? t('auth.form.loading') : t('auth.form.resendButton')}
            </Button>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {mode === 'login' ? t('auth.form.noAccount') : t('auth.form.hasAccount')}
            <button
              type="button"
              onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
              className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
              disabled={loading}
            >
              {mode === 'login' ? t('auth.form.registerLink') : t('auth.form.loginLink')}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}