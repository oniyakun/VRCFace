'use client'

import { useState, useEffect, useMemo } from 'react'
import TagFilter from '@/components/feed/TagFilter'
import FeedControls, { SortOption, ViewMode } from '@/components/feed/FeedControls'
import WaterfallLayout from '@/components/feed/WaterfallLayout'
import ModelCard from '@/components/feed/ModelCard'

// 模拟标签数据
const mockTags = [
  { id: '1', name: '可爱', count: 156 },
  { id: '2', name: '酷炫', count: 89 },
  { id: '3', name: '搞笑', count: 234 },
  { id: '4', name: '温柔', count: 67 },
  { id: '5', name: '机械', count: 45 },
  { id: '6', name: '动物', count: 123 },
  { id: '7', name: '科幻', count: 78 },
  { id: '8', name: '日常', count: 198 },
  { id: '9', name: '表情', count: 267 },
  { id: '10', name: '娱乐', count: 145 }
]

// 生成模拟模型数据
const generateMockModels = (count: number, startIndex: number = 0) => {
  const authors = ['NekoLover', 'CyberPunk', 'SoftSmile', 'FunnyFace', 'TechMaster', 'ArtisticSoul', 'CreativeMind', 'DigitalDreamer']
  const titles = [
    '可爱猫咪表情包', '酷炫机械风格', '温柔微笑系列', '夸张搞笑表情',
    '未来科技感', '梦幻少女风', '复古怀旧款', '简约现代派',
    '动漫二次元', '写实人物像', '抽象艺术风', '卡通Q版萌'
  ]
  const descriptions = [
    '精心制作的高质量模型，适合各种场景使用',
    '独特的设计风格，让你的虚拟形象更加出众',
    '细节丰富，表情生动，完美展现个性魅力',
    '创新的设计理念，融合了现代美学元素'
  ]

  // 预定义的缩略图尺寸，避免随机性
  const thumbnailSizes = [
    { width: 320, height: 240 },
    { width: 350, height: 280 },
    { width: 380, height: 320 },
    { width: 340, height: 260 },
    { width: 360, height: 300 },
    { width: 330, height: 250 },
    { width: 370, height: 290 },
    { width: 390, height: 310 }
  ]

  return Array.from({ length: count }, (_, i) => {
    const index = startIndex + i
    const sizeIndex = index % thumbnailSizes.length
    const size = thumbnailSizes[sizeIndex]
    
    return {
      id: String(index + 1),
      title: titles[index % titles.length],
      description: descriptions[index % descriptions.length],
      author: {
        name: authors[index % authors.length],
        avatar: `/api/placeholder/40/40`
      },
      createdAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString(),
      thumbnail: `/api/placeholder/${size.width}/${size.height}`,
      tags: mockTags.slice(0, (index % 4) + 1).map(tag => tag.name),
      stats: {
        likes: (index * 23) % 500 + 10,
        comments: (index * 7) % 100 + 1,
        downloads: (index * 41) % 1000 + 50,
        views: (index * 67) % 5000 + 100
      },
      isLiked: index % 3 === 0
    }
  })
}

export default function HomeFeed() {
  const [models, setModels] = useState(generateMockModels(20))
  const [filteredModels, setFilteredModels] = useState(models)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('latest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // 确保客户端挂载后再计算动态标签统计
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 计算动态标签统计数字
  const tagsWithCounts = useMemo(() => {
    // 在服务器端渲染时使用静态数据
    if (!isClient) {
      return mockTags
    }

    // 获取当前搜索条件下的模型（不包括标签筛选）
    let baseModels = [...models]
    
    // 只应用搜索筛选，不应用标签筛选
    if (searchTerm) {
      baseModels = baseModels.filter(model =>
        model.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // 计算每个标签在基础筛选结果中的数量
    return mockTags.map(tag => ({
      ...tag,
      count: baseModels.filter(model => model.tags.includes(tag.name)).length
    }))
  }, [models, searchTerm, isClient])

  // 筛选和排序逻辑
  useEffect(() => {
    let filtered = [...models]

    // 标签筛选
    if (selectedTags.length > 0) {
      // 将选中的标签 ID 转换为标签名称
      const selectedTagNames = selectedTags
        .map(tagId => mockTags.find(tag => tag.id === tagId)?.name)
        .filter((name): name is string => Boolean(name))
      
      filtered = filtered.filter(model =>
        selectedTagNames.some(tagName => model.tags.includes(tagName))
      )
    }

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(model =>
        model.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // 排序
    switch (sortBy) {
      case 'trending':
        filtered.sort((a, b) => (b.stats.views + b.stats.likes) - (a.stats.views + a.stats.likes))
        break
      case 'popular':
        filtered.sort((a, b) => b.stats.downloads - a.stats.downloads)
        break
      case 'most_liked':
        filtered.sort((a, b) => b.stats.likes - a.stats.likes)
        break
      default: // latest
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    setFilteredModels(filtered)
  }, [models, selectedTags, sortBy, searchTerm])

  // 加载更多数据
  const loadMore = () => {
    setIsLoading(true)
    setTimeout(() => {
      const newModels = generateMockModels(10, models.length)
      setModels([...models, ...newModels])
      setIsLoading(false)
    }, 1000)
  }

  // 处理点赞
  const handleLike = (modelId: string) => {
    setModels(prevModels =>
      prevModels.map(model =>
        model.id === modelId
          ? {
              ...model,
              isLiked: !model.isLiked,
              stats: {
                ...model.stats,
                likes: model.isLiked ? model.stats.likes - 1 : model.stats.likes + 1
              }
            }
          : model
      )
    )
  }

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
            发现社区创作者们分享的优质 VRChat 面部表情模型，找到最适合你的风格
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
            {viewMode === 'grid' ? (
              <WaterfallLayout
                items={filteredModels}
                renderItem={(model) => (
                  <ModelCard
                    key={model.id}
                    id={model.id}
                    title={model.title}
                    description={model.description}
                    author={model.author}
                    thumbnail={model.thumbnail}
                    tags={model.tags}
                    stats={model.stats}
                    createdAt={model.createdAt}
                    onLike={() => handleLike(model.id)}
                  />
                )}
                onLoadMore={loadMore}
                loading={isLoading}
                hasMore={models.length < 100} // 限制最大数量
              />
            ) : (
              <div className="space-y-4">
                {filteredModels.map((model) => (
                  <ModelCard
                    key={model.id}
                    id={model.id}
                    title={model.title}
                    description={model.description}
                    author={model.author}
                    thumbnail={model.thumbnail}
                    tags={model.tags}
                    stats={model.stats}
                    createdAt={model.createdAt}
                    onLike={() => handleLike(model.id)}
                    className="w-full"
                  />
                ))}
                {isLoading && (
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
          </div>
        </div>
      </div>
    </section>
  )
}