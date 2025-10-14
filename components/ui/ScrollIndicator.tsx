'use client'

import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ScrollIndicatorProps {
  targetId: string
  className?: string
}

export default function ScrollIndicator({ targetId, className = '' }: ScrollIndicatorProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      
      // 当滚动超过视窗高度的30%时隐藏指示器
      setIsVisible(scrollPosition < windowHeight * 0.3)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTarget = () => {
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  if (!isVisible) return null

  return (
    <div 
      className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10 cursor-pointer ${className}`}
      onClick={scrollToTarget}
    >
      <div className="flex flex-col items-center space-y-2 text-secondary-600 hover:text-primary-600 transition-colors duration-200">
        <span className="text-sm font-medium">向下滚动</span>
        <ChevronDown className="w-6 h-6 animate-bounce-slow" />
      </div>
    </div>
  )
}