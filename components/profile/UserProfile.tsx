'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types'
import { Button } from '@/components/ui/Button'

interface UserProfileProps {
  userId: string
  isOwnProfile?: boolean
}

interface UserProfileData extends User {
  models: any[]
  isFollowing?: boolean
}

export default function UserProfile({ userId, isOwnProfile = false }: UserProfileProps) {
  const [user, setUser] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'models' | 'favorites' | 'followers' | 'following'>('models')

  useEffect(() => {
    fetchUserProfile()
  }, [userId])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      
      // 调试信息
      console.log('UserProfile - Fetching user profile for userId:', userId)
      
      // 获取用户基本信息
      const response = await fetch(`/api/users/${userId}`)
      const result = await response.json()

      console.log('UserProfile - API response:', result)

      if (result.success) {
        setUser(result.data.user)
        console.log('UserProfile - User data set:', result.data.user)
      } else {
        console.error('UserProfile - API error:', result.error)
        setError(result.error || '获取用户信息失败')
      }
    } catch (error) {
      console.error('Fetch user profile error:', error)
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setError('请先登录')
        return
      }

      const response = await fetch(`/api/users/${userId}/follow`, {
        method: user.isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.success) {
        setUser(prev => prev ? {
          ...prev,
          isFollowing: !prev.isFollowing,
          stats: {
            ...prev.stats,
            followersCount: prev.isFollowing 
              ? prev.stats.followersCount - 1 
              : prev.stats.followersCount + 1
          }
        } : null)
      } else {
        setError(result.error || '操作失败')
      }
    } catch (error) {
      console.error('Follow error:', error)
      setError('网络错误，请稍后重试')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg mb-4">{error || '用户不存在'}</div>
        <Button onClick={() => window.history.back()}>返回</Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 用户信息头部 */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* 头像 */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
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
          </div>

          {/* 用户信息 */}
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user.displayName || user.username}
                  {user.isVerified && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      已验证
                    </span>
                  )}
                </h1>
                <p className="text-gray-600 mb-2">@{user.username}</p>
                {user.bio && (
                  <p className="text-gray-700 mb-4">{user.bio}</p>
                )}
                <p className="text-sm text-gray-500">
                  加入时间：{formatDate(user.createdAt.toString())}
                </p>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3 mt-4 md:mt-0">
                {isOwnProfile ? (
                  <Button variant="outline">
                    编辑资料
                  </Button>
                ) : (
                  <Button 
                    onClick={handleFollow}
                    variant={user.isFollowing ? "outline" : "default"}
                  >
                    {user.isFollowing ? '取消关注' : '关注'}
                  </Button>
                )}
              </div>
            </div>

            {/* 统计数据 */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900">{user.stats.modelsCount}</div>
                <div className="text-gray-600">作品</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900">{user.stats.followersCount}</div>
                <div className="text-gray-600">粉丝</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900">{user.stats.followingCount}</div>
                <div className="text-gray-600">关注</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-gray-900">{user.stats.likesReceived}</div>
                <div className="text-gray-600">获赞</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="bg-white rounded-lg shadow-lg mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-8">
            {[
              { key: 'models', label: '作品', count: user.stats.modelsCount },
              { key: 'favorites', label: '收藏', count: 0 },
              { key: 'followers', label: '粉丝', count: user.stats.followersCount },
              { key: 'following', label: '关注', count: user.stats.followingCount }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* 标签页内容 */}
        <div className="p-8">
          {activeTab === 'models' && (
            <div>
              {user.models && user.models.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {user.models.map((model) => (
                    <div key={model.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                        {model.thumbnail ? (
                          <img 
                            src={model.thumbnail} 
                            alt={model.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-gray-400">暂无预览</div>
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">{model.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{model.stats?.views || 0} 浏览</span>
                        <span>{model.stats?.likes || 0} 点赞</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">暂无作品</div>
                  <p className="text-gray-500">
                    {isOwnProfile ? '开始创建您的第一个作品吧！' : '该用户还没有发布作品'}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">暂无收藏</div>
              <p className="text-gray-500">还没有收藏任何作品</p>
            </div>
          )}

          {activeTab === 'followers' && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">粉丝列表</div>
              <p className="text-gray-500">功能开发中...</p>
            </div>
          )}

          {activeTab === 'following' && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">关注列表</div>
              <p className="text-gray-500">功能开发中...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}