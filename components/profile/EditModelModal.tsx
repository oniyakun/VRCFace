'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Upload, X, Plus, Tag, Image as ImageIcon, FileText, Code, User, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { compressImage, validateImageFile } from '@/lib/imageUtils'
import { supabase } from '@/lib/supabase'

interface Tag {
  id: string
  name: string
  color?: string
  tag_type?: 'model_name' | 'model_style'
  isNew?: boolean // 标记是否为新创建的标签
}

interface FormData {
  title: string
  description: string
  tags: Tag[]
  jsonData: string
  isPublic: boolean
}

interface EditModelModalProps {
  model: any
  isOpen: boolean
  onClose: () => void
  onSave: (updatedModel: any) => void
}

export default function EditModelModal({ model, isOpen, onClose, onSave }: EditModelModalProps) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    tags: [],
    jsonData: '',
    isPublic: true
  })
  
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([]) // 保留的原有图片
  const [deletedImages, setDeletedImages] = useState<string[]>([]) // 被删除的原有图片
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [newTagType, setNewTagType] = useState<'model_name' | 'model_style'>('model_style')
  const [pendingNewTags, setPendingNewTags] = useState<Tag[]>([]) // 存储待提交的新标签
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 初始化表单数据
  useEffect(() => {
    if (model && isOpen) {
      setFormData({
        title: model.title || '',
        description: model.description || '',
        tags: model.tags ? model.tags.map((tagRelation: any) => ({
          id: tagRelation.tag.id,
          name: tagRelation.tag.name,
          tag_type: (tagRelation.tag as any).tag_type || 'model_style'
        })) : [],
        jsonData: JSON.stringify(model.json_data, null, 2) || '',
        isPublic: model.is_public !== false
      })
      
      // 设置现有图片预览和状态
      if (model.images && model.images.length > 0) {
        setImagePreviews(model.images)
        setExistingImages(model.images) // 保存原有图片列表
      } else {
        setImagePreviews([])
        setExistingImages([])
      }
      
      // 重置其他状态
      setSelectedImages([])
      setDeletedImages([])
      setPendingNewTags([])
      setNewTagName('')
      setError(null)
    }
  }, [model, isOpen])

  // 获取可用标签
  useEffect(() => {
    if (isOpen) {
      fetchTags()
    }
  }, [isOpen])

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      if (response.ok) {
        const result = await response.json()
        setAvailableTags(result.data?.tags || [])
      }
    } catch (error) {
      console.error('获取标签失败:', error)
      setAvailableTags([])
    }
  }

  // 处理表单输入
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 处理图片选择（支持多张）
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // 检查总数量限制
    if (imagePreviews.length + selectedImages.length + files.length > 5) {
      setError('最多只能上传5张图片')
      return
    }

    const validFiles: File[] = []
    const newPreviews: string[] = []

    try {
      // 处理所有文件
      for (const file of files) {
        // 验证图片文件
        const validation = validateImageFile(file)
        if (!validation.valid) {
          setError(validation.error || '图片文件无效')
          continue
        }
        
        // 压缩图片用于预览
        const compressedFile = await compressImage(file, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.8
        })
        
        validFiles.push(compressedFile)
        
        // 创建预览URL
        const previewUrl = URL.createObjectURL(compressedFile)
        newPreviews.push(previewUrl)
      }

      if (validFiles.length > 0) {
        setSelectedImages(prev => [...prev, ...validFiles])
        setImagePreviews(prev => [...prev, ...newPreviews])
        setError(null)
      }
    } catch (error) {
      setError('图片处理失败，请重试')
    }
  }

  // 移除图片
  const removeImage = (index: number) => {
    const currentImageUrl = imagePreviews[index]
    const isExistingImage = existingImages.includes(currentImageUrl)
    
    if (isExistingImage) {
      // 移除现有图片 - 添加到删除列表
      setDeletedImages(prev => [...prev, currentImageUrl])
      setExistingImages(prev => prev.filter(img => img !== currentImageUrl))
      setImagePreviews(prev => prev.filter((_, i) => i !== index))
    } else {
      // 移除新上传的图片
      const existingImagesCount = existingImages.length
      const newImageIndex = index - existingImagesCount
      
      if (newImageIndex >= 0) {
        setSelectedImages(prev => prev.filter((_, i) => i !== newImageIndex))
        setImagePreviews(prev => prev.filter((_, i) => i !== index))
      }
    }
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
  const removeTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t.id !== tagId)
    }))
  }

  // 创建新标签
  const createNewTag = () => {
    if (!newTagName.trim()) return
    
    const newTag: Tag = {
      id: `temp_${Date.now()}`,
      name: newTagName.trim(),
      tag_type: newTagType,
      isNew: true
    }
    
    // 添加到待创建列表
    setPendingNewTags(prev => [...prev, newTag])
    
    // 添加到已选标签
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag]
    }))
    
    setNewTagName('')
  }

  // 表单验证
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('请输入标题')
      return false
    }
    if (!formData.description.trim()) {
      setError('请输入描述')
      return false
    }
    if (!formData.jsonData.trim()) {
      setError('请输入JSON数据')
      return false
    }
    
    // 验证JSON格式
    try {
      JSON.parse(formData.jsonData)
    } catch {
      setError('JSON数据格式不正确')
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
      
      // 准备最终的标签数据（现有标签 + 新创建的标签）
      const existingTags = formData.tags
        .filter(tag => !tag.isNew)
        .map(tag => ({ id: tag.id, name: tag.name, tag_type: tag.tag_type }))
      
      const newTags = pendingNewTags.map(tag => ({ 
        name: tag.name, 
        tag_type: tag.tag_type,
        category: 'style'
      }))
      
      const allTags = [...existingTags, ...newTags]
      
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('jsonData', formData.jsonData)
      submitData.append('isPublic', formData.isPublic.toString())
      submitData.append('tags', JSON.stringify(allTags))
      
      // 发送保留的现有图片信息
      submitData.append('existingImages', JSON.stringify(existingImages))
      
      // 发送被删除的图片信息
      submitData.append('deletedImages', JSON.stringify(deletedImages))
      
      // 添加所有新图片
      selectedImages.forEach((image) => {
        submitData.append('images', image)
      })
      
      const response = await fetch(`/api/models/${model.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: submitData
      })
      
      if (response.ok) {
        const data = await response.json()
        onSave(data.data)
        onClose()
      } else {
        const errorData = await response.json()
        setError(errorData.message || '更新失败，请重试')
      }
    } catch (error) {
      setError('更新失败，请检查网络连接')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">编辑作品</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              描述 *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="描述您的模型特点、风格或使用场景..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={1000}
            />
          </div>
          
          {/* 图片上传 */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="w-4 h-4 mr-2" />
              预览图片 * (最多5张)
            </label>
            
            {/* 图片预览网格 */}
            {imagePreviews.length > 0 && (
              <div className="mb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`预览 ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          封面
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 上传按钮 */}
            {imagePreviews.length < 5 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {imagePreviews.length === 0 ? '点击上传图片' : `继续添加图片 (${5 - imagePreviews.length} 张剩余)`}
                </p>
                <p className="text-xs text-gray-400 mt-1">支持 JPG, PNG 格式，可多选</p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            
            {imagePreviews.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                第一张图片将作为封面显示
              </p>
            )}
          </div>

          {/* 标签 */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 mr-2" />
              标签
            </label>
            
            {/* 已选标签 */}
            {formData.tags.length > 0 && (
              <div className="mb-4">
                {/* 模型名字标签 */}
                {formData.tags.filter(tag => tag.tag_type === 'model_name').length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center text-xs text-blue-600 font-medium mb-2">
                      <User className="w-3 h-3 mr-1" />
                      模型名字
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags
                        .filter(tag => tag.tag_type === 'model_name')
                        .map(tag => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                          >
                            <User className="w-3 h-3 mr-1" />
                            {tag.name}
                            {tag.isNew && <span className="ml-1 text-xs">(新)</span>}
                            <button
                              type="button"
                              onClick={() => removeTag(tag.id)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                )}
                
                {/* 模型风格标签 */}
                {formData.tags.filter(tag => tag.tag_type === 'model_style').length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center text-xs text-purple-600 font-medium mb-2">
                      <Palette className="w-3 h-3 mr-1" />
                      模型风格
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags
                        .filter(tag => tag.tag_type === 'model_style')
                        .map(tag => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200"
                          >
                            <Palette className="w-3 h-3 mr-1" />
                            {tag.name}
                            {tag.isNew && <span className="ml-1 text-xs">(新)</span>}
                            <button
                              type="button"
                              onClick={() => removeTag(tag.id)}
                              className="ml-2 text-purple-600 hover:text-purple-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* 可选标签 */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-3">选择标签:</h4>
              
              {/* 模型名字标签 */}
              {availableTags.filter(tag => tag.tag_type === 'model_name').length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center text-xs text-blue-600 font-medium mb-2">
                    <User className="w-3 h-3 mr-1" />
                    模型名字
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableTags
                      .filter(tag => tag.tag_type === 'model_name' && !formData.tags.find(t => t.id === tag.id))
                      .slice(0, 8)
                      .map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleAddTag(tag)}
                          className="inline-flex items-center px-3 py-1 text-sm border border-blue-300 rounded-full hover:bg-blue-50 transition-colors text-blue-700"
                        >
                          <User className="w-3 h-3 mr-1" />
                          {tag.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}
              
              {/* 模型风格标签 */}
              {availableTags.filter(tag => tag.tag_type === 'model_style').length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center text-xs text-purple-600 font-medium mb-2">
                    <Palette className="w-3 h-3 mr-1" />
                    模型风格
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableTags
                      .filter(tag => tag.tag_type === 'model_style' && !formData.tags.find(t => t.id === tag.id))
                      .slice(0, 12)
                      .map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleAddTag(tag)}
                          className="inline-flex items-center px-3 py-1 text-sm border border-purple-300 rounded-full hover:bg-purple-50 transition-colors text-purple-700"
                        >
                          <Palette className="w-3 h-3 mr-1" />
                          {tag.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* 新建标签 */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-600 mb-3">创建新标签</h4>
              
              {/* 标签类型选择 */}
              <div className="flex mb-3 bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setNewTagType('model_name')}
                  className={cn(
                    'flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    newTagType === 'model_name'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <User className="w-4 h-4 mr-2" />
                  模型名字
                </button>
                <button
                  type="button"
                  onClick={() => setNewTagType('model_style')}
                  className={cn(
                    'flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    newTagType === 'model_style'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  模型风格
                </button>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder={`输入新的${newTagType === 'model_name' ? '模型名字' : '模型风格'}标签`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), createNewTag())}
                />
                <Button
                  type="button"
                  onClick={createNewTag}
                  disabled={!newTagName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* JSON数据 */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Code className="w-4 h-4 mr-2" />
              VRChat捏脸数据 (JSON格式) *
            </label>
            <textarea
              value={formData.jsonData}
              onChange={(e) => handleInputChange('jsonData', e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="粘贴你的VRChat捏脸JSON数据..."
            />
            <p className="text-xs text-gray-500 mt-1">
              请粘贴从VRChat导出的完整JSON数据
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
              onClick={onClose}
              className="mr-3 px-6 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? '更新中...' : '更新作品'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}