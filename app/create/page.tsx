'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/components/ui/ToastProvider'
import { Button } from '@/components/ui/button'
import { Upload, X, Plus, Tag, Image as ImageIcon, FileText, Code, User, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { compressImage, validateImageFile } from '@/lib/imageUtils'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/components/i18n/LanguageProvider'

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



export default function CreatePage() {
  const { t } = useLanguage()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { showSuccess, showError } = useToast()
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
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [newTagType, setNewTagType] = useState<'model_name' | 'model_style'>('model_name')
  const [pendingNewTags, setPendingNewTags] = useState<Tag[]>([]) // 存储待提交的新标签
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

  // 处理图片选择（支持多张）
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // 检查总数量限制
    if (selectedImages.length + files.length > 5) {
      showError(t('create.maxImagesError'))
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
          showError(validation.error || t('create.invalidImageFile'))
          continue
        }
        
        // 压缩图片用于预览
        const compressedFile = await compressImage(file, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.8,
          format: 'jpeg'
        })
        
        validFiles.push(compressedFile)
        
        // 创建预览 - 使用 Promise 来确保同步处理
        const preview = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = reject
          reader.readAsDataURL(compressedFile)
        })
        
        newPreviews.push(preview)
      }
      
      // 一次性更新状态
      if (validFiles.length > 0) {
        setSelectedImages(prev => [...prev, ...validFiles])
        setImagePreviews(prev => [...prev, ...newPreviews])
        setError(null)
      }
    } catch (error) {
      showError(t('create.imageProcessFailed'))
    }
  }

  // 移除单张图片
  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  // 移除所有图片
  const handleRemoveAllImages = () => {
    setSelectedImages([])
    setImagePreviews([])
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

  // 创建新标签（本地存储，不立即提交到数据库）
  const handleCreateNewTag = async () => {
    if (!newTagName.trim()) return
    
    // 检查是否已存在相同名称的标签
    const existingTag = [...availableTags, ...pendingNewTags].find(
      tag => tag.name.toLowerCase() === newTagName.trim().toLowerCase()
    )
    
    if (existingTag) {
      showError(t('create.tagAlreadyExists'))
      return
    }
    
    // 创建临时ID和新标签对象
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newTag: Tag = {
      id: tempId,
      name: newTagName.trim(),
      tag_type: newTagType,
      isNew: true
    }
    
    // 添加到待提交列表
    setPendingNewTags(prev => [...prev, newTag])
    
    // 添加到已选标签
    handleAddTag(newTag)
    
    // 清空输入
    setNewTagName('')
    setError(null)
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
      showError(t('create.titleRequired'))
      return false
    }
    
    if (!formData.description.trim()) {
      showError(t('create.descriptionRequired'))
      return false
    }
    
    if (selectedImages.length === 0) {
      showError(t('create.imageRequired'))
      return false
    }
    
    // 如果有捏脸数据，则验证JSON格式
    if (formData.jsonData.trim() && !validateJsonData(formData.jsonData)) {
      showError(t('create.invalidJsonFormat'))
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
        showError(t('auth.errors.loginRequired'))
        return
      }
      
      // 首先创建新标签
      const createdTagIds: string[] = []
      
      for (const newTag of pendingNewTags) {
        try {
          const tagResponse = await fetch('/api/tags', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              name: newTag.name,
              category: 'style',
              tag_type: newTag.tag_type
            })
          })
          
          if (tagResponse.ok) {
            const tagData = await tagResponse.json()
            createdTagIds.push(tagData.data.tag.id)
          } else {
            throw new Error(`创建标签 "${newTag.name}" 失败`)
          }
        } catch (error) {
          showError(`创建标签失败: ${error instanceof Error ? error.message : '未知错误'}`)
          return
        }
      }
      
      // 准备最终的标签ID列表（现有标签 + 新创建的标签）
      const existingTagIds = formData.tags
        .filter(tag => !tag.isNew)
        .map(tag => tag.id)
      
      const allTagIds = [...existingTagIds, ...createdTagIds]
      
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('jsonData', formData.jsonData)
      submitData.append('isPublic', formData.isPublic.toString())
      submitData.append('tags', JSON.stringify(allTagIds))
      
      // 添加所有图片
      selectedImages.forEach((image, index) => {
        submitData.append(`image_${index}`, image)
      })
      submitData.append('imageCount', selectedImages.length.toString())
      
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: submitData
      })
      
      if (response.ok) {
        const data = await response.json()
        showSuccess(t('create.publishSuccess'))
        setTimeout(() => {
          router.push(`/profile/${user?.id}`)
        }, 2000)
      } else {
        const errorData = await response.json()
        showError(errorData.message || t('create.publishFailed'))
      }
    } catch (error) {
      showError(t('create.networkError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('create.publishSuccessTitle')}</h2>
          <p className="text-gray-600">{t('create.redirectingToProfile')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">{t('create.publishNewModel')}</h1>
            <p className="text-gray-600 mt-1">{t('create.shareYourWork')}</p>
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
                {t('create.form.title')} *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={t('create.form.titlePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={200}
              />
            </div>
            
            {/* 描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('create.form.description')} *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t('create.form.descriptionPlaceholder')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={1000}
              />
            </div>
            
            {/* 图片上传 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <ImageIcon className="w-4 h-4 mr-2" />
                {t('create.form.previewImages')} * ({t('create.form.maxImages')})
              </label>
              
              {/* 图片预览网格 */}
              {imagePreviews.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      {t('create.form.selectedImages', { count: selectedImages.length })}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveAllImages}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      {t('create.form.clearAll')}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={t('create.form.previewImageAlt', { index: index + 1 })}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            {t('create.form.cover')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 上传按钮 */}
              {selectedImages.length < 5 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {selectedImages.length === 0 ? t('create.form.clickToUpload') : t('create.form.continueAdding', { remaining: 5 - selectedImages.length })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{t('create.form.supportedFormats')}</p>
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
              
              {selectedImages.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {t('create.form.firstImageCover')}
                </p>
              )}
            </div>

            {/* 标签 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 mr-2" />
                {t('create.form.tags')}
              </label>
              
              {/* 已选标签 */}
              {formData.tags.length > 0 && (
                <div className="mb-4">
                  {/* 模型名字标签 */}
                  {formData.tags.filter(tag => tag.tag_type === 'model_name').length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center text-xs text-blue-600 font-medium mb-2">
                        <User className="w-3 h-3 mr-1" />
                        {t('create.form.modelName')}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags
                          .filter(tag => tag.tag_type === 'model_name')
                          .map(tag => (
                            <span
                              key={tag.id}
                              className={cn(
                                "inline-flex items-center px-3 py-1 rounded-full text-sm",
                                tag.isNew 
                                  ? "bg-blue-200 text-blue-900 border border-blue-300" 
                                  : "bg-blue-100 text-blue-800"
                              )}
                            >
                              <User className="w-3 h-3 mr-1" />
                              {tag.name}
                              {tag.isNew && <span className="ml-1 text-xs">({t('create.form.new')})</span>}
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
                    </div>
                  )}

                  {/* 模型风格标签 */}
                  {formData.tags.filter(tag => tag.tag_type === 'model_style' || !tag.tag_type).length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center text-xs text-purple-600 font-medium mb-2">
                        <Palette className="w-3 h-3 mr-1" />
                        {t('create.form.modelStyle')}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags
                          .filter(tag => tag.tag_type === 'model_style' || !tag.tag_type)
                          .map(tag => (
                            <span
                              key={tag.id}
                              className={cn(
                                "inline-flex items-center px-3 py-1 rounded-full text-sm",
                                tag.isNew 
                                  ? "bg-purple-200 text-purple-900 border border-purple-300" 
                                  : "bg-purple-100 text-purple-800"
                              )}
                            >
                              <Palette className="w-3 h-3 mr-1" />
                              {tag.name}
                              {tag.isNew && <span className="ml-1 text-xs">({t('create.form.new')})</span>}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag.id)}
                                className="ml-2 w-4 h-4 text-purple-600 hover:text-purple-800"
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
              
              {/* 可选标签列表 */}
              {availableTags.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{t('create.form.availableTags')}</h4>
                  <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
                    <div className="flex flex-wrap gap-2">
                      {availableTags
                        .filter(tag => !formData.tags.find(selected => selected.id === tag.id))
                        .map(tag => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleAddTag(tag)}
                            className={cn(
                              "inline-flex items-center px-2 py-1 rounded text-xs hover:opacity-80 transition-opacity",
                              tag.tag_type === 'model_name' 
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                            )}
                          >
                            {tag.tag_type === 'model_name' ? (
                              <User className="w-3 h-3 mr-1" />
                            ) : (
                              <Palette className="w-3 h-3 mr-1" />
                            )}
                            {tag.name}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* 创建新标签 */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-600 mb-3">{t('create.form.createNewTag')}</h4>
                
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
                    {t('create.form.modelName')}
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
                    {t('create.form.modelStyle')}
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder={t('create.form.tagNamePlaceholder')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateNewTag())}
                    maxLength={50}
                  />
                  <Button
                    type="button"
                    onClick={handleCreateNewTag}
                    disabled={!newTagName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* 捏脸数据 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Code className="w-4 h-4 mr-2" />
                {t('create.form.faceData')} ({t('create.form.optional')})
              </label>
              <textarea
                value={formData.jsonData}
                onChange={(e) => handleInputChange('jsonData', e.target.value)}
                placeholder={t('create.form.faceDataPlaceholder')}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">{t('create.form.faceDataHint')}</p>
            </div>

            {/* 可见性设置 */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                {t('create.form.visibility')}
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="visibility"
                    checked={formData.isPublic}
                    onChange={() => handleInputChange('isPublic', true)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{t('create.form.public')}</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="visibility"
                    checked={!formData.isPublic}
                    onChange={() => handleInputChange('isPublic', false)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{t('create.form.private')}</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.isPublic ? t('create.form.publicHint') : t('create.form.privateHint')}
              </p>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t('create.form.publishing')}
                  </>
                ) : (
                  t('create.form.publish')
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}