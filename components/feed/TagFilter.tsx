'use client'

import { useState } from 'react'
import { Search, X, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Tag {
  id: string
  name: string
  usage_count: number
  color?: string
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

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isTagSelected = (tagId: string) => selectedTags.includes(tagId)

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

      {/* 搜索框 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="搜索标签..."
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
                  className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full hover:bg-primary-200 transition-colors"
                >
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
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'hover:bg-gray-50 text-gray-700'
              )}
            >
              <span className="font-medium">{tag.name}</span>
              <span className={cn(
                'text-xs px-2 py-1 rounded-full',
                isTagSelected(tag.id)
                  ? 'bg-primary-200 text-primary-800'
                  : 'bg-gray-200 text-gray-600'
              )}>
                {tag.usage_count}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}