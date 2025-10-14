'use client'

import { useEffect, useState } from 'react'
import { getFaceModelById } from '@/lib/supabase'
import { Calendar, User, Eye, Download, Heart, MessageCircle, X, Image as ImageIcon, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import ImageLightbox from '@/components/ui/ImageLightbox'

interface ModelDetailOverlayProps {
  id: string
  onClose: () => void
  className?: string
}

export default function ModelDetailOverlay({ id, onClose, className = '' }: ModelDetailOverlayProps) {
  const [model, setModel] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
          setError(result.error)
        } else if (result.data) {
          setModel(result.data)
        } else {
          setError('未找到模型')
        }
      } catch (err) {
        console.error('获取模型详情失败:', err)
        setError('获取模型详情失败')
      } finally {
        setLoading(false)
      }
    }

    fetchModel()
  }, [id])

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
          <h2 className="text-lg font-semibold">模型详情</h2>
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
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  复制捏脸数据
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
              <span className="ml-3 text-gray-600">加载中...</span>
            </div>
          ) : error || !model ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-2">加载失败</div>
              <div className="text-gray-600">{error || '未找到模型详情'}</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 图片展示区域 */}
              {images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    模型图片 ({images.length})
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
                            封面
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
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                      <User className="w-3 h-3 text-gray-600" />
                    </div>
                    <span className="font-medium">{model.author?.username || '未知作者'}</span>
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
                  <h3 className="text-lg font-semibold mb-3">标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {model.tags.map((tr: any) => (
                      <span 
                        key={tr.tag.id} 
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                      >
                        {tr.tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* JSON 数据展示 */}
              {model.json_data && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">捏脸数据</h3>
                  <div className="bg-gray-100 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(model.json_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
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