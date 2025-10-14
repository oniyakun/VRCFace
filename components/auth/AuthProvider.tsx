'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/types'
import { authManager } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, accessToken: string) => void
  logout: () => void
  refreshUser: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 初始化认证状态
    const initAuth = async () => {
      try {
        // 检查是否有存储的用户信息
        const storedUser = authManager.getUser()
        const storedToken = authManager.getAccessToken()

        if (storedUser && storedToken) {
          // 验证令牌是否仍然有效
          const isValid = await authManager.validateToken()
          if (isValid) {
            setUser(authManager.getUser())
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // 监听认证状态变化
    const unsubscribe = authManager.addListener((newUser) => {
      setUser(newUser)
    })

    return unsubscribe
  }, [])

  const login = (user: User, accessToken: string) => {
    authManager.setUser(user, accessToken)
  }

  const logout = () => {
    authManager.logout()
  }

  const refreshUser = async (): Promise<User | null> => {
    return await authManager.refreshUser()
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 高阶组件：需要认证的页面
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      // 重定向到登录页面
      if (typeof window !== 'undefined') {
        window.location.href = '/auth'
      }
      return null
    }

    return <Component {...props} />
  }
}

// 路由保护组件
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // 重定向到登录页面
    if (typeof window !== 'undefined') {
      window.location.href = '/auth'
    }
    return null
  }

  return <>{children}</>
}