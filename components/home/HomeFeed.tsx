'use client'

import { useState, useEffect, useMemo } from 'react'
import TagFilter from '@/components/feed/TagFilter'
import FeedControls, { SortOption, ViewMode } from '@/components/feed/FeedControls'
import WaterfallLayout from '@/components/feed/WaterfallLayout'
import ModelCard from '@/components/feed/ModelCard'
import ModelDetailOverlay from '@/components/feed/ModelDetailOverlay'
import { getFaceModels, getTags } from '@/lib/supabase'

// 真实数据接口定义
interface HomeModel {
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

interface HomeTag {
  id: string
  name: string
  category: string
  usage_count?: number
}



export default function HomeFeed() {
  const [models, setModels] = useState<HomeModel[]>([])
  const [tags, setTags] = useState<HomeTag[]>([])
  const [filteredModels, setFilteredModels] = useState<HomeModel[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('latest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // 确保客户端挂载后再计算动态标签统计
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 从 Supabase 获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // 并行获取模型和标签数据
        const [modelsResponse, tagsResponse] = await Promise.all([
          getFaceModels(),
          getTags()
        ])

        // 检查是否有错误
        if (modelsResponse.error) {
          console.error('获取模型数据失败:', modelsResponse.error)
        }
        if (tagsResponse.error) {
          console.error('获取标签数据失败:', tagsResponse.error)
        }

        // 转换模型数据格式
        const transformedModels: HomeModel[] = (modelsResponse.data || []).map(model => ({
          ...model,
          tags: model.tags?.map((tagRelation: { tag: { id: string; name: string; category: string } }) => ({
            tag: tagRelation.tag
          })) || []
        }))

        setModels(transformedModels)
        setTags(tagsResponse.data || [])
      } catch (error) {
        console.error('获取数据失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // 计算动态标签统计数字
  const tagsWithCounts = useMemo(() => {
    // 在服务器端渲染时或数据未加载时返回空数组
    if (!isClient || models.length === 0) {
      return tags.map(tag => ({
        ...tag,
        usage_count: tag.usage_count || 0
      }))
    }

    // 获取当前搜索条件下的模型（不包括标签筛选）
    let baseModels = [...models]
    
    // 只应用搜索筛选，不应用标签筛选
    if (searchTerm) {
      baseModels = baseModels.filter(model =>
        model.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (model.author?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.tags?.some(tagRelation => 
          tagRelation.tag.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // 计算每个标签在基础筛选结果中的数量
    return tags.map(tag => ({
      ...tag,
      usage_count: baseModels.filter(model => 
        model.tags?.some(tagRelation => tagRelation.tag.id === tag.id)
      ).length
    }))
  }, [models, tags, searchTerm, isClient])

  // 筛选和排序逻辑
  useEffect(() => {
    let filtered = [...models]

    // 标签筛选
    if (selectedTags.length > 0) {
      filtered = filtered.filter(model =>
        selectedTags.some(selectedTagId => 
          model.tags?.some(tagRelation => tagRelation.tag.id === selectedTagId)
        )
      )
    }

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(model =>
        model.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (model.author?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.tags?.some(tagRelation => 
          tagRelation.tag.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // 排序
    switch (sortBy) {
      case 'trending':
        filtered.sort((a, b) => {
          const aScore = (a.stats?.views || 0) + (a.stats?.likes || 0)
          const bScore = (b.stats?.views || 0) + (b.stats?.likes || 0)
          return bScore - aScore
        })
        break
      case 'popular':
        filtered.sort((a, b) => (b.stats?.downloads || 0) - (a.stats?.downloads || 0))
        break
      case 'most_liked':
        filtered.sort((a, b) => (b.stats?.likes || 0) - (a.stats?.likes || 0))
        break
      default: // latest
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    setFilteredModels(filtered)
  }, [models, selectedTags, sortBy, searchTerm])

  // 处理标签切换
  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  // 清除所有标签
  const handleClearAllTags = () => {
    setSelectedTags([])
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            探索精彩模型
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            发现社区创作者们分享的捏脸数据，通过标签筛选找到最适合你的风格
          </p>
        </div>

        {/* 筛选控制区域 */}
        <div className="mb-8 sticky top-0 z-10 bg-gray-50 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <FeedControls
            sortBy={sortBy}
            viewMode={viewMode}
            searchTerm={searchTerm}
            onSortChange={setSortBy}
            onViewModeChange={setViewMode}
            onSearchChange={setSearchTerm}
            totalCount={filteredModels.length}
          />
        </div>

        {/* 主要内容区域 */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧标签筛选 */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-8">
              <TagFilter
                tags={tagsWithCounts}
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
                onClearAll={handleClearAllTags}
              />
            </div>
          </div>

          {/* 右侧内容区域 */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">暂无符合条件的模型</p>
              </div>
            ) : viewMode === 'grid' ? (
              <WaterfallLayout
                items={filteredModels}
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
                    json_data={model.json_data}
                    tags={model.tags?.map((tagRelation: { tag: { id: string; name: string; category: string } }) => ({
                      id: tagRelation.tag.id,
                      name: tagRelation.tag.name
                    })) || []}
                    stats={model.stats}
                    created_at={model.created_at}
                    height={model.height}
                    onOpenDetail={(id) => setSelectedId(id)}
                  />
                )}
                onLoadMore={() => {}}
                loading={false}
                hasMore={false}
              />
            ) : (
              <div className="space-y-4">
                {filteredModels.map((model) => (
                  <ModelCard
                    key={model.id}
                    id={model.id}
                    title={model.title}
                    description={model.description}
                    author={{
                      name: model.author?.username || '未知作者',
                      avatar: undefined
                    }}
                    json_data={model.json_data}
                    tags={model.tags?.map(tagRelation => ({
                      id: tagRelation.tag.id,
                      name: tagRelation.tag.name
                    })) || []}
                    stats={model.stats}
                    created_at={model.created_at}
                    height={model.height}
                    className="w-full"
                    onOpenDetail={(id) => setSelectedId(id)}
                  />
                ))}
              </div>
            )}
            {selectedId && (
              <ModelDetailOverlay id={selectedId} onClose={() => setSelectedId(null)} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}