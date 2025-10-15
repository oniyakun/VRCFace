'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthTokenSync() {
  useEffect(() => {
    const syncAuthToken = async () => {
      // 获取当前会话
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (session && !error) {
        // AuthTokenSync: Syncing auth token
        
        // 将 access token 设置到 cookies 中
        const expires = new Date(session.expires_at! * 1000)
        document.cookie = `auth-token=${session.access_token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`
        
        // 为后续请求设置默认 header
        const originalFetch = window.fetch
        window.fetch = function(input, init = {}) {
          const headers = new Headers(init.headers)
          headers.set('x-auth-token', session.access_token)
          
          return originalFetch(input, {
            ...init,
            headers
          })
        }
        
        // AuthTokenSync: Auth token synced
      } else {
        // AuthTokenSync: No valid session
        
        // 清除认证 token
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
    }

    syncAuthToken()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // AuthTokenSync: Auth state change handled silently
      
      if (session) {
        const expires = new Date(session.expires_at! * 1000)
        document.cookie = `auth-token=${session.access_token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`
        
        // 更新 fetch 拦截器
        const originalFetch = window.fetch
        window.fetch = function(input, init = {}) {
          const headers = new Headers(init.headers)
          headers.set('x-auth-token', session.access_token)
          
          return originalFetch(input, {
            ...init,
            headers
          })
        }
        
        // AuthTokenSync: Auth token updated
      } else {
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        // AuthTokenSync: Auth token cleared
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return null // 这是一个无UI的同步组件
}