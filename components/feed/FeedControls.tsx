'use client'

import { useState } from 'react'
import { ChevronDown, Grid3X3, List, Search, SlidersHorizontal, TrendingUp, Clock, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/i18n/LanguageProvider'

export type SortOption = 'latest' | 'trending' | 'most_liked'
export type ViewMode = 'grid' | 'list'

interface FeedControlsProps {
  sortBy: SortOption
  viewMode: ViewMode
  searchTerm: string
  onSortChange: (sort: SortOption) => void
  onViewModeChange: (mode: ViewMode) => void
  onSearchChange: (term: string) => void
  totalCount?: number
  className?: string
}

export default function FeedControls({
  sortBy,
  viewMode,
  searchTerm,
  onSortChange,
  onViewModeChange,
  onSearchChange,
  totalCount,
  className = ''
}: FeedControlsProps) {
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const { t } = useLanguage()

  const sortOptions = [
    { value: 'latest' as SortOption, label: t('feedControls.sortOptions.latest'), icon: Clock },
    { value: 'trending' as SortOption, label: t('feedControls.sortOptions.trending'), icon: TrendingUp },
    { value: 'most_liked' as SortOption, label: t('feedControls.sortOptions.mostLiked'), icon: Heart }
  ]

  const currentSort = sortOptions.find(option => option.value === sortBy)

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border p-4', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* 左侧：搜索和统计 */}
        <div className="flex items-center space-x-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('feedControls.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors"
            />
          </div>
          
          {/* 统计信息 */}
          {totalCount !== undefined && (
            <span className="text-sm text-gray-600">
              {t('feedControls.totalCount', { count: totalCount })}
            </span>
          )}
        </div>

        {/* 右侧：排序和视图控制 */}
        <div className="flex items-center space-x-3">
          {/* 排序下拉菜单 */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {currentSort && <currentSort.icon className="w-4 h-4" />}
              <span className="text-sm font-medium">{currentSort?.label}</span>
              <ChevronDown className={cn(
                'w-4 h-4 transition-transform',
                showSortDropdown && 'rotate-180'
              )} />
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSortChange(option.value)
                        setShowSortDropdown(false)
                      }}
                      className={cn(
                        'w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors',
                        sortBy === option.value && 'bg-primary-50 text-primary-700'
                      )}
                    >
                      <option.icon className="w-4 h-4" />
                      <span className="text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 视图模式切换 */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
              title={t('feedControls.gridView')}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
              title={t('feedControls.listView')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* 高级筛选按钮 */}
          <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm">{t('feedControls.filter')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}