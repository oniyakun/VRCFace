'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Search, Eye, Trash2, Heart, MessageCircle, Calendar, User } from 'lucide-react'

interface Model {
  id: string
  title: string
  description: string
  is_public: boolean
  created_at: string
  updated_at: string
  likes_count: number
  comments_count: number
  images: string[]
  author: {
    id: string
    username: string
    display_name: string
    avatar: string
  }
  stats?: {
    likes: number
    comments: number
    views: number
    downloads: number
  }
}

interface ModelListResponse {
  data: Model[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function ModelsManagement() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [authorFilter, setAuthorFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const { showError, showSuccess } = useToast()

  useEffect(() => {
    fetchModels()
  }, [currentPage, searchTerm, authorFilter])

  const fetchModels = async () => {
    try {
      setLoading(true)
      
      // 获取认证token
      let token = localStorage.getItem('accessToken')
      
      if (!token) {
        const cookies = document.cookie.split(';')
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='))
        if (authCookie) {
          token = authCookie.split('=')[1]
        }
      }

      if (!token) {
        throw new Error('未找到认证token，请重新登录')
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(authorFilter && { authorId: authorFilter })
      })

      const response = await fetch(`/api/admin/models?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('权限不足，需要管理员权限')
        }
        if (response.status === 401) {
          throw new Error('认证失败，请重新登录')
        }
        throw new Error('获取模型列表失败')
      }

      const result: ModelListResponse = await response.json()
      setModels(result.data)
      setTotalPages(result.pagination.totalPages)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取模型列表失败'
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteModel = async (modelId: string) => {
    try {
      // 获取认证token
      let token = localStorage.getItem('accessToken')
      
      if (!token) {
        const cookies = document.cookie.split(';')
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='))
        if (authCookie) {
          token = authCookie.split('=')[1]
        }
      }

      if (!token) {
        throw new Error('未找到认证token，请重新登录')
      }

      const response = await fetch('/api/admin/models', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ modelId })
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('权限不足，需要管理员权限')
        }
        if (response.status === 401) {
          throw new Error('认证失败，请重新登录')
        }
        throw new Error('删除模型失败')
      }

      showSuccess('模型删除成功')
      fetchModels()
      setDeleteDialogOpen(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除模型失败'
      showError(errorMessage)
    }
  }

  const handleToggleVisibility = async (modelId: string, isPublic: boolean) => {
    try {
      // 获取认证token
      let token = localStorage.getItem('accessToken')
      
      if (!token) {
        const cookies = document.cookie.split(';')
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='))
        if (authCookie) {
          token = authCookie.split('=')[1]
        }
      }

      if (!token) {
        throw new Error('未找到认证token，请重新登录')
      }

      const response = await fetch('/api/admin/models', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          modelId, 
          updates: { is_public: !isPublic } 
        })
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('权限不足，需要管理员权限')
        }
        if (response.status === 401) {
          throw new Error('认证失败，请重新登录')
        }
        throw new Error('更新模型状态失败')
      }

      showSuccess(`模型已${!isPublic ? '公开' : '设为私有'}`)
      fetchModels()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新模型状态失败'
      showError(errorMessage)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPreviewImage = (model: Model) => {
    return model.images?.[0] || '/placeholder-image.jpg'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">内容管理</h1>
        <Badge variant="secondary" className="text-sm">
          总计 {models.length} 个模型
        </Badge>
      </div>

      {/* 搜索和过滤 */}
      <Card>
        <CardHeader>
          <CardTitle>搜索和过滤</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索模型标题或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Input
              placeholder="按作者ID筛选..."
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className="w-full sm:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* 模型列表 */}
      <Card>
        <CardHeader>
          <CardTitle>模型列表</CardTitle>
          <CardDescription>
            管理系统中的所有用户发布的模型
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.map((model) => (
                <div key={model.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {/* 模型预览图 */}
                  <div className="relative h-48 bg-gray-100">
                    {getPreviewImage(model) ? (
                      <Image
                        src={getPreviewImage(model)!}
                        alt={model.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <span>无预览图</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={model.is_public ? "default" : "secondary"}>
                        {model.is_public ? '公开' : '私有'}
                      </Badge>
                    </div>
                  </div>

                  {/* 模型信息 */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                      {model.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {model.description}
                    </p>

                    {/* 作者信息 */}
                    <div className="flex items-center space-x-2 mb-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={model.author.avatar} />
                        <AvatarFallback className="text-xs">
                          {model.author.display_name?.charAt(0) || model.author.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">
                        {model.author.display_name || model.author.username}
                      </span>
                    </div>

                    {/* 统计信息 */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{model.likes_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{model.comments_count}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(model.created_at)}</span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedModel(model)
                          setViewDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        查看
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleVisibility(model.id, model.is_public)}
                      >
                        {model.is_public ? '设为私有' : '设为公开'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedModel(model)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        删除
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              <span className="text-sm text-gray-500">
                第 {currentPage} 页，共 {totalPages} 页
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 查看模型详情对话框 */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>模型详情</DialogTitle>
          </DialogHeader>
          {selectedModel && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">标题</Label>
                  <p className="text-sm text-gray-600">{selectedModel.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">状态</Label>
                  <p className="text-sm text-gray-600">
                    {selectedModel.is_public ? '公开' : '私有'}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">描述</Label>
                <p className="text-sm text-gray-600">{selectedModel.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">创建时间</Label>
                  <p className="text-sm text-gray-600">{formatDate(selectedModel.created_at)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">更新时间</Label>
                  <p className="text-sm text-gray-600">{formatDate(selectedModel.updated_at)}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">点赞数</Label>
                  <p className="text-sm text-gray-600">{selectedModel.stats?.likes || 0}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">评论数</Label>
                  <p className="text-sm text-gray-600">{selectedModel.stats?.comments || 0}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">图片数</Label>
                  <p className="text-sm text-gray-600">{selectedModel.images?.length || 0}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">作者信息</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedModel.author.avatar} />
                    <AvatarFallback>
                      {selectedModel.author.display_name?.charAt(0) || selectedModel.author.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {selectedModel.author.display_name || selectedModel.author.username}
                    </p>
                    <p className="text-xs text-gray-500">ID: {selectedModel.author.id}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 删除模型确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除模型</DialogTitle>
            <DialogDescription>
              您确定要删除模型 "{selectedModel?.title}" 吗？
              此操作不可撤销，将删除该模型的所有数据和图片。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedModel) {
                  handleDeleteModel(selectedModel.id)
                }
              }}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}