'use client'

import { Heart, MessageCircle, Copy, User } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/ToastProvider'
import { useLanguage } from '@/components/i18n/LanguageProvider'

// 模拟数据 - 后续将从 Supabase 获取
const mockPosts = [
  {
    id: 1,
    title: '可爱猫咪表情包',
    author: 'NekoLover',
    likes: 234,
    comments: 45,
    image: '/api/placeholder/300/200',
    tags: ['可爱', '动物', '表情']
  },
  {
    id: 2,
    title: '酷炫机械风格',
    author: 'CyberPunk',
    likes: 189,
    comments: 32,
    image: '/api/placeholder/300/200',
    tags: ['科幻', '机械', '酷炫']
  },
  {
    id: 3,
    title: '温柔微笑系列',
    author: 'SoftSmile',
    likes: 156,
    comments: 28,
    image: '/api/placeholder/300/200',
    tags: ['温柔', '微笑', '日常']
  },
  {
    id: 4,
    title: '夸张搞笑表情',
    author: 'FunnyFace',
    likes: 298,
    comments: 67,
    image: '/api/placeholder/300/200',
    tags: ['搞笑', '夸张', '娱乐']
  }
]

export default function ContentPreview() {
  const { t } = useLanguage()
  const { showSuccess, showError } = useToast()
  
  const handleCopyJSON = (postId: number) => {
    // 模拟复制 JSON 数据
    const mockJSON = {
      id: postId,
      version: "1.0",
      expressions: {
        happy: { mouth: 0.8, eyes: 0.6 },
        sad: { mouth: -0.5, eyes: -0.3 }
      }
    }
    
    navigator.clipboard.writeText(JSON.stringify(mockJSON, null, 2))
      .then(() => showSuccess(t('common.copySuccess')))
      .catch(() => showError(t('common.copyError')))
  }

  return (
    <section id="content-section" className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 区域标题 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('home.popularModels')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('home.exploreDescription')}
          </p>
        </div>

        {/* 标签筛选预览 */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { key: 'all', label: t('home.tags.all') },
            { key: 'cute', label: t('home.tags.cute') },
            { key: 'cool', label: t('home.tags.cool') },
            { key: 'funny', label: t('home.tags.funny') },
            { key: 'gentle', label: t('home.tags.gentle') },
            { key: 'scifi', label: t('home.tags.scifi') },
            { key: 'animal', label: t('home.tags.animal') }
          ].map((tag, index) => (
            <button
              key={tag.key}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                index === 0
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* 模型卡片网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {mockPosts.map((post) => (
            <div key={post.id} className="card p-0 overflow-hidden group">
              {/* 模型预览图 */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <User className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">预览图</p>
                  </div>
                </div>
                
                {/* 悬停时显示的操作按钮 */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleCopyJSON(post.id)}
                    className="transform scale-95 group-hover:scale-100 transition-transform duration-200"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    复制 JSON
                  </Button>
                </div>
              </div>

              {/* 卡片内容 */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                  {post.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {post.author}
                </p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {post.tags.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{post.tags.length - 2}
                    </span>
                  )}
                </div>

                {/* 互动数据 */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {post.likes}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.comments}
                    </span>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 font-medium">
                    {t('home.viewDetails')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>


      </div>
    </section>
  )
}