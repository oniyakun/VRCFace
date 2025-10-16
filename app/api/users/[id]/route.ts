import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ApiResponse } from '@/types'

// 使用服务角色密钥创建管理员客户端
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    if (!userId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '用户ID不能为空'
      }, { status: 400 })
    }

    // 获取用户详细信息
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        username,
        email,
        display_name,
        avatar,
        bio,
        is_verified,
        role,
        created_at,
        updated_at
      `)
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      console.error('User data fetch error:', userError)
      console.error('User ID being queried:', userId)
      console.error('Query result:', userData)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '用户不存在'
      }, { status: 404 })
    }

    // 单独获取用户统计信息（如果不存在则使用默认值）
    const { data: statsData } = await supabaseAdmin
      .from('user_stats')
      .select(`
        models_count,
        likes_received,
        comments_received,
        followers_count,
        following_count
      `)
      .eq('user_id', userId)
      .single()

    // 检查当前用户是否关注了该用户（如果有认证信息）
    let isFollowing = false
    let isOwnProfile = false
    const authorization = request.headers.get('authorization')
    
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.replace('Bearer ', '')
      
      try {
        const { data: { user: currentUser } } = await supabaseAdmin.auth.getUser(token)
        
        if (currentUser) {
          isOwnProfile = currentUser.id === userId
          
          if (currentUser.id !== userId) {
            const { data: followData } = await supabaseAdmin
              .from('follows')
              .select('id')
              .eq('follower_id', currentUser.id)
              .eq('following_id', userId)
              .single()
            
            isFollowing = !!followData
          }
        }
      } catch (error) {
        // 忽略认证错误，继续返回用户信息
      }
    }

    // 获取用户的模型作品
    let modelsQuery = supabaseAdmin
      .from('face_models')
      .select(`
        id,
        title,
        description,
        thumbnail,
        images,
        json_data,
        category,
        is_public,
        created_at,
        stats:model_stats(views, downloads, likes, comments),
        tags:model_tags(
          tag:tags(
            id,
            name,
            tag_type
          )
        )
      `)
      .eq('author_id', userId)

    // 如果不是自己的主页，只显示公开的模型
    if (!isOwnProfile) {
      modelsQuery = modelsQuery.eq('is_public', true)
    }

    const { data: modelsData, error: modelsError } = await modelsQuery
      .order('created_at', { ascending: false })
      .limit(12)

    const user = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      displayName: userData.display_name,
      avatar: userData.avatar,
      bio: userData.bio,
      isVerified: userData.is_verified,
      role: userData.role,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
      stats: statsData ? {
        modelsCount: statsData.models_count || 0,
        likesReceived: statsData.likes_received || 0,
        commentsReceived: statsData.comments_received || 0,
        followersCount: statsData.followers_count || 0,
        followingCount: statsData.following_count || 0
      } : {
        modelsCount: 0,
        likesReceived: 0,
        commentsReceived: 0,
        followersCount: 0,
        followingCount: 0
      },
      models: modelsData || [],
      isFollowing
    }

    return NextResponse.json<ApiResponse<{ user: any }>>({
      success: true,
      data: { user }
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}

// 更新用户信息
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    if (!userId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '用户ID不能为空'
      }, { status: 400 })
    }

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

    // 检查是否是用户本人
    if (user.id !== userId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '无权限修改其他用户信息'
      }, { status: 403 })
    }

    // 解析请求体
    const body = await request.json()
    const { displayName, bio, avatar } = body

    // 构建更新数据
    const updateData: any = {}

    if (displayName !== undefined) {
      if (displayName && displayName.trim().length > 50) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          message: '显示名称不能超过50个字符'
        }, { status: 400 })
      }
      updateData.display_name = displayName?.trim() || null
    }

    if (bio !== undefined) {
      if (bio && bio.trim().length > 500) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          message: '个人简介不能超过500个字符'
        }, { status: 400 })
      }
      updateData.bio = bio?.trim() || null
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar?.trim() || null
    }

    // 如果没有要更新的字段
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '没有要更新的字段'
      }, { status: 400 })
    }

    // 添加更新时间
    updateData.updated_at = new Date().toISOString()

    // 更新用户信息
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select(`
        id,
        username,
        email,
        display_name,
        avatar,
        bio,
        is_verified,
        role,
        created_at,
        updated_at
      `)
      .single()

    if (updateError || !updatedUser) {
      console.error('Update user error:', updateError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '更新用户信息失败'
      }, { status: 500 })
    }

    // 获取用户统计信息
    const { data: statsData } = await supabaseAdmin
      .from('user_stats')
      .select(`
        models_count,
        likes_received,
        comments_received,
        followers_count,
        following_count
      `)
      .eq('user_id', userId)
      .single()

    const responseUser = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      displayName: updatedUser.display_name,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      isVerified: updatedUser.is_verified,
      role: updatedUser.role,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at,
      stats: statsData || {
        modelsCount: 0,
        likesReceived: 0,
        commentsReceived: 0,
        followersCount: 0,
        followingCount: 0
      }
    }

    return NextResponse.json<ApiResponse<{ user: any }>>({
      success: true,
      message: '用户信息更新成功',
      data: { user: responseUser }
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 })
  }
}