'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/Button'

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const router = useRouter()
  const pathname = usePathname()

  // 检查是否在主页面
  const isOnHomePage = pathname === '/'

  // 滚动监听
  useEffect(() => {
    if (!isOnHomePage) {
      setIsVisible(true)
      return
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // 获取视窗高度，用于判断是否滚动到瀑布流区域
      const viewportHeight = window.innerHeight
      
      // 如果滚动距离小于导航栏高度，始终显示
      if (currentScrollY < 64) {
        setIsVisible(true)
      } else if (currentScrollY > viewportHeight * 0.8) {
        // 当滚动超过80%视窗高度时（接近瀑布流区域），开始响应滚动方向
        if (currentScrollY < lastScrollY) {
          setIsVisible(true)  // 向上滚动显示
        } else if (currentScrollY > lastScrollY) {
          setIsVisible(false) // 向下滚动隐藏
          setIsMenuOpen(false) // 隐藏时关闭菜单
        }
      } else {
        // 在Hero区域时始终显示
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    // 添加滚动监听器
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY, isOnHomePage])

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      logout()
      router.push('/')
    }
  }

  const handleProfileClick = () => {
    if (user) {
      router.push(`/profile/${user.id}`)
    }
  }

  return (
    <nav className={`bg-white shadow-lg sticky top-0 z-50 transition-transform duration-300 ease-in-out ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo 和主导航 */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="text-2xl font-bold text-blue-600">VRCFace</div>
            </Link>
            
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                首页
              </Link>
              <Link 
                href="/docs" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                文档
              </Link>
            </div>
          </div>

          {/* 用户菜单 */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* 发帖按钮 */}
                <Link href="/create">
                  <Button 
                    variant="primary" 
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
                  >
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>发帖</span>
                  </Button>
                </Link>
                
                <div className="relative">
                  <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.displayName || user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      (user.displayName || user.username).charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user.displayName || user.username}
                  </span>
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* 下拉菜单 */}
                 {isMenuOpen && (
                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                     <button
                       onClick={handleProfileClick}
                       className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                     >
                       个人主页
                     </button>
                     <Link
                       href="/settings"
                       className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                       onClick={() => setIsMenuOpen(false)}
                     >
                       设置
                     </Link>
                     <hr className="my-1" />
                     <button
                       onClick={handleLogout}
                       className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                     >
                       退出登录
                     </button>
                   </div>
                 )}
               </div>
               </>
             ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth">
                  <Button variant="outline" size="sm">
                    登录/注册
                  </Button>
                </Link>
              </div>
            )}

            {/* 移动端菜单按钮 */}
            <button className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 点击外部关闭菜单 */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  )
}