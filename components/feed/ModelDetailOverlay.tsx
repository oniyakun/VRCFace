'use client'

import { useEffect, useState } from 'react'
import { getFaceModelById } from '@/lib/supabase'
import { Calendar, User, Eye, Download, Heart, MessageCircle, X, Image as ImageIcon, Copy, Check, User as UserIcon, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import ImageLightbox from '@/components/ui/ImageLightbox'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import CommentSection from '@/components/comments/CommentSection'

interface ModelDetailOverlayProps {
  id: string
  onClose: () => void
  className?: string
}

export default function ModelDetailOverlay({ id, onClose, className = '' }: ModelDetailOverlayProps) {
  const { t } = useLanguage()
  const [model, setModel] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, showError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    const fetchModel = async () => {
      try {
        setLoading(true)
        const result = await getFaceModelById(id)
        if (result.error) {
          showError(result.error)
        } else if (result.data) {
          setModel(result.data)
          // 增加浏览量
          await incrementViewCount(id)
        } else {
          showError(t('modelCard.modelNotFound'))
        }
      } catch (err) {
        console.error('获取模型详情失败:', err)
        showError(t('modelCard.loadFailed'))
      } finally {
        setLoading(false)
      }
    }

    fetchModel()
  }, [id])

  // 增加浏览量的函数
  const incrementViewCount = async (modelId: string) => {
    try {
      const response = await fetch(`/api/models/${modelId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'increment_view' }),
      })

      if (!response.ok) {
        console.warn('增加浏览量失败:', response.statusText)
      }
    } catch (error) {
      console.warn('增加浏览量失败:', error)
    }
  }

  useEffect(() => {
    // 延迟显示动画
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !lightboxOpen) {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen])

  // 阻止背景滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(), 200) // 等待动画完成后关闭
  }

  const handleImageClick = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  // 复制模型数据到剪贴板
  const handleCopyModelData = async () => {
    if (!model || !model.json_data) return

    try {
      // 只复制 json_data 部分
      await navigator.clipboard.writeText(JSON.stringify(model.json_data, null, 2))
      
      // 显示成功提示
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
      // 可以在这里添加错误提示
    }
  }

  // 获取所有图片
  const getAllImages = () => {
    if (!model) return []
    
    // 优先使用 images 数组，如果没有则使用 thumbnail
    if (model.images && model.images.length > 0) {
      return model.images
    } else if (model.thumbnail) {
      return [model.thumbnail]
    }
    return []
  }

  const images = getAllImages()

  return (
    <div className="fixed inset-0 z-50">
      {/* 背景遮罩 */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-300",
          isVisible ? 'opacity-100' : 'opacity-0'
        )} 
        onClick={handleClose} 
      />
      {/* 内容容器 */}
      <div className={cn(
        'absolute inset-y-8 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl bg-white rounded-2xl shadow-xl border transition-all duration-300 ease-out',
        isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4',
        className
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{t('modelCard.modelDetails')}</h2>
          <div className="flex items-center gap-2">
            {/* 复制按钮 */}
            <button
              onClick={handleCopyModelData}
              disabled={!model || loading || !model?.json_data}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                copySuccess
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300",
                (!model || loading || !model?.json_data) && "opacity-50 cursor-not-allowed"
              )}
            >
              {copySuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  {t('modelCard.copied')}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {t('modelCard.copyFaceData')}
                </>
              )}
            </button>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-600">{t('common.loading')}</span>
            </div>
          ) : error || !model ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-2">{t('common.loadFailed')}</div>
              <div className="text-gray-600">{error || t('modelCard.modelDetailsNotFound')}</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 图片展示区域 */}
              {images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    {t('modelCard.modelImages')} ({images.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {images.map((image: string, index: number) => (
                      <div
                        key={index}
                        className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-200"
                        onClick={() => handleImageClick(index)}
                      >
                        <img
                          src={image}
                          alt={`${model.title} - 图片 ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                              <Eye className="w-4 h-4 text-gray-700" />
                            </div>
                          </div>
                        </div>
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-md">
                            {t('modelCard.cover')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 标题和基本信息 */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{model.title}</h1>
                <p className="text-gray-600 mb-4">{model.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div 
                    className="flex items-center cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => window.open(`/profile/${model.author?.id}`, '_blank')}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-3 bg-gray-200 flex items-center justify-center">
                      {model.author?.avatar ? (
                        <img 
                          src={model.author.avatar} 
                          alt={model.author.display_name || model.author.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-medium text-sm">
                          {(model.author?.display_name || model.author?.username || 'U').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {model.author?.display_name || model.author?.username || t('common.unknownAuthor')}
                      </span>
                      {model.author?.display_name && model.author?.username && (
                        <span className="text-xs text-gray-500">@{model.author.username}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(model.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 标签 */}
              {model.tags && model.tags.length > 0 && (
                <div>
                  {/* 模型名字标签 */}
                  {model.tags.filter((tr: any) => tr.tag.tag_type === 'model_name').length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                        {t('modelCard.modelName')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {model.tags
                          .filter((tr: any) => tr.tag.tag_type === 'model_name')
                          .map((tr: any) => (
                            <span 
                              key={tr.tag.id} 
                              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                            >
                              <UserIcon className="w-4 h-4 mr-1" />
                              {tr.tag.name}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* 模型风格标签 */}
                  {model.tags.filter((tr: any) => tr.tag.tag_type === 'model_style' || !tr.tag.tag_type).length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <Palette className="w-5 h-5 mr-2 text-purple-600" />
                        {t('modelCard.modelStyle')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {model.tags
                          .filter((tr: any) => tr.tag.tag_type === 'model_style' || !tr.tag.tag_type)
                          .map((tr: any) => (
                            <span 
                              key={tr.tag.id} 
                              className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
                            >
                              <Palette className="w-4 h-4 mr-1" />
                              {tr.tag.name}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* JSON 数据展示 */}
              {model.json_data && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t('modelCard.faceData')}</h3>
                  <div className="bg-gray-100 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(model.json_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 评论区域 */}
          <CommentSection modelId={id} />
        </div>
      </div>

      {/* 灯箱组件 */}
      {images.length > 0 && (
        <ImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  )
}