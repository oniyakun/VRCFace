import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { compressImage, generateThumbnail, validateImageFile } from '@/lib/imageUtils'
import { uploadImage, generateImagePath, generateThumbnailPath } from '@/lib/storage'
import { ApiResponse } from '@/types'

// 创建Supabase管理员客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 创建普通Supabase客户端用于认证
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '认证失败'
      }, { status: 401 })
    }

    // 解析FormData
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const jsonData = formData.get('jsonData') as string
    const isPublic = formData.get('isPublic') === 'true'
    const tagsJson = formData.get('tags') as string
    const imageCount = parseInt(formData.get('imageCount') as string || '0')

    // 验证必填字段
    if (!title || !description || !jsonData || imageCount === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '请填写所有必填字段'
      }, { status: 400 })
    }

    // 验证图片数量
    if (imageCount > 5) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '最多只能上传5张图片'
      }, { status: 400 })
    }

    // 验证JSON数据格式
    try {
      JSON.parse(jsonData)
    } catch {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: 'JSON数据格式不正确'
      }, { status: 400 })
    }

    // 解析标签
    let tagIds: string[] = []
    try {
      tagIds = JSON.parse(tagsJson || '[]')
    } catch {
      // 忽略标签解析错误
    }

    // 获取所有图片文件
    const imageFiles: File[] = []
    for (let i = 0; i < imageCount; i++) {
      const imageFile = formData.get(`image_${i}`) as File
      if (imageFile) {
        // 验证图片文件
        const imageValidation = validateImageFile(imageFile)
        if (!imageValidation.valid) {
          return NextResponse.json<ApiResponse<null>>({
            success: false,
            message: `图片 ${i + 1} 无效: ${imageValidation.error}`
          }, { status: 400 })
        }
        imageFiles.push(imageFile)
      }
    }

    if (imageFiles.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '请至少上传一张图片'
      }, { status: 400 })
    }

    // 处理所有图片
    const processedImages: { url: string; thumbnailUrl: string }[] = []
    
    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i]
      
      try {
        // 压缩图片
        const compressedImage = await compressImage(imageFile, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.8,
          format: 'jpeg'
        })

        // 生成缩略图
        const thumbnail = await generateThumbnail(compressedImage, 400)

        // 生成存储路径
        const imagePath = generateImagePath(user.id, `${Date.now()}_${i}_${compressedImage.name}`)
        const thumbnailPath = generateThumbnailPath(imagePath)

        // 上传图片到Supabase Storage
        const [imageUpload, thumbnailUpload] = await Promise.all([
          uploadImage(compressedImage, imagePath),
          uploadImage(thumbnail, thumbnailPath)
        ])

        if (!imageUpload.success) {
          return NextResponse.json<ApiResponse<null>>({
            success: false,
            message: `图片 ${i + 1} 上传失败: ${imageUpload.error}`
          }, { status: 500 })
        }

        if (!thumbnailUpload.success) {
          return NextResponse.json<ApiResponse<null>>({
            success: false,
            message: `图片 ${i + 1} 缩略图上传失败: ${thumbnailUpload.error}`
          }, { status: 500 })
        }

        processedImages.push({
          url: imageUpload.url!,
          thumbnailUrl: thumbnailUpload.url!
        })
      } catch (error) {
        console.error(`处理图片 ${i + 1} 失败:`, error)
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          message: `图片 ${i + 1} 处理失败`
        }, { status: 500 })
      }
    }

    // 准备图片URL数组
    const imageUrls = processedImages.map(img => img.url)
    const thumbnailUrls = processedImages.map(img => img.thumbnailUrl)

    // 开始数据库事务
    const { data: model, error: modelError } = await supabaseAdmin
      .from('face_models')
      .insert({
        title: title.trim(),
        description: description.trim(),
        author_id: user.id,
        thumbnail: thumbnailUrls[0], // 第一张图片的缩略图作为主缩略图
        images: imageUrls, // 存储所有图片URL
        json_data: JSON.parse(jsonData),
        category,
        is_public: isPublic
      })
      .select()
      .single()

    if (modelError) {
      console.error('Model creation error:', modelError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '模型创建失败'
      }, { status: 500 })
    }

    // 创建模型统计记录
    const { error: statsError } = await supabaseAdmin
      .from('model_stats')
      .insert({
        model_id: model.id,
        views: 0,
        downloads: 0,
        likes: 0,
        comments: 0
      })

    if (statsError) {
      console.error('Model stats creation error:', statsError)
      // 不阻止模型创建，只记录错误
    }

    // 创建模型元数据记录
    const totalFileSize = imageFiles.reduce((total, file) => total + file.size, 0)
    const { error: metadataError } = await supabaseAdmin
      .from('model_metadata')
      .insert({
        model_id: model.id,
        version: '1.0.0',
        file_size: totalFileSize
      })

    if (metadataError) {
      console.error('Model metadata creation error:', metadataError)
      // 不阻止模型创建，只记录错误
    }

    // 添加标签关联
    if (tagIds.length > 0) {
      const tagRelations = tagIds.map(tagId => ({
        model_id: model.id,
        tag_id: tagId
      }))

      const { error: tagError } = await supabaseAdmin
        .from('model_tags')
        .insert(tagRelations)

      if (tagError) {
        console.error('Tag relations creation error:', tagError)
        // 不阻止模型创建，只记录错误
      }
    }

    // 更新用户模型数量统计
    const { error: userStatsError } = await supabaseAdmin.rpc('increment_models_count', {
      user_id: user.id
    })

    if (userStatsError) {
      console.error('User stats update error:', userStatsError)
      // 不阻止模型创建，只记录错误
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      message: '模型发布成功',
      data: {
        model: {
          id: model.id,
          title: model.title,
          description: model.description,
          thumbnail: model.thumbnail,
          images: model.images,
          category: model.category,
          is_public: model.is_public,
          created_at: model.created_at
        }
      }
    })

  } catch (error) {
    console.error('Model creation error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'latest'
    const userId = searchParams.get('userId') // 获取特定用户的模型

    const offset = (page - 1) * limit

    // 构建查询
    let query = supabaseAdmin
      .from('face_models')
      .select(`
        *,
        author:users!face_models_author_id_fkey(
          id,
          username,
          display_name,
          avatar
        ),
        stats:model_stats(
          views,
          downloads,
          likes,
          comments
        ),
        tags:model_tags(
          tag:tags(
            id,
            name,
            color,
            category
          )
        )
      `)

    // 如果不是获取特定用户的模型，只显示公开的模型
    if (!userId) {
      query = query.eq('is_public', true)
    } else {
      query = query.eq('author_id', userId)
    }

    // 分类筛选
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // 搜索筛选
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // 排序
    switch (sortBy) {
      case 'popular':
        query = query.order('views', { ascending: false, foreignTable: 'model_stats' })
        break
      case 'most_liked':
        query = query.order('likes', { ascending: false, foreignTable: 'model_stats' })
        break
      case 'trending':
        // 简单的趋势算法：最近7天的点赞数 + 浏览数
        query = query.order('created_at', { ascending: false })
        break
      default: // latest
        query = query.order('created_at', { ascending: false })
    }

    // 分页
    query = query.range(offset, offset + limit - 1)

    const { data: models, error } = await query

    if (error) {
      console.error('Models fetch error:', error)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '获取模型列表失败'
      }, { status: 500 })
    }

    // 获取总数
    let countQuery = supabaseAdmin
      .from('face_models')
      .select('*', { count: 'exact', head: true })

    if (!userId) {
      countQuery = countQuery.eq('is_public', true)
    } else {
      countQuery = countQuery.eq('author_id', userId)
    }

    if (category && category !== 'all') {
      countQuery = countQuery.eq('category', category)
    }

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Count fetch error:', countError)
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: {
        models: models || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    })

  } catch (error) {
    console.error('Models fetch error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 })
  }
}