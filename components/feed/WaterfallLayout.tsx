'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/i18n/LanguageProvider'

interface WaterfallItem {
  id: string
  height?: number
  [key: string]: any
}

interface WaterfallLayoutProps {
  items: WaterfallItem[]
  renderItem: (item: WaterfallItem, index: number) => React.ReactNode
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
  className?: string
  gap?: number
  minColumnWidth?: number
}

export default function WaterfallLayout({
  items,
  renderItem,
  onLoadMore,
  hasMore = false,
  loading = false,
  className = '',
  gap = 16,
  minColumnWidth = 280
}: WaterfallLayoutProps) {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<{ [key: string]: HTMLDivElement }>({})
  const [columns, setColumns] = useState(3)
  const [columnHeights, setColumnHeights] = useState<number[]>([])
  const [itemPositions, setItemPositions] = useState<{ [key: string]: { x: number; y: number; column: number } }>({})
  const [itemHeights, setItemHeights] = useState<{ [key: string]: number }>({})
  const [isLayoutReady, setIsLayoutReady] = useState(false)

  // 计算列数
  const calculateColumns = useCallback(() => {
    if (!containerRef.current) return 3
    const containerWidth = containerRef.current.offsetWidth
    const cols = Math.max(1, Math.floor((containerWidth + gap) / (minColumnWidth + gap)))
    return Math.min(cols, 4) // 最多4列
  }, [gap, minColumnWidth])

  // 响应式调整列数
  useEffect(() => {
    const handleResize = () => {
      const newColumns = calculateColumns()
      if (newColumns !== columns) {
        setColumns(newColumns)
        setColumnHeights(new Array(newColumns).fill(0))
        setItemPositions({})
        setIsLayoutReady(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [calculateColumns, columns])

  // 初始化列高度
  useEffect(() => {
    if (columnHeights.length !== columns) {
      setColumnHeights(new Array(columns).fill(0))
      setItemPositions({})
      setIsLayoutReady(false)
    }
  }, [columns, columnHeights.length])

  // 测量所有项目的实际高度
  const measureItemHeights = useCallback(() => {
    const newItemHeights: { [key: string]: number } = {}
    let allMeasured = true

    items.forEach((item) => {
      const element = itemRefs.current[item.id]
      if (element) {
        const height = element.offsetHeight
        if (height > 0) {
          newItemHeights[item.id] = height
        } else {
          allMeasured = false
        }
      } else {
        allMeasured = false
      }
    })

    if (allMeasured && Object.keys(newItemHeights).length === items.length) {
      setItemHeights(newItemHeights)
      return true
    }
    return false
  }, [items])

  // 计算项目位置
  const calculatePositions = useCallback(() => {
    if (!containerRef.current || columns === 0 || Object.keys(itemHeights).length === 0) return

    const containerWidth = containerRef.current.offsetWidth
    if (containerWidth <= 0) return

    const columnWidth = Math.max(0, (containerWidth - gap * (columns - 1)) / columns)
    const newColumnHeights = new Array(columns).fill(0)
    const newItemPositions: { [key: string]: { x: number; y: number; column: number } } = {}

    items.forEach((item) => {
      // 确保所有高度值都是有效的
      if (!newColumnHeights.every(h => isFinite(h))) {
        newColumnHeights.fill(0)
      }
      
      // 找到最短的列
      const shortestColumnIndex = newColumnHeights.indexOf(Math.min(...newColumnHeights))
      
      // 计算位置
      const x = shortestColumnIndex * (columnWidth + gap)
      const y = newColumnHeights[shortestColumnIndex]
      
      // 使用实际高度，确保是有效数值
      const actualHeight = Math.max(0, itemHeights[item.id] || 400) // 默认高度作为后备
      
      newItemPositions[item.id] = { x, y, column: shortestColumnIndex }
      newColumnHeights[shortestColumnIndex] += actualHeight + gap
    })

    // 确保最终的列高度都是有效的
    const validColumnHeights = newColumnHeights.map(h => isFinite(h) ? h : 0)

    setItemPositions(newItemPositions)
    setColumnHeights(validColumnHeights)
    setIsLayoutReady(true)
  }, [items, columns, gap, itemHeights])

  // 当项目高度测量完成后重新计算位置
  useEffect(() => {
    if (Object.keys(itemHeights).length > 0) {
      calculatePositions()
    }
  }, [itemHeights, calculatePositions])

  // 延迟测量高度，确保DOM渲染完成
  useEffect(() => {
    const timer = setTimeout(() => {
      if (measureItemHeights()) {
        calculatePositions()
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [items, measureItemHeights, calculatePositions])

  // 使用 ResizeObserver 监听项目尺寸变化
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (measureItemHeights()) {
        calculatePositions()
      }
    })

    Object.values(itemRefs.current).forEach((element) => {
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [items, measureItemHeights, calculatePositions])

  // 无限滚动检测
  useEffect(() => {
    if (!hasMore || loading || !onLoadMore) return

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      if (scrollTop + windowHeight >= documentHeight - 1000) {
        onLoadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loading, onLoadMore])

  const containerHeight = columnHeights.length > 0 && columnHeights.every(h => isFinite(h)) 
    ? Math.max(...columnHeights) 
    : 0
  const containerWidth = containerRef.current?.offsetWidth || 0
  const columnWidth = containerWidth > 0 && columns > 0 
    ? Math.max(0, (containerWidth - gap * (columns - 1)) / columns)
    : 0

  return (
    <div className={cn('relative w-full', className)}>
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: isFinite(containerHeight) && containerHeight > 0 ? containerHeight : 'auto' }}
      >
        {items.map((item, index) => {
          const position = itemPositions[item.id]

          return (
            <div
              key={item.id}
              ref={(el) => {
                if (el) {
                  itemRefs.current[item.id] = el
                } else {
                  delete itemRefs.current[item.id]
                }
              }}
              className={cn(
                "absolute transition-all duration-300 ease-out",
                !isLayoutReady && "opacity-0"
              )}
              style={{
                left: position?.x || 0,
                top: position?.y || 0,
                width: isFinite(columnWidth) && columnWidth > 0 ? columnWidth : 'auto',
                transform: 'translateZ(0)', // 硬件加速
                opacity: isLayoutReady ? 1 : 0,
              }}
            >
              {renderItem(item, index)}
            </div>
          )
        })}
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* 布局计算状态 */}
      {!isLayoutReady && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-pulse text-gray-500">{t('ui.waterfall.layoutCalculating')}</div>
        </div>
      )}

      {/* 无更多内容提示 */}
      {!hasMore && items.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          {t('ui.waterfall.allContentLoaded')}
        </div>
      )}
    </div>
  )
}