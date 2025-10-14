'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Upload, X, Plus, Tag, Image as ImageIcon, FileText, Code } from 'lucide-react'
import { cn } from '@/lib/utils'
import { compressImage, validateImageFile } from '@/lib/imageUtils'
import { supabase } from '@/lib/supabase'

interface Tag {
  id: string
  name: string
  color?: string
}

interface FormData {
  title: string
  description: string
  category: string
  tags: Tag[]
  jsonData: string
  isPublic: boolean
}

const CATEGORIES = [
  { value: 'cute', label: '可爱' },
  { value: 'cool', label: '酷炫' },
  { value: 'funny', label: '搞笑' },
  { value: 'gentle', label: '温柔' },
  { value: 'sci-fi', label: '科幻' },
  { value: 'animal', label: '动物' },
  { value: 'other', label: '其他' }
]

export default function CreatePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: 'other',
    tags: [],
    jsonData: '',
    isPublic: true
  })
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // 检查用户认证状态
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [isAuthenticated, isLoading, router])

      // 获取可用标签
      useEffect(() => {
        const fetchTags = async () => {
          try {
            const response = await fetch('/api/tags')
            if (response.ok) {
              const data = await response.json()
              setAvailableTags(data.data.tags || [])
            }
          } catch (error) {
            console.error('获取标签失败:', error)
          }
        }
        fetchTags()
      }, [])

  // 处理图片选择
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 验证图片文件
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setError(validation.error || '图片文件无效')
        return
      }
      
      try {
        // 压缩图片用于预览
        const compressedFile = await compressImage(file, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.8,
          format: 'jpeg'
        })
        
        setSelectedImage(compressedFile)
        
        // 创建预览
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string)
        }
        reader.readAsDataURL(compressedFile)
        setError(null)
      } catch (error) {
        setError('图片处理失败，请重试')
      }
    }
  }

  // 移除图片
  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 处理表单输入
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 添加标签
  const handleAddTag = (tag: Tag) => {
    if (!formData.tags.find(t => t.id === tag.id)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  // 移除标签
  const handleRemoveTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t.id !== tagId)
    }))
  }

  // 创建新标签
  const handleCreateNewTag = async () => {
    if (!newTagName.trim()) return
    
    try {
      // 获取认证token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setError('请先登录')
        return
      }
      
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          category: 'style'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        const newTag = data.data.tag
        setAvailableTags(prev => [...prev, newTag])
        handleAddTag(newTag)
        setNewTagName('')
      } else {
        const errorData = await response.json()
        setError(errorData.message || '创建标签失败')
      }
    } catch (error) {
      setError('创建标签失败')
    }
  }

  // 验证JSON数据
  const validateJsonData = (jsonString: string): boolean => {
    if (!jsonString.trim()) return false
    try {
      JSON.parse(jsonString)
      return true
    } catch {
      return false
    }
  }

  // 表单验证
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('请输入标题')
      return false
    }
    
    if (!formData.description.trim()) {
      setError('请输入描述')
      return false
    }
    
    if (!selectedImage) {
      setError('请选择预览图片')
      return false
    }
    
    if (!formData.jsonData.trim()) {
      setError('请输入捏脸数据')
      return false
    }
    
    if (!validateJsonData(formData.jsonData)) {
      setError('捏脸数据格式不正确，请输入有效的JSON格式')
      return false
    }
    
    return true
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // 获取认证token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setError('请先登录')
        return
      }
      
      // 创建FormData用于文件上传
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('category', formData.category)
      submitData.append('jsonData', formData.jsonData)
      submitData.append('isPublic', formData.isPublic.toString())
      submitData.append('tags', JSON.stringify(formData.tags.map(t => t.id)))
      
      if (selectedImage) {
        submitData.append('image', selectedImage)
      }
      
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: submitData
      })
      
      if (response.ok) {
        const data = await response.json()
        setSuccess(true)
        setTimeout(() => {
          router.push(`/profile/${user?.id}`)
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || '发布失败，请重试')
      }
    } catch (error) {
      setError('发布失败，请检查网络连接')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">发布成功！</h2>
          <p className="text-gray-600">正在跳转到您的个人主页...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">发布新模型</h1>
            <p className="text-gray-600 mt-1">分享您的VRChat捏脸作品</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}
            
            {/* 标题 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 mr-2" />
                标题 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="为您的模型起个好听的名字"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={200}
              />
            </div>
            
            {/* 描述 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 mr-2" />
                描述 *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="详细描述您的模型特点、风格等..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            
            {/* 分类 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 mr-2" />
                分类
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* 预览图片 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <ImageIcon className="w-4 h-4 mr-2" />
                预览图片 *
              </label>
              
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="预览"
                    className="w-48 h-48 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">点击上传图片</p>
                  <p className="text-xs text-gray-400 mt-1">支持 JPG, PNG 格式</p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
            
            {/* 标签 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 mr-2" />
                标签
              </label>
              
              {/* 已选标签 */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map(tag => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag.id)}
                        className="ml-2 w-4 h-4 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* 可选标签 */}
              <div className="flex flex-wrap gap-2 mb-3">
                {availableTags
                  .filter(tag => !formData.tags.find(t => t.id === tag.id))
                  .slice(0, 10)
                  .map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      {tag.name}
                    </button>
                  ))}
              </div>
              
              {/* 新建标签 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="创建新标签"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={20}
                />
                <Button
                  type="button"
                  onClick={handleCreateNewTag}
                  disabled={!newTagName.trim()}
                  className="px-4 py-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* 捏脸数据 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Code className="w-4 h-4 mr-2" />
                捏脸数据 (JSON格式) *
              </label>
              <textarea
                value={formData.jsonData}
                onChange={(e) => handleInputChange('jsonData', e.target.value)}
                placeholder="请粘贴VRChat的捏脸JSON数据..."
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                请确保JSON格式正确，这将用于其他用户复制您的捏脸数据
              </p>
            </div>
            
            {/* 公开设置 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                公开发布（其他用户可以查看和下载）
              </label>
            </div>
            
            {/* 提交按钮 */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={() => router.back()}
                className="mr-3 px-6 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? '发布中...' : '发布模型'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}