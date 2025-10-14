'use client'

import { useEffect, useState } from 'react'
import { getFaceModelById } from '@/lib/supabase'
import { Calendar, User, Eye, Download, Heart, MessageCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModelDetailOverlayProps {
  id: string
  onClose: () => void
  className?: string
}

export default function ModelDetailOverlay({ id, onClose, className = '' }: ModelDetailOverlayProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const fetchModel = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await getFaceModelById(id)
        if (error) setError(error)
        else setModel(data)
      } catch (e) {
        setError('加载模型详情失败')
      } finally {
        setLoading(false)
      }
    }
    fetchModel()
    // 添加打开动画
    setTimeout(() => setIsVisible(true), 10)
  }, [id])

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

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
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
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

              {/* 统计信息 */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Eye className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="text-lg font-semibold text-gray-900">{(model.stats?.[0]?.views) || 0}</span>
                  </div>
                  <div className="text-sm text-gray-500">浏览</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Download className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="text-lg font-semibold text-gray-900">{(model.stats?.[0]?.downloads) || 0}</span>
                  </div>
                  <div className="text-sm text-gray-500">下载</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Heart className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="text-lg font-semibold text-gray-900">{(model.stats?.[0]?.likes) || 0}</span>
                  </div>
                  <div className="text-sm text-gray-500">点赞</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <MessageCircle className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="text-lg font-semibold text-gray-900">{(model.stats?.[0]?.comments) || 0}</span>
                  </div>
                  <div className="text-sm text-gray-500">评论</div>
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
                  <h3 className="text-lg font-semibold mb-3">模型数据</h3>
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
    </div>
  )
}