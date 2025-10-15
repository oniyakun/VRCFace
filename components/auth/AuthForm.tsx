'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/AuthProvider'

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
      showError('邮箱和密码为必填项')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      showError('邮箱格式不正确')
      return false
    }

    if (formData.password.length < 6) {
      showError('密码长度至少为6位')
      return false
    }

    if (mode === 'register') {
      if (!formData.username) {
        showError('用户名为必填项')
        return false
      }

      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
      if (!usernameRegex.test(formData.username)) {
        showError('用户名只能包含字母、数字和下划线，长度为3-20位')
        return false
      }

      if (formData.password !== formData.confirmPassword) {
        showError('两次输入的密码不一致')
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
          setSuccess('登录成功')
          onSuccess?.(null) // 用户信息会通过 AuthProvider 自动更新
        } else {
          showError(result.error || '登录失败，请稍后重试')
          
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
          setSuccess(result.message || '注册成功')
          
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
          showError(result.error || '注册失败，请稍后重试')
        }
      }
    } catch (error) {
      // Auth error handled silently
      showError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      showError('请输入邮箱地址')
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
        showError(result.error || '发送验证邮件失败')
      }
    } catch (error) {
      // Resend confirmation error handled silently
      showError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'login' ? '登录' : '注册'}
          </h2>
          <p className="text-gray-600 mt-2">
            {mode === 'login' ? '欢迎回来！' : '创建您的账户'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'register' && (
            <>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  用户名 *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入用户名"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  显示名称
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入显示名称（可选）"
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              邮箱 *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入邮箱"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              密码 *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入密码"
              disabled={loading}
            />
            {mode === 'login' && (
              <div className="text-right mt-2">
                <a
                  href="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  忘记密码？
                </a>
              </div>
            )}
          </div>

          {mode === 'register' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                确认密码 *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请再次输入密码"
                disabled={loading}
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
            {loading ? '处理中...' : (mode === 'login' ? '登录' : '注册')}
          </Button>

          {showResendButton && mode === 'login' && (
            <Button
              type="button"
              variant="outline"
              className="w-full mt-3"
              onClick={handleResendConfirmation}
              disabled={loading}
            >
              重新发送验证邮件
            </Button>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {mode === 'login' ? '还没有账户？' : '已有账户？'}
            <button
              type="button"
              onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
              className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
              disabled={loading}
            >
              {mode === 'login' ? '立即注册' : '立即登录'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}