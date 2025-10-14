import { User } from '@/types'

// 认证状态管理
export class AuthManager {
  private static instance: AuthManager
  private user: User | null = null
  private accessToken: string | null = null
  private listeners: ((user: User | null) => void)[] = []

  private constructor() {
    // 初始化时从 localStorage 恢复状态
    if (typeof window !== 'undefined') {
      this.loadFromStorage()
    }
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  // 从 localStorage 加载用户信息
  private loadFromStorage() {
    try {
      const userStr = localStorage.getItem('user')
      const token = localStorage.getItem('accessToken')
      
      if (userStr && token) {
        this.user = JSON.parse(userStr)
        this.accessToken = token
      }
    } catch (error) {
      console.error('Load auth state error:', error)
      this.clearStorage()
    }
  }

  // 保存到 localStorage
  private saveToStorage() {
    if (this.user && this.accessToken) {
      localStorage.setItem('user', JSON.stringify(this.user))
      localStorage.setItem('accessToken', this.accessToken)
    } else {
      this.clearStorage()
    }
  }

  // 清除 localStorage
  private clearStorage() {
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
  }

  // 通知所有监听器
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.user))
  }

  // 设置用户信息
  setUser(user: User | null, accessToken?: string) {
    this.user = user
    if (accessToken) {
      this.accessToken = accessToken
    }
    
    if (typeof window !== 'undefined') {
      this.saveToStorage()
    }
    
    this.notifyListeners()
  }

  // 获取当前用户
  getUser(): User | null {
    return this.user
  }

  // 获取访问令牌
  getAccessToken(): string | null {
    return this.accessToken
  }

  // 检查是否已登录
  isAuthenticated(): boolean {
    return !!(this.user && this.accessToken)
  }

  // 登出
  logout() {
    this.user = null
    this.accessToken = null
    
    if (typeof window !== 'undefined') {
      this.clearStorage()
    }
    
    this.notifyListeners()
  }

  // 添加状态变化监听器
  addListener(listener: (user: User | null) => void) {
    this.listeners.push(listener)
    
    // 返回取消监听的函数
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // 验证令牌有效性
  async validateToken(): Promise<boolean> {
    if (!this.accessToken) {
      return false
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      const result = await response.json()

      if (result.success && result.data?.user) {
        // 更新用户信息
        this.setUser(result.data.user)
        return true
      } else {
        // 令牌无效，清除状态
        this.logout()
        return false
      }
    } catch (error) {
      console.error('Token validation error:', error)
      this.logout()
      return false
    }
  }

  // 刷新用户信息
  async refreshUser(): Promise<User | null> {
    if (!this.accessToken) {
      return null
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      const result = await response.json()

      if (result.success && result.data?.user) {
        this.setUser(result.data.user)
        return result.data.user
      } else {
        this.logout()
        return null
      }
    } catch (error) {
      console.error('Refresh user error:', error)
      return null
    }
  }
}

// 导出单例实例
export const authManager = AuthManager.getInstance()

// 便捷函数
export const getCurrentUser = () => authManager.getUser()
export const getAccessToken = () => authManager.getAccessToken()
export const isAuthenticated = () => authManager.isAuthenticated()
export const logout = () => authManager.logout()

// React Hook 用于在组件中使用认证状态
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(authManager.getUser())

  useEffect(() => {
    const unsubscribe = authManager.addListener(setUser)
    return unsubscribe
  }, [])

  return {
    user,
    isAuthenticated: !!user,
    login: (user: User, accessToken: string) => authManager.setUser(user, accessToken),
    logout: () => authManager.logout(),
    refreshUser: () => authManager.refreshUser(),
    validateToken: () => authManager.validateToken()
  }
}

// 需要在文件顶部添加 React 导入
import { useState, useEffect } from 'react'