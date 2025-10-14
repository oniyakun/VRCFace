import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { compressImage, generateThumbnail, validateImageFile } from '@/lib/imageUtils'
import { uploadImage, deleteImage, generateImagePath, generateThumbnailPath, extractPathFromUrl } from '@/lib/storage'
import { ApiResponse } from '@/types'

// 创建Supabase管理员客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// 创建普通Supabase客户端用于认证
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// 获取单个模型详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const modelId = params.id

    // 获取模型详情
    const { data: model, error } = await supabaseAdmin
      .from('face_models')
      .select(`
        *,
        author:users!face_models_author_id_fkey(id, username, display_name, role, avatar),
        stats:model_stats(views, downloads, likes, comments),
        tags:model_tags(tag:tags(id, name, category, tag_type))
      `)
      .eq('id', modelId)
      .single()

    if (error || !model) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '模型不存在'
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: model
    })

  } catch (error) {
    console.error('获取模型详情失败:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: '服务器错误'
    }, { status: 500 })
  }
}

// 更新模型
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const modelId = params.id

    // 获取认证token
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '未提供认证token'
      }, { status: 401 })
    }

    // 验证用户身份
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('认证失败:', authError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '认证失败'
      }, { status: 401 })
    }

    // 检查模型是否存在且用户是否有权限编辑
    const { data: existingModel, error: modelError } = await supabaseAdmin
      .from('face_models')
      .select('id, author_id, images, thumbnail')
      .eq('id', modelId)
      .single()

    if (modelError || !existingModel) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '模型不存在'
      }, { status: 404 })
    }

    if (existingModel.author_id !== user.id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '无权限编辑此模型'
      }, { status: 403 })
    }

    // 解析FormData
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const jsonData = formData.get('jsonData') as string
    const isPublic = formData.get('isPublic') === 'true'
    const tagsJson = formData.get('tags') as string
    const existingImagesJson = formData.get('existingImages') as string
    const deletedImagesJson = formData.get('deletedImages') as string

    // 验证必填字段
    if (!title || !description) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '标题和描述为必填项'
      }, { status: 400 })
    }

    // 如果提供了JSON数据，验证格式
    if (jsonData && jsonData.trim()) {
      try {
        JSON.parse(jsonData)
      } catch {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          message: 'JSON数据格式不正确'
        }, { status: 400 })
      }
    }

    // 解析标签数据
    let tags: any[] = []
    if (tagsJson) {
      try {
        tags = JSON.parse(tagsJson)
      } catch (error) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          message: '标签数据格式错误'
        }, { status: 400 })
      }
    }

    // 解析图片数据
    let existingImages: string[] = []
    let deletedImages: string[] = []
    
    if (existingImagesJson) {
      try {
        existingImages = JSON.parse(existingImagesJson)
      } catch (error) {
        console.error('解析保留图片数据失败:', error)
      }
    }
    
    if (deletedImagesJson) {
      try {
        deletedImages = JSON.parse(deletedImagesJson)
      } catch (error) {
        console.error('解析删除图片数据失败:', error)
      }
    }

    // 处理图片更新
    const newImages = formData.getAll('images') as File[]
    let finalImageUrls: string[] = [...existingImages] // 从保留的图片开始
    let thumbnailUrl: string | null = existingModel.thumbnail || null

    // 删除被删除的图片（从存储中删除）
    if (deletedImages.length > 0) {
      for (const deletedImageUrl of deletedImages) {
        try {
          // 从URL中提取存储路径
          const imagePath = extractPathFromUrl(deletedImageUrl)
          if (imagePath) {
            const result = await deleteImage(imagePath)
            if (result.success) {
              console.log('已删除图片:', deletedImageUrl)
            } else {
              console.error('删除图片失败:', deletedImageUrl, result.error)
            }
          } else {
            console.error('无法提取图片路径:', deletedImageUrl)
          }
        } catch (error) {
          console.error('删除图片失败:', deletedImageUrl, error)
        }
      }
      
      // 如果删除的图片包含缩略图，清除缩略图
      if (thumbnailUrl && deletedImages.includes(thumbnailUrl)) {
        thumbnailUrl = null
      }
    }

    // 处理新上传的图片
    if (newImages.length > 0) {
      // 验证图片文件
      for (const image of newImages) {
        if (image.size > 0) {
          const validation = validateImageFile(image)
          if (!validation.valid) {
            return NextResponse.json<ApiResponse<null>>({
              success: false,
              message: validation.error || '图片文件无效'
            }, { status: 400 })
          }
        }
      }

      // 上传新图片
      for (let i = 0; i < newImages.length; i++) {
        const image = newImages[i]
        if (image.size > 0) {
          try {
            // 压缩图片
            const compressedImage = await compressImage(image)
            
            // 生成图片路径
            const imagePath = generateImagePath(user.id, `${modelId}_${Date.now()}_${i}`)
            
            // 上传图片
            const uploadResult = await uploadImage(compressedImage, imagePath)
            if (uploadResult.success && uploadResult.url) {
              finalImageUrls.push(uploadResult.url)
            } else {
              throw new Error(uploadResult.error || '图片上传失败')
            }

            // 如果没有缩略图且这是第一张新图片，生成缩略图
            if (!thumbnailUrl && i === 0) {
              const thumbnail = await generateThumbnail(compressedImage, 300)
              const thumbnailPath = generateThumbnailPath(`${user.id}/${modelId}_thumb_${Date.now()}`)
              const thumbnailResult = await uploadImage(thumbnail, thumbnailPath)
              if (thumbnailResult.success && thumbnailResult.url) {
                thumbnailUrl = thumbnailResult.url
              }
            }
          } catch (error) {
            console.error('图片上传失败:', error)
            return NextResponse.json<ApiResponse<null>>({
              success: false,
              message: `第${i + 1}张图片上传失败`
            }, { status: 500 })
          }
        }
      }
    }

    // 如果没有缩略图但有图片，使用第一张图片作为缩略图
    if (!thumbnailUrl && finalImageUrls.length > 0) {
      thumbnailUrl = finalImageUrls[0]
    }

    // 更新模型数据
    const updateData: any = {
      title,
      description,
      category: category || 'other',
      json_data: jsonData && jsonData.trim() ? JSON.parse(jsonData) : null,
      is_public: isPublic,
      updated_at: new Date().toISOString(),
      images: finalImageUrls,
      thumbnail: thumbnailUrl
    }

    const { data: updatedModel, error: updateError } = await supabaseAdmin
      .from('face_models')
      .update(updateData)
      .eq('id', modelId)
      .select()
      .single()

    if (updateError) {
      console.error('更新模型失败:', updateError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '更新模型失败'
      }, { status: 500 })
    }

    // 更新标签关联
    if (tags.length > 0) {
      // 删除现有标签关联
      await supabaseAdmin
        .from('model_tags')
        .delete()
        .eq('model_id', modelId)

      // 处理标签
      const tagIds: string[] = []

      for (const tag of tags) {
        if (tag.id) {
          // 现有标签
          tagIds.push(tag.id)
        } else if (tag.name) {
          // 新标签，需要创建
          const { data: newTag, error: tagError } = await supabaseAdmin
            .from('tags')
            .insert({
              name: tag.name,
              category: tag.category || 'style',
              tag_type: tag.tag_type || 'model_style'
            })
            .select()
            .single()

          if (tagError) {
            console.error('创建标签失败:', tagError)
            continue
          }

          tagIds.push(newTag.id)
        }
      }

      // 创建新的标签关联
      if (tagIds.length > 0) {
        const modelTagsData = tagIds.map(tagId => ({
          model_id: modelId,
          tag_id: tagId
        }))

        const { error: modelTagsError } = await supabaseAdmin
          .from('model_tags')
          .insert(modelTagsData)

        if (modelTagsError) {
          console.error('创建模型标签关联失败:', modelTagsError)
        }
      }
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      message: '模型更新成功',
      data: updatedModel
    })

  } catch (error) {
    console.error('更新模型失败:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: '服务器错误'
    }, { status: 500 })
  }
}

