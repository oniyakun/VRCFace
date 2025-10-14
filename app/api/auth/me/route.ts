import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ApiResponse } from '@/types'

// 普通客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 服务角色客户端（用于绕过 RLS）
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
    let { data: userData, error: userError } = await supabaseAdmin
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

    // 如果用户记录不存在，创建一个新的用户记录
    if (userError && userError.code === 'PGRST116') {
      console.log('User record not found, creating new user record for:', user.email)
      
      // 生成用户名（从邮箱前缀生成，确保唯一性）
      const baseUsername = user.email?.split('@')[0] || 'user'
      let username = baseUsername
      let counter = 1
      
      // 检查用户名是否已存在，如果存在则添加数字后缀
      while (true) {
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('username')
          .eq('username', username)
          .single()
        
        if (!existingUser) break
        username = `${baseUsername}${counter}`
        counter++
      }

      // 创建新用户记录
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          id: user.id,
          username: username,
          email: user.email,
          display_name: user.user_metadata?.display_name || username,
          avatar: user.user_metadata?.avatar_url || null,
          bio: null,
          is_verified: false,
          role: 'user'
        })
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

      if (createError) {
        console.error('Failed to create user record:', createError)
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: '创建用户记录失败'
        }, { status: 500 })
      }

      // 创建用户统计记录
      await supabaseAdmin
        .from('user_stats')
        .insert({
          user_id: user.id,
          models_count: 0,
          likes_received: 0,
          comments_received: 0,
          followers_count: 0,
          following_count: 0
        })

      userData = {
        ...newUser,
        stats: {
          models_count: 0,
          likes_received: 0,
          comments_received: 0,
          followers_count: 0,
          following_count: 0
        }
      }
    } else if (userError || !userData) {
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