'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/components/ui/ToastProvider'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/i18n/LanguageProvider'

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading, session } = useAuth()
  const { showSuccess, showError } = useToast()
  const { t } = useLanguage()
  const router = useRouter()
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    avatar: ''
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth')
      return
    }

    if (user) {
      setFormData({
        displayName: user.displayName || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      })
    }
  }, [user, isAuthenticated, isLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    if (!user || !session) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        showSuccess(t('settings.success.saveSuccess'))
      } else {
        showError(t('settings.errors.saveFailed'))
      }
    } catch (error) {
      console.error('Save settings error:', error)
      showError(t('settings.errors.saveFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('settings.loading')}</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
            <p className="mt-1 text-sm text-gray-600">{t('settings.subtitle')}</p>
          </div>

          <div className="p-6 space-y-6">
            {/* 基本信息 */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('settings.basicInfo.title')}</h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    {t('settings.basicInfo.username')}
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={user?.username || ''}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">{t('settings.basicInfo.usernameNote')}</p>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    {t('settings.basicInfo.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">{t('settings.basicInfo.emailNote')}</p>
                </div>

                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                    {t('settings.basicInfo.displayName')}
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('settings.basicInfo.displayNamePlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                    {t('settings.basicInfo.avatar')}
                  </label>
                  <input
                    type="url"
                    id="avatar"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('settings.basicInfo.avatarPlaceholder')}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  {t('settings.basicInfo.bio')}
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('settings.basicInfo.bioPlaceholder')}
                />
              </div>
            </div>

            {/* 保存按钮 */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2"
              >
                {isSaving ? t('settings.form.saving') : t('settings.form.saveButton')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}