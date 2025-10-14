'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getFaceModelById } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import { Calendar, User, Eye, Download, Heart, MessageCircle, ArrowLeft } from 'lucide-react'

export default function ModelDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const modelId = params?.id

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState<any>(null)

  useEffect(() => {
    const fetchModel = async () => {
      if (!modelId) return
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await getFaceModelById(modelId as string)
        if (error) {
          setError(error)
        } else {
          setModel(data)
        }
      } catch (e) {
        setError('加载模型详情失败')
      } finally {
        setLoading(false)
      }
    }
    fetchModel()
  }, [modelId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> 返回
          </Button>
          <div className="card p-6">
            <p className="text-red-600">{error || '未找到模型详情'}</p>
          </div>
        </div>
      </div>
    )
  }

  const authorName = model.author?.username || '未知作者'
  const stats = model.stats?.[0] || { views: 0, downloads: 0, likes: 0, comments: 0 }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* 顶部返回 */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> 返回
          </Button>
        </div>

        {/* 详情卡片 */}
        <div className="card p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{model.title}</h1>
          <p className="text-gray-600 mb-4">{model.description}</p>

          {/* 作者与时间 */}
          <div className="flex items-center justify-between mb-6 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                <User className="w-3 h-3 text-gray-600" />
              </div>
              <span className="font-medium">{authorName}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{new Date(model.created_at).toLocaleString()}</span>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
            <span className="flex items-center"><Eye className="w-4 h-4 mr-1" />{stats.views}</span>
            <span className="flex items-center"><Download className="w-4 h-4 mr-1" />{stats.downloads}</span>
            <span className="flex items-center"><Heart className="w-4 h-4 mr-1" />{stats.likes}</span>
            <span className="flex items-center"><MessageCircle className="w-4 h-4 mr-1" />{stats.comments}</span>
          </div>

          {/* 标签 */}
          {model.tags && model.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {model.tags.map((tr: any) => (
                <span key={tr.tag.id} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                  {tr.tag.name}
                </span>
              ))}
            </div>
          )}

          {/* JSON 数据展示 */}
          {model.json_data && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">JSON 数据</h2>
              <pre className="bg-gray-100 rounded-lg p-4 text-sm overflow-auto">
                {JSON.stringify(model.json_data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}