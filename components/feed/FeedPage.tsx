'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search } from 'lucide-react'
import TagFilter from './TagFilter'
import FeedControls, { SortOption, ViewMode } from './FeedControls'
import WaterfallLayout from './WaterfallLayout'
import ModelCard from './ModelCard'
import ModelDetailOverlay from './ModelDetailOverlay'
import { cn } from '@/lib/utils'
import { getFaceModels, getTags } from '@/lib/supabase'

// 数据类型（基于 Supabase 返回的数据结构）
interface FeedModel {
  id: string
  title: string
  description: string
  author: {
    id: string
    username: string
    role: string
  } | null
  category: string
  json_data: object
  is_public: boolean
  is_verified: boolean
  created_at: string
  stats?: {
    views: number
    downloads: number
    likes: number
    comments: number
  }
  tags?: Array<{
    tag: {
      id: string
      name: string
      category: string
    }
  }>
  height?: number
}

interface FeedTag {
  id: string
  name: string
  description?: string
  color?: string
  category: string
  tag_type?: string
  usage_count?: number
}

// 转换 Supabase 数据为组件所需格式
const transformModelData = (model: any): FeedModel => ({
  ...model,
  height: 300 + Math.random() * 200, // 为瀑布流布局添加随机高度
  author: {
    id: model.author?.id || '',
    username: model.author?.username || 'Unknown',
    role: model.author?.role || 'user'
  },
  stats: model.stats?.[0] || {
    views: 0,
    downloads: 0,
    likes: 0,
    comments: 0
  }
})

interface FeedPageProps {
  className?: string
}

