'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageLightboxProps {
  images: string[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
  className?: string
}

export default function ImageLightbox({ 
  images, 
  initialIndex = 0, 
  isOpen, 
  onClose, 
  className = '' 
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isVisible, setIsVisible] = useState(false)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoading, setImageLoading] = useState(true)

  // 重置图片状态
  const resetImageState = useCallback(() => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    setImageLoading(true)
  }, [])

  // 当索引改变时重置图片状态
  useEffect(() => {
    resetImageState()
  }, [currentIndex, resetImageState])

  // 打开/关闭动画
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      resetImageState()
      setTimeout(() => setIsVisible(true), 10)
    } else {
      setIsVisible(false)
    }
  }, [isOpen, initialIndex, resetImageState])

  // 键盘事件处理
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          handleClose()
          break
        case 'ArrowLeft':
          e.preventDefault()
          goToPrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          goToNext()
          break
        case '+':
        case '=':
          e.preventDefault()
          handleZoomIn()
          break
        case '-':
          e.preventDefault()
          handleZoomOut()
          break
        case 'r':
        case 'R':
          e.preventDefault()
          handleRotate()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, images.length])

  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(), 200)
  }

  const goToPrevious = () => {
    if (images.length <= 1) return
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNext = () => {
    if (images.length <= 1) return
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev * 1.2, 3))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev / 1.2, 0.5))
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleReset = () => {
    resetImageState()
  }

  // 鼠标拖拽处理
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale((prev) => Math.min(Math.max(prev * delta, 0.5), 3))
  }

  if (!isOpen) return null

  return (
    <div className={cn("fixed inset-0 z-50", className)}>
      {/* 背景遮罩 */}
      <div 
        className={cn(
          "absolute inset-0 bg-black transition-opacity duration-300",
          isVisible ? 'opacity-90' : 'opacity-0'
        )} 
        onClick={handleClose} 
      />

      {/* 工具栏 */}
      <div className={cn(
        "absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 transition-all duration-300",
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      )}>
        <button
          onClick={handleZoomOut}
          className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          title="缩小 (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-white text-sm min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          title="放大 (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-white/30" />
        <button
          onClick={handleRotate}
          className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          title="旋转 (R)"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors text-sm"
          title="重置"
        >
          重置
        </button>
      </div>

      {/* 关闭按钮 */}
      <button
        onClick={handleClose}
        className={cn(
          "absolute top-4 right-4 z-10 p-2 text-white hover:bg-white/20 rounded-lg transition-all duration-300",
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        )}
        title="关闭 (ESC)"
      >
        <X className="w-6 h-6" />
      </button>

      {/* 图片计数器 */}
      {images.length > 1 && (
        <div className={cn(
          "absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-sm transition-all duration-300",
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        )}>
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* 主图片容器 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative max-w-full max-h-full cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
        >
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <img
            src={images[currentIndex]}
            alt={`图片 ${currentIndex + 1}`}
            className={cn(
              "max-w-[90vw] max-h-[90vh] object-contain transition-opacity duration-300",
              imageLoading ? 'opacity-0' : 'opacity-100'
            )}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
            draggable={false}
          />
        </div>
      </div>

      {/* 导航按钮 */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 text-white hover:bg-white/20 rounded-lg transition-all duration-300",
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            )}
            title="上一张 (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 text-white hover:bg-white/20 rounded-lg transition-all duration-300",
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            )}
            title="下一张 (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* 缩略图导航 */}
      {images.length > 1 && (
        <div className={cn(
          "absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex space-x-2 bg-black/50 backdrop-blur-sm rounded-lg p-2 max-w-[90vw] overflow-x-auto transition-all duration-300",
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200",
                index === currentIndex 
                  ? 'border-white scale-110' 
                  : 'border-transparent hover:border-white/50'
              )}
            >
              <img
                src={image}
                alt={`缩略图 ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}