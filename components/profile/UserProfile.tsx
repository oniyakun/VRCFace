'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types'
import { Button } from '@/components/ui/Button'
import { Star, Heart, MessageCircle, Eye, Download, Edit, Trash2, MoreVertical } from 'lucide-react'
import ModelDetailOverlay from '@/components/feed/ModelDetailOverlay'
import EditModelModal from './EditModelModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import { supabase } from '@/lib/supabase'

interface UserProfileProps {
  userId: string
  isOwnProfile?: boolean
}

interface UserProfileData extends User {
  models: any[]
  favorites?: any[]
  isFollowing?: boolean
}

export default function UserProfile({ userId, isOwnProfile = false }: UserProfileProps) {
  const [user, setUser] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'models' | 'favorites' | 'followers' | 'following'>('models')
  const [favoritesPage, setFavoritesPage] = useState(1)
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const [editingModel, setEditingModel] = useState<any | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [userId])

  // 处理编辑模型
  const handleEditModel = (updatedModel: any) => {
    if (user) {
      const updatedModels = user.models.map(model => 
        model.id === updatedModel.id ? { ...model, ...updatedModel } : model
      )
      setUser({ ...user, models: updatedModels })
    }
    setEditingModel(null)
  }

  // 处理删除模型
  const handleDeleteModel = async () => {
    if (!showDeleteConfirm) return

    setIsDeleting(true)
    try {
      // 使用Supabase的session获取token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('请先登录')
      }

      const response = await fetch(`/api/models/${showDeleteConfirm}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || '删除失败')
      }

      // 从列表中移除已删除的模型
      if (user) {
        const updatedModels = user.models.filter(model => model.id !== showDeleteConfirm)
        setUser({ ...user, models: updatedModels })
      }

      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('删除模型失败:', error)
      alert(error instanceof Error ? error.message : '删除失败')
    } finally {
      setIsDeleting(false)
    }
  }

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = () => {
      setActionMenuOpen(null)
    }

    if (actionMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [actionMenuOpen])

  useEffect(() => {
    if (activeTab === 'favorites' && user && (!user.favorites || favoritesPage > 1)) {
      fetchUserFavorites()
    }
  }, [activeTab, user, favoritesPage])

  const fetchUserFavorites = async () => {
    try {
      setFavoritesLoading(true)
      
      const response = await fetch(`/api/user/${userId}/favorites?page=${favoritesPage}&limit=12`)
      const result = await response.json()

      if (response.ok && result.success) {
        if (favoritesPage === 1) {
          // 第一页，替换数据
          setUser(prev => prev ? {
            ...prev,
            favorites: result.data || []
          } : null)
        } else {
          // 后续页面，追加数据
          setUser(prev => prev ? {
            ...prev,
            favorites: [...(prev.favorites || []), ...(result.data || [])]
          } : null)
        }
      } else {
        console.error('获取收藏列表失败:', result.error)
        setError(result.error || '获取收藏列表失败')
      }
    } catch (error) {
      console.error('Fetch favorites error:', error)
      setError('网络错误，请稍后重试')
    } finally {
      setFavoritesLoading(false)
    }
  }

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
              { key: 'models', label: '作品' },
              { key: 'favorites', label: '收藏' },
              { key: 'followers', label: '粉丝' },
              { key: 'following', label: '关注' }
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
                {tab.label}
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
                    <div 
                      key={model.id} 
                      className="bg-gray-50 rounded-lg p-4 hover:shadow-lg transition-shadow relative group"
                    >
                      {/* 操作按钮 - 仅在自己的主页显示 */}
                      {isOwnProfile && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setActionMenuOpen(actionMenuOpen === model.id ? null : model.id)
                              }}
                              className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                            
                            {actionMenuOpen === model.id && (
                              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border py-1 z-10 min-w-[120px]">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingModel(model)
                                    setActionMenuOpen(null)
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  编辑
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setShowDeleteConfirm(model.id)
                                    setActionMenuOpen(null)
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  删除
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div 
                        className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center cursor-pointer"
                        onClick={() => setSelectedModelId(model.id)}
                      >
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
                      <div onClick={() => setSelectedModelId(model.id)} className="cursor-pointer">
                        <h3 className="font-medium text-gray-900 mb-1">{model.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{model.stats?.views || 0} 浏览</span>
                          <span>{model.stats?.likes || 0} 点赞</span>
                        </div>
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
            <div>
              {/* 收藏标题 */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900">收藏的作品</h3>
              </div>

              {favoritesLoading && favoritesPage === 1 ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">正在加载收藏...</p>
                </div>
              ) : user.favorites && user.favorites.length > 0 ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {user.favorites.map((model: any) => (
                      <div 
                        key={model.id} 
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedModelId(model.id)}
                      >
                        <div className="aspect-video bg-gray-200 relative">
                          {model.thumbnail ? (
                            <img 
                              src={model.thumbnail} 
                              alt={model.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              暂无预览
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{model.title}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{model.description}</p>
                          
                          {/* 作者信息 */}
                          <div className="flex items-center mb-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold mr-2">
                              {model.author?.avatar ? (
                                <img 
                                  src={model.author.avatar} 
                                  alt={model.author.displayName || model.author.username}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                (model.author?.displayName || model.author?.username || 'U').charAt(0).toUpperCase()
                              )}
                            </div>
                            <span className="text-sm text-gray-600">
                              {model.author?.displayName || model.author?.username || '未知用户'}
                            </span>
                          </div>

                          {/* 标签 */}
                          {model.tags && model.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {model.tags.slice(0, 3).map((tag: any) => (
                                <span 
                                  key={tag.id} 
                                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                >
                                  {tag.name}
                                </span>
                              ))}
                              {model.tags.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{model.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* 统计信息 */}
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {model.stats?.views || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {model.stats?.likes || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                {model.stats?.comments || 0}
                              </span>
                            </div>
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          </div>

                          {/* 收藏时间 */}
                          <div className="mt-2 text-xs text-gray-400">
                            收藏于 {new Date(model.favorited_at).toLocaleDateString('zh-CN')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 加载更多按钮 */}
                  {favoritesLoading && favoritesPage > 1 && (
                    <div className="text-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">暂无收藏</div>
                  <p className="text-gray-500">
                    {isOwnProfile ? '还没有收藏任何作品' : '该用户还没有收藏任何作品'}
                  </p>
                </div>
              )}
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

      {/* 模型详情弹窗 */}
      {selectedModelId && (
        <ModelDetailOverlay
          id={selectedModelId}
          onClose={() => setSelectedModelId(null)}
        />
      )}

      {/* 编辑模型弹窗 */}
      {editingModel && (
        <EditModelModal
          model={editingModel}
          isOpen={!!editingModel}
          onClose={() => setEditingModel(null)}
          onSave={handleEditModel}
        />
      )}

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          isOpen={!!showDeleteConfirm}
          modelTitle={user?.models.find(m => m.id === showDeleteConfirm)?.title || ''}
          onClose={() => setShowDeleteConfirm(null)}
          onConfirm={handleDeleteModel}
          isDeleting={isDeleting}
        />
      )}
    </div>
  )
}