export default function FeedPage({ className = '' }: FeedPageProps) {
  // 状态管理
  const [models, setModels] = useState<FeedModel[]>([])
  const [tags, setTags] = useState<FeedTag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('latest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

  // 初始化数据
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setInitialLoading(true)
    setError(null)
    
    try {
      // 并行加载标签和模型数据
      const [tagsResult, modelsResult] = await Promise.all([
        getTags(),
        getFaceModels(1, 12, { sortBy })
      ])

      if (tagsResult.error) {
        console.error('加载标签失败:', tagsResult.error)
      } else {
        setTags(tagsResult.data)
      }

      if (modelsResult.error) {
        setError(modelsResult.error)
      } else {
        const transformedModels = modelsResult.data.map(transformModelData)
        setModels(transformedModels)
        setHasMore(modelsResult.hasNext ?? false)
        setCurrentPage(1)
      }
    } catch (err) {
      console.error('加载数据失败:', err)
      setError('加载数据失败，请稍后重试')
    } finally {
      setInitialLoading(false)
    }
  }

  // 筛选和排序逻辑
  const filteredAndSortedModels = useMemo(() => {
    let filtered = models

    // 标签筛选
    if (selectedTags.length > 0) {
      filtered = filtered.filter(model => {
        const modelTagNames = model.tags?.map(t => t.tag.name) || []
        return selectedTags.some(tagId => {
          const tag = tags.find(t => t.id === tagId)
          return tag && modelTagNames.includes(tag.name)
        })
      })
    }

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(model =>
        model.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (model.author?.username || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 排序（注意：这里是客户端排序，实际应该在服务端完成）
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'popular':
        filtered.sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0))
        break
      case 'trending':
        filtered.sort((a, b) => 
          ((b.stats?.likes || 0) + (b.stats?.downloads || 0)) - 
          ((a.stats?.likes || 0) + (a.stats?.downloads || 0))
        )
        break
      case 'most_liked':
        filtered.sort((a, b) => (b.stats?.likes || 0) - (a.stats?.likes || 0))
        break
    }

    return filtered
  }, [models, selectedTags, searchTerm, sortBy, tags])

  // 标签操作
  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleClearAllTags = () => {
    setSelectedTags([])
  }

  // 加载更多
  const handleLoadMore = async () => {
    if (loading || !hasMore) return
    
    setLoading(true)
    
    try {
      const nextPage = currentPage + 1
      const result = await getFaceModels(nextPage, 12, { 
        sortBy,
        category: selectedTags.length > 0 ? undefined : undefined, // 暂时不支持标签过滤的服务端实现
        search: searchTerm || undefined
      })

      if (result.error) {
        console.error('加载更多数据失败:', result.error)
      } else {
        const transformedModels = result.data.map(transformModelData)
        setModels(prev => [...prev, ...transformedModels])
        setHasMore(result.hasNext ?? false)
        setCurrentPage(nextPage)
      }
    } catch (err) {
      console.error('加载更多数据异常:', err)
    } finally {
      setLoading(false)
    }
  }

  // 模型操作
  const handleLike = (id: string) => {
    console.log('点赞模型:', id)
    // 刷新模型数据以获取最新的点赞数
    loadInitialData()
  }

  const handleComment = (id: string) => {
    console.log('评论模型:', id)
  }

  const handleCopy = (id: string, data: object) => {
    console.log('复制JSON:', id, data)
    // 这里可以添加复制成功的提示
  }

  const handleDownload = (id: string) => {
    console.log('下载模型:', id)
  }

  const handleFavorite = (id: string) => {
    console.log('收藏模型:', id)
    // 刷新模型数据以获取最新的收藏状态
    loadInitialData()
  }

  // 初始加载状态
  if (initialLoading) {
    return (
      <div className={cn('min-h-screen bg-gray-50 flex items-center justify-center', className)}>
        <div className="text-center">
          <div className="flex space-x-2 justify-center mb-4">
            <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-gray-600">正在加载数据...</p>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className={cn('min-h-screen bg-gray-50 flex items-center justify-center', className)}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadInitialData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* 左侧标签筛选 */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-6">
              <TagFilter
                tags={tags.map(tag => ({
                  id: tag.id,
                  name: tag.name,
                  description: tag.description,
                  color: tag.color,
                  category: tag.category as any,
                  tag_type: tag.tag_type as any,
                  usageCount: tag.usage_count || 0,
                  createdAt: new Date()
                }))}
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
                onClearAll={handleClearAllTags}
              />
            </div>
          </div>

          {/* 右侧内容区域 */}
          <div className="flex-1 min-w-0">
            {/* 控制栏 */}
            <FeedControls
              sortBy={sortBy}
              viewMode={viewMode}
              searchTerm={searchTerm}
              onSortChange={setSortBy}
              onViewModeChange={setViewMode}
              onSearchChange={setSearchTerm}
              totalCount={filteredAndSortedModels.length}
              className="mb-6"
            />

            {/* 模型列表 */}
            {viewMode === 'grid' ? (
              <WaterfallLayout
                items={filteredAndSortedModels}
                renderItem={(model) => (
                  <ModelCard
                    key={model.id}
                    id={model.id}
                    title={model.title}
                    description={model.description}
                    author={{
                      name: model.author?.username || '未知作者',
                      avatar: undefined
                    }}
                    tags={model.tags?.map((tagRelation: { tag: { id: string; name: string; category: string } }) => ({
                      id: tagRelation.tag.id,
                      name: tagRelation.tag.name
                    })) || []}
                    stats={model.stats}
                    created_at={model.created_at}
                    json_data={model.json_data}
                    height={model.height}
                    onLike={handleLike}
                    onComment={handleComment}
                    onCopy={handleCopy}
                    onDownload={handleDownload}
                    onFavorite={handleFavorite}
                    onOpenDetail={(id) => setSelectedId(id)}
                  />
                )}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
                loading={loading}
                gap={16}
                minColumnWidth={280}
              />
            ) : (
              <div className="space-y-4">
                {filteredAndSortedModels.map((model) => (
                  <ModelCard
                    key={model.id}
                    id={model.id}
                    title={model.title}
                    description={model.description}
                    author={{
                      name: model.author?.username || '未知作者',
                      avatar: undefined
                    }}
                    tags={model.tags?.map(tagRelation => ({
                      id: tagRelation.tag.id,
                      name: tagRelation.tag.name
                    })) || []}
                    stats={model.stats}
                    created_at={model.created_at}
                    json_data={model.json_data}
                    height={model.height}
                    onLike={handleLike}
                    onComment={handleComment}
                    onCopy={handleCopy}
                    onDownload={handleDownload}
                    onFavorite={handleFavorite}
                    className="w-full"
                    onOpenDetail={(id) => setSelectedId(id)}
                  />
                ))}
                {loading && (
                  <div className="flex justify-center py-8">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 空状态 */}
            {filteredAndSortedModels.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">未找到匹配的模型</h3>
                <p className="text-gray-600">尝试调整搜索条件或筛选标签</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedId && (
        <ModelDetailOverlay id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  )
}