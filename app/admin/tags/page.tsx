'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Search, Plus, Edit, Trash2, Tag } from 'lucide-react'

interface TagData {
  id: string
  name: string
  description: string | null
  color: string
  created_at: string
  usage_count: { count: number }[] | number
}

interface TagListResponse {
  data: TagData[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function TagsManagement() {
  const [tags, setTags] = useState<TagData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedTag, setSelectedTag] = useState<TagData | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { showError, showSuccess } = useToast()

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  })

  useEffect(() => {
    fetchTags()
  }, [currentPage, searchTerm])

  const fetchTags = async () => {
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
        limit: '50',
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/tags?${params}`, {
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
        throw new Error('获取标签列表失败')
      }

      const result: TagListResponse = await response.json()
      setTags(result.data)
      setTotalPages(result.pagination.totalPages)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取标签列表失败'
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTag = async () => {
    try {
      if (!formData.name.trim()) {
        showError('标签名称不能为空')
        return
      }

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

      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('权限不足，需要管理员权限')
        }
        if (response.status === 401) {
          throw new Error('认证失败，请重新登录')
        }
        const error = await response.json()
        throw new Error(error.error || '创建标签失败')
      }

      showSuccess('标签创建成功')
      fetchTags()
      setCreateDialogOpen(false)
      setFormData({ name: '', description: '', color: '#3B82F6' })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '创建标签失败'
      showError(errorMessage)
    }
  }

  const handleUpdateTag = async () => {
    try {
      if (!selectedTag || !formData.name.trim()) {
        showError('标签名称不能为空')
        return
      }

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

      const response = await fetch('/api/admin/tags', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          tagId: selectedTag.id, 
          updates: formData 
        })
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('权限不足，需要管理员权限')
        }
        if (response.status === 401) {
          throw new Error('认证失败，请重新登录')
        }
        const error = await response.json()
        throw new Error(error.error || '更新标签失败')
      }

      showSuccess('标签更新成功')
      fetchTags()
      setEditDialogOpen(false)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '更新标签失败'
      showError(errorMessage)
    }
  }

  const handleDeleteTag = async (tagId: string) => {
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

      const response = await fetch('/api/admin/tags', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tagId })
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('权限不足，需要管理员权限')
        }
        if (response.status === 401) {
          throw new Error('认证失败，请重新登录')
        }
        const error = await response.json()
        throw new Error(error.error || '删除标签失败')
      }

      showSuccess('标签删除成功')
      fetchTags()
      setDeleteDialogOpen(false)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '删除标签失败'
      showError(errorMessage)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const openEditDialog = (tag: TagData) => {
    setSelectedTag(tag)
    setFormData({
      name: tag.name,
      description: tag.description || '',
      color: tag.color
    })
    setEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', color: '#3B82F6' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">标签管理</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-sm">
            总计 {tags.length} 个标签
          </Badge>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                创建标签
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* 搜索 */}
      <Card>
        <CardHeader>
          <CardTitle>搜索标签</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索标签名称或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* 标签列表 */}
      <Card>
        <CardHeader>
          <CardTitle>标签列表</CardTitle>
          <CardDescription>
            管理系统中的所有标签
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tags.map((tag) => (
                <div key={tag.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: tag.color }}
                      ></div>
                      <h3 className="font-medium text-gray-900">{tag.name}</h3>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {Array.isArray(tag.usage_count) ? tag.usage_count.length : (tag.usage_count || 0)} 次使用
                    </Badge>
                  </div>
                  
                  {tag.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {tag.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>创建于 {formatDate(tag.created_at)}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(tag)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      编辑
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedTag(tag)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      删除
                    </Button>
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

      {/* 创建标签对话框 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>创建新标签</DialogTitle>
            <DialogDescription>
              添加一个新的标签到系统中
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                名称 *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder="输入标签名称"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                描述
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
                placeholder="输入标签描述（可选）"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                颜色
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <input
                  type="color"
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-8 border rounded cursor-pointer"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1"
                  placeholder="#3B82F6"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateTag}>
              创建标签
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑标签对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑标签</DialogTitle>
            <DialogDescription>
              修改标签的信息
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                名称 *
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder="输入标签名称"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                描述
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-3"
                placeholder="输入标签描述（可选）"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-color" className="text-right">
                颜色
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <input
                  type="color"
                  id="edit-color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-8 border rounded cursor-pointer"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1"
                  placeholder="#3B82F6"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateTag}>
              保存更改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除标签确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除标签</DialogTitle>
            <DialogDescription>
              您确定要删除标签 "{selectedTag?.name}" 吗？
              此操作不可撤销。如果标签正在被使用，删除操作将失败。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedTag) {
                  handleDeleteTag(selectedTag.id)
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