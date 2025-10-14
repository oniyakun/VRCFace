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

    // 获取用户的模型作品
    const { data: modelsData, error: modelsError } = await supabaseAdmin
      .from('face_models')
      .select(`
        id,
        title,
        description,
        thumbnail,
        category,
        created_at,
        stats:model_stats(views, downloads, likes, comments)
      `)
      .eq('author_id', userId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(12)

    // 检查当前用户是否关注了该用户（如果有认证信息）
    let isFollowing = false
    const authorization = request.headers.get('authorization')
    
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.replace('Bearer ', '')
      
      try {
        const { data: { user: currentUser } } = await supabaseAdmin.auth.getUser(token)
        
        if (currentUser && currentUser.id !== userId) {
          const { data: followData } = await supabaseAdmin
            .from('follows')
            .select('id')
            .eq('follower_id', currentUser.id)
            .eq('following_id', userId)
            .single()
          
          isFollowing = !!followData
        }
      } catch (error) {
        // 忽略认证错误，继续返回用户信息
      }
    }

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
      stats: statsData || {
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