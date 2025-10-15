'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

interface User {
  id: string
  username: string
  email: string
  displayName: string
  avatar?: string
  bio?: string
  isVerified: boolean
  role: string
  createdAt: string
  updatedAt: string
  stats?: {
    modelsCount: number
    likesReceived: number
    commentsReceived: number
    followersCount: number
    followingCount: number
  }
}

interface AuthContextType {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 从用户详细信息API获取完整用户数据
  const fetchUserDetails = async (supabaseUser: SupabaseUser, accessToken: string): Promise<User | null> => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.user) {
          return data.data.user
        }
      }
      return null
    } catch (error) {
      // Error fetching user details handled silently
      return null
    }
  }

  useEffect(() => {
    // 获取初始会话
    const getInitialSession = async () => {
      try {
        // AuthProvider: Getting initial session...
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        // AuthProvider: Initial session result handled silently
        
        if (error) {
          // AuthProvider: Error getting initial session handled silently
          setIsLoading(false)
          return
        }

        if (initialSession?.user) {
          // AuthProvider: Found valid session, setting user state
          setSession(initialSession)
          const userDetails = await fetchUserDetails(initialSession.user, initialSession.access_token)
          // AuthProvider: User details handled silently
          setUser(userDetails)
        } else {
          // AuthProvider: No valid session found
        }
      } catch (error) {
        // AuthProvider: Error in getInitialSession handled silently
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // AuthProvider: Auth state changed handled silently
        
        setSession(session)
        
        if (session?.user) {
          // 用户登录或会话恢复
          // AuthProvider: User session restored/logged in
          const userDetails = await fetchUserDetails(session.user, session.access_token)
          setUser(userDetails)
        } else {
          // 用户登出或会话过期
          // AuthProvider: User session expired/logged out
          setUser(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Supabase login error handled silently
        
        // 处理常见错误
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: '邮箱或密码错误' }
        }
        if (error.message.includes('Email not confirmed')) {
          return { success: false, error: '请先验证您的邮箱' }
        }
        
        return { success: false, error: error.message || '登录失败' }
      }

      if (data.user && data.session) {
        // Supabase 会自动处理会话存储，onAuthStateChange 会被触发
        return { success: true }
      } else {
        return { success: false, error: '登录失败，请稍后重试' }
      }
    } catch (error) {
      // Login error handled silently
      return { success: false, error: '网络错误，请稍后重试' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        // Logout error handled silently
      }
      // onAuthStateChange 会自动处理状态清理
      router.push('/auth')
    } catch (error) {
      // Logout error handled silently
    }
  }

  const refreshUser = async () => {
    try {
      if (session?.access_token) {
        const userDetails = await fetchUserDetails(session.user, session.access_token)
        setUser(userDetails)
      }
    } catch (error) {
      // Refresh user error handled silently
    }
  }

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user && !!session,
    isLoading,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 高阶组件，用于保护需要认证的页面
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/auth')
      }
    }, [isAuthenticated, isLoading, router])

    if (isLoading) {
      return <div>Loading...</div>
    }

    if (!isAuthenticated) {
      return null
    }

    return <Component {...props} />
  }
}

// 保护路由组件
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}