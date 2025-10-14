'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search } from 'lucide-react'
import TagFilter from './TagFilter'
import FeedControls, { SortOption, ViewMode } from './FeedControls'
import WaterfallLayout from './WaterfallLayout'
import ModelCard from './ModelCard'
import { cn } from '@/lib/utils'

// 模拟数据类型
interface MockModel {
  id: string
  title: string
  description: string
  author: {
    name: string
    avatar?: string
  }
  thumbnail?: string
  tags: string[]
  stats: {
    likes: number
    comments: number
    downloads: number
    views: number
  }
  createdAt: string
  jsonData: object
  height?: number
}

interface MockTag {
  id: string
  name: string
  count: number
}

// 模拟数据
const mockTags: MockTag[] = [
  { id: '1', name: '动漫角色', count: 156 },
  { id: '2', name: '原创设计', count: 89 },
  { id: '3', name: '游戏角色', count: 234 },
  { id: '4', name: '机械风格', count: 67 },
  { id: '5', name: '可爱风格', count: 198 },
  { id: '6', name: '写实风格', count: 45 },
  { id: '7', name: '幻想生物', count: 78 },
  { id: '8', name: '科幻风格', count: 123 },
  { id: '9', name: '复古风格', count: 34 },
  { id: '10', name: '简约风格', count: 56 }
]

const generateMockModels = (count: number, startId: number = 0): MockModel[] => {
  const titles = [
    '可爱的猫娘角色', '机械战士模型', '梦幻精灵设计', '赛博朋克女孩',
    '古风仙女', '未来机器人', '魔法师角色', '太空探险者',
    '森林守护者', '海洋公主', '火焰战士', '冰雪女王',
    '星空法师', '龙族战士', '天使守护', '恶魔猎手'
  ]
  
  const descriptions = [
    '精心设计的高质量VRC模型，包含完整的动画和表情系统',
    '采用最新建模技术制作，支持多种自定义选项',
    '原创设计角色，具有独特的风格和个性',
    '高度优化的模型，适合各种VR环境使用',
    '包含丰富的配件和服装选择',
    '支持实时光照和阴影效果'
  ]

  const authors = [
    { name: 'ArtistA', avatar: undefined },
    { name: 'CreatorB', avatar: undefined },
    { name: 'DesignerC', avatar: undefined },
    { name: 'ModelMaker', avatar: undefined },
    { name: 'VRCPro', avatar: undefined }
  ]

  return Array.from({ length: count }, (_, i) => {
    const id = (startId + i + 1).toString()
    return {
      id,
      title: titles[i % titles.length] + ` #${id}`,
      description: descriptions[i % descriptions.length],
      author: authors[i % authors.length],
      thumbnail: Math.random() > 0.3 ? `https://picsum.photos/400/${300 + Math.floor(Math.random() * 200)}?random=${id}` : undefined,
      tags: mockTags.slice(0, Math.floor(Math.random() * 4) + 1).map(tag => tag.name),
      stats: {
        likes: Math.floor(Math.random() * 500),
        comments: Math.floor(Math.random() * 50),
        downloads: Math.floor(Math.random() * 200),
        views: Math.floor(Math.random() * 1000) + 100
      },
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      jsonData: { modelId: id, version: '1.0', type: 'vrchat-avatar' },
      height: 300 + Math.random() * 200
    }
  })
}

interface FeedPageProps {
  className?: string
}

export default function FeedPage({ className = '' }: FeedPageProps) {
  // 状态管理
  const [models, setModels] = useState<MockModel[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('latest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // 初始化数据
  useEffect(() => {
    setModels(generateMockModels(20))
  }, [])

  // 筛选和排序逻辑
  const filteredAndSortedModels = useMemo(() => {
    let filtered = models

    // 标签筛选
    if (selectedTags.length > 0) {
      filtered = filtered.filter(model =>
        selectedTags.some(tag => model.tags.includes(mockTags.find(t => t.id === tag)?.name || ''))
      )
    }

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(model =>
        model.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.author.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 排序
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'popular':
        filtered.sort((a, b) => b.stats.views - a.stats.views)
        break
      case 'trending':
        filtered.sort((a, b) => (b.stats.likes + b.stats.downloads) - (a.stats.likes + a.stats.downloads))
        break
      case 'most_liked':
        filtered.sort((a, b) => b.stats.likes - a.stats.likes)
        break
    }

    return filtered
  }, [models, selectedTags, searchTerm, sortBy])

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
  const handleLoadMore = () => {
    if (loading) return
    
    setLoading(true)
    setTimeout(() => {
      const newModels = generateMockModels(10, models.length)
      setModels(prev => [...prev, ...newModels])
      setLoading(false)
      
      // 模拟没有更多数据
      if (models.length >= 80) {
        setHasMore(false)
      }
    }, 1000)
  }

  // 模型操作
  const handleLike = (id: string) => {
    console.log('点赞模型:', id)
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

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* 左侧标签筛选 */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-6">
              <TagFilter
                tags={mockTags}
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
                    {...model}
                    onLike={handleLike}
                    onComment={handleComment}
                    onCopy={handleCopy}
                    onDownload={handleDownload}
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
                    {...model}
                    onLike={handleLike}
                    onComment={handleComment}
                    onCopy={handleCopy}
                    onDownload={handleDownload}
                    className="w-full"
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
    </div>
  )
}