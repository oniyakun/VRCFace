'use client'

import { Github, BookOpen, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ScrollIndicator from '@/components/ui/ScrollIndicator'
import { useLanguage } from '@/components/i18n/LanguageProvider'

export default function HeroSection() {
  const { t } = useLanguage()

  const handleGithubClick = () => {
    // 这里可以替换为实际的 GitHub 仓库地址
    window.open('https://github.com', '_blank')
  }

  return (
    <section className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Logo 和标题 */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              VRCFace
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-2">
            {t('home.subtitle')}
          </p>
        </div>

        {/* 描述文字 */}
        <div className="mb-12 animate-slide-up">
          <p className="text-lg sm:text-xl text-gray-700 mb-6 leading-relaxed max-w-2xl mx-auto">
            {t('home.description')}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>{t('home.features.pluginShare')}</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>{t('home.features.tagFilter')}</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span>{t('home.features.freeOpen')}</span>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16 animate-slide-up">
          <Link href="/docs" className="w-full sm:w-auto">
            <Button 
              size="lg" 
              className="w-full sm:w-auto min-w-[160px] shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              {t('home.viewDocs')}
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleGithubClick}
            className="w-full sm:w-auto min-w-[160px] shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Github className="w-5 h-5 mr-2" />
            {t('home.goToGithub')}
          </Button>
        </div>

      </div>

      {/* 滚动指示器 */}
      <ScrollIndicator targetId="content-section" />
    </section>
  )
}