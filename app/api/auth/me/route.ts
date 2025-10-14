import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    // 从请求头获取授权令牌
    const authorization = request.headers.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '未提供有效的授权令牌'
      }, { status: 401 })
    }

    const token = authorization.replace('Bearer ', '')

    // 验证令牌并获取用户信息
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '无效的授权令牌'
      }, { status: 401 })
    }

    // 获取用户详细信息
    const { data: userData, error: userError } = await supabase
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
        updated_at,
        stats:user_stats(
          models_count,
          likes_received,
          comments_received,
          followers_count,
          following_count
        )
      `)
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      console.error('User data fetch error:', userError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '获取用户信息失败'
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<{ user: any }>>({
      success: true,
      data: {
        user: {
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
          stats: userData.stats || {
            modelsCount: 0,
            likesReceived: 0,
            commentsReceived: 0,
            followersCount: 0,
            followingCount: 0
          }
        }
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}