// 删除模型
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const modelId = params.id

    // 获取认证token
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '未提供认证token'
      }, { status: 401 })
    }

    // 验证用户身份
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('PUT认证失败:', authError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '认证失败'
      }, { status: 401 })
    }

    // 检查模型是否存在且用户是否有权限删除
    const { data: existingModel, error: modelError } = await supabaseAdmin
      .from('face_models')
      .select('id, author_id, images, thumbnail')
      .eq('id', modelId)
      .single()

    if (modelError || !existingModel) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '模型不存在'
      }, { status: 404 })
    }

    if (existingModel.author_id !== user.id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '无权限删除此模型'
      }, { status: 403 })
    }

    // 删除相关数据（级联删除）
    // 1. 删除模型标签关联
    await supabaseAdmin
      .from('model_tags')
      .delete()
      .eq('model_id', modelId)

    // 2. 删除模型统计数据
    await supabaseAdmin
      .from('model_stats')
      .delete()
      .eq('model_id', modelId)

    // 3. 删除收藏记录
    await supabaseAdmin
      .from('user_favorites')
      .delete()
      .eq('model_id', modelId)

    // 4. 删除点赞记录
    await supabaseAdmin
      .from('user_likes')
      .delete()
      .eq('model_id', modelId)

    // 5. 删除模型本身
    const { error: deleteError } = await supabaseAdmin
      .from('face_models')
      .delete()
      .eq('id', modelId)

    if (deleteError) {
      console.error('删除模型失败:', deleteError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '删除模型失败'
      }, { status: 500 })
    }

    // 6. 删除存储中的图片文件
    try {
      // 删除主图片
      if (existingModel.images && Array.isArray(existingModel.images)) {
        for (const imageUrl of existingModel.images) {
          const imagePath = extractPathFromUrl(imageUrl)
          if (imagePath) {
            const deleteResult = await deleteImage(imagePath)
            if (!deleteResult.success) {
              console.error('删除图片失败:', deleteResult.error, '路径:', imagePath)
            }
          }
        }
      }

      // 删除缩略图
      if (existingModel.thumbnail) {
        const thumbnailPath = extractPathFromUrl(existingModel.thumbnail)
        if (thumbnailPath) {
          const deleteResult = await deleteImage(thumbnailPath)
          if (!deleteResult.success) {
            console.error('删除缩略图失败:', deleteResult.error, '路径:', thumbnailPath)
          }
        }
      }
    } catch (imageDeleteError) {
      console.error('删除图片文件时出错:', imageDeleteError)
      // 不阻止删除操作，只记录错误
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: '模型删除成功'
    })

  } catch (error) {
    console.error('删除模型失败:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: '服务器错误'
    }, { status: 500 })
  }
}