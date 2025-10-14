'use client'

import { useState } from 'react'
import { Search, X, Hash, User, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Tag {
  id: string
  name: string
  description?: string
  color?: string
  category: string
  tag_type: 'model_name' | 'model_style'
  usageCount: number
  createdAt: Date
}

interface TagFilterProps {
  tags: Tag[]
  selectedTags: string[]
  onTagToggle: (tagId: string) => void
  onClearAll: () => void
  className?: string
}

export default function TagFilter({ 
  tags, 
  selectedTags, 
  onTagToggle, 
  onClearAll, 
  className = '' 
}: TagFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSection, setActiveSection] = useState<'model_name' | 'model_style'>('model_name')

  // 按类型分组标签
  const modelNameTags = tags.filter(tag => tag.tag_type === 'model_name')
  const modelStyleTags = tags.filter(tag => tag.tag_type === 'model_style')

  // 根据当前选择的区域和搜索词过滤标签
  const getFilteredTags = () => {
    const tagsToFilter = activeSection === 'model_name' ? modelNameTags : modelStyleTags
    
    return tagsToFilter.filter(tag =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const filteredTags = getFilteredTags()
  const isTagSelected = (tagId: string) => selectedTags.includes(tagId)

  // 获取已选标签的统计
  const selectedModelNameCount = selectedTags.filter(tagId => {
    const tag = tags.find(t => t.id === tagId)
    return tag?.tag_type === 'model_name'
  }).length

  const selectedModelStyleCount = selectedTags.filter(tagId => {
    const tag = tags.find(t => t.id === tagId)
    return tag?.tag_type === 'model_style'
  }).length

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border p-6', className)}>
      {/* 标题和清除按钮 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Hash className="w-5 h-5 mr-2 text-primary-600" />
          标签筛选
        </h3>
        {selectedTags.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            清除全部
          </button>
        )}
      </div>

      {/* 标签类型切换 */}
      <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveSection('model_name')}
          className={cn(
            'flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
            activeSection === 'model_name'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <User className="w-4 h-4 mr-1" />
          模型名字
        </button>
        <button
          onClick={() => setActiveSection('model_style')}
          className={cn(
            'flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
            activeSection === 'model_style'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <Palette className="w-4 h-4 mr-1" />
          模型风格
        </button>
      </div>

      {/* 搜索框 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={`搜索${activeSection === 'model_name' ? '模型名字' : activeSection === 'model_style' ? '模型风格' : ''}标签...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors"
        />
      </div>

      {/* 已选标签显示 */}
      {selectedTags.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">已选择 ({selectedTags.length})</p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tagId => {
              const tag = tags.find(t => t.id === tagId)
              if (!tag) return null
              return (
                <button
                  key={tagId}
                  onClick={() => onTagToggle(tagId)}
                  className={cn(
                    'inline-flex items-center px-3 py-1 text-sm rounded-full hover:opacity-80 transition-colors',
                    tag.tag_type === 'model_name'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  )}
                >
                  {tag.tag_type === 'model_name' ? (
                    <User className="w-3 h-3 mr-1" />
                  ) : (
                    <Palette className="w-3 h-3 mr-1" />
                  )}
                  {tag.name}
                  <X className="w-3 h-3 ml-1" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 标签列表 */}
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {filteredTags.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            {searchTerm ? '未找到匹配的标签' : '暂无标签'}
          </p>
        ) : (
          filteredTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => onTagToggle(tag.id)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors',
                isTagSelected(tag.id)
                  ? tag.tag_type === 'model_name'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'hover:bg-gray-50 text-gray-700'
              )}
            >
              <div className="flex items-center">
                {tag.tag_type === 'model_name' ? (
                  <User className="w-4 h-4 mr-2 text-blue-500" />
                ) : (
                  <Palette className="w-4 h-4 mr-2 text-purple-500" />
                )}
                <span className="font-medium">{tag.name}</span>
              </div>
              <span className={cn(
                'text-xs px-2 py-1 rounded-full',
                isTagSelected(tag.id)
                  ? tag.tag_type === 'model_name'
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-purple-200 text-purple-800'
                  : 'bg-gray-200 text-gray-600'
              )}>
                {tag.usageCount}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}