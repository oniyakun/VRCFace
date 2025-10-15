'use client'

import Link from 'next/link'
import { ArrowLeft, BookOpen, Code, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/i18n/LanguageProvider'

export default function DocsPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              <span>{t('docs.backToHome')}</span>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">{t('docs.title')}</h1>
            <div></div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <BookOpen className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('docs.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('docs.subtitle')}
          </p>
        </div>

        {/* 功能介绍卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="card p-6">
            <Zap className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('docs.quickStart.title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('docs.quickStart.description')}
            </p>
            <Link href="/docs/quickstart">
              <Button variant="outline" size="sm">
                {t('docs.quickStart.viewTutorial')}
              </Button>
            </Link>
          </div>
          
          <div className="card p-6">
            <Code className="w-8 h-8 text-primary-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('docs.blendshapes.title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('docs.blendshapes.description')}
            </p>
            <Link href="/docs/blendshapes-tutorial">
              <Button variant="outline" size="sm">
                {t('docs.blendshapes.viewTutorial')}
              </Button>
            </Link>
          </div>

          <div className="card p-6">
            <Users className="w-8 h-8 text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('docs.community.title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('docs.community.description')}
            </p>
            <Button variant="outline" size="sm">
              {t('docs.community.viewRules')}
            </Button>
          </div>

          <div className="card p-6">
            <BookOpen className="w-8 h-8 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('docs.api.title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('docs.api.description')}
            </p>
            <Button variant="outline" size="sm">
              {t('docs.api.viewReference')}
            </Button>
          </div>
        </div>

        {/* 临时提示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800 mb-4">
            📚 {t('docs.moreContent')}
          </p>
          <p className="text-blue-600 text-sm">
            {t('docs.stayTuned')}
          </p>
        </div>
      </div>
    </div>
  )
}