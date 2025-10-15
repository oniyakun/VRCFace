'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, FileText, Tags, TrendingUp, UserPlus, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AdminStats {
  overview: {
    totalUsers: number
    totalModels: number
    publicModels: number
    totalTags: number
    newUsersThisWeek: number
    newModelsThisWeek: number
  }
  usersByRole: {
    admin: number
    moderator: number
    user: number
  }
  activeUsers: Array<{
    id: string
    username: string
    display_name: string
    avatar: string
    user_stats: {
      models_count: number
      likes_received: number
      followers_count: number
    }
  }>
  popularModels: Array<{
    id: string
    title: string
    likes_count: number
    comments_count: number
    created_at: string
    author: {
      username: string
      display_name: string
    }
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { showError } = useToast()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // 获取认证token - 优先从localStorage的accessToken获取，然后从cookies获取
      let token = localStorage.getItem('accessToken')
      
      if (!token) {
        // 从cookies获取token
        const cookies = document.cookie.split(';')
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='))
        if (authCookie) {
          token = authCookie.split('=')[1]
        }
      }

      if (!token) {
        throw new Error('未找到认证token，请重新登录')
      }

      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('权限不足，需要管理员权限')
        }
        throw new Error('获取统计数据失败')
      }

      const result = await response.json()
      setStats(result.data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取统计数据失败'
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">管理员仪表板</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">无法加载统计数据</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">管理员仪表板</h1>
        <Badge variant="secondary" className="text-sm">
          系统概览
        </Badge>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              本周新增 {stats.overview.newUsersThisWeek} 人
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总模型数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalModels}</div>
            <p className="text-xs text-muted-foreground">
              公开 {stats.overview.publicModels} 个
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">标签数量</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalTags}</div>
            <p className="text-xs text-muted-foreground">
              系统标签总数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本周活跃</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.newModelsThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              新发布模型数
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 用户角色分布 */}
        <Card>
          <CardHeader>
            <CardTitle>用户角色分布</CardTitle>
            <CardDescription>
              按角色统计的用户数量
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">管理员</span>
              <Badge variant="destructive">{stats.usersByRole.admin}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">版主</span>
              <Badge variant="secondary">{stats.usersByRole.moderator}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">普通用户</span>
              <Badge variant="outline">{stats.usersByRole.user}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 活跃用户 */}
        <Card>
          <CardHeader>
            <CardTitle>最活跃用户</CardTitle>
            <CardDescription>
              按模型发布数量排序
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.activeUsers.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.display_name?.charAt(0) || user.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.display_name || user.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.user_stats?.models_count || 0} 个模型
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {user.user_stats?.likes_received || 0} 赞
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 热门模型 */}
      <Card>
        <CardHeader>
          <CardTitle>热门模型</CardTitle>
          <CardDescription>
            按点赞数量排序的公开模型
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.popularModels.slice(0, 5).map((model) => (
              <div key={model.id} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {model.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    作者: {model.author.display_name || model.author.username}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {model.likes_count} 赞
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {model.comments_count} 评论
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}