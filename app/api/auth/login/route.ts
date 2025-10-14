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

// 普通客户端用于认证
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 验证必填字段
    if (!email || !password) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '邮箱和密码为必填项'
      }, { status: 400 })
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '邮箱格式不正确'
      }, { status: 400 })
    }

    // 使用 Supabase Auth 登录
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      console.error('Auth login error:', authError)
      console.error('Login attempt for email:', email)
      
      // 处理常见的认证错误
      if (authError.message.includes('Invalid login credentials') || authError.code === 'invalid_credentials') {
        // 检查用户是否存在以及邮箱验证状态
        try {
          const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id, email, is_verified')
            .eq('email', email)
            .single()
          
          if (existingUser) {
            console.log('User exists in database, is_verified:', existingUser.is_verified)
            
            // 检查 Supabase Auth 中的用户状态
            try {
              const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
              const authUser = authUsers.users.find(u => u.email === email)
              
              if (authUser) {
                console.log('Auth user found, email_confirmed_at:', authUser.email_confirmed_at)
                
                if (!authUser.email_confirmed_at) {
                  return NextResponse.json<ApiResponse<null>>({
                    success: false,
                    error: '请先验证您的邮箱后再登录'
                  }, { status: 401 })
                }
              }
            } catch (authCheckError) {
              console.error('Error checking auth user:', authCheckError)
            }
            
            // 如果邮箱已验证但仍然登录失败，可能是密码错误
            return NextResponse.json<ApiResponse<null>>({
              success: false,
              error: '密码错误，请检查后重试'
            }, { status: 401 })
          }
        } catch (error) {
          console.error('Error checking user existence:', error)
          // 用户不存在，返回通用错误信息
        }
        
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: '邮箱或密码错误'
        }, { status: 401 })
      }

      if (authError.message.includes('Email not confirmed')) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: '请先验证您的邮箱'
        }, { status: 401 })
      }

      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '登录失败，请稍后重试'
      }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '登录失败，请稍后重试'
      }, { status: 500 })
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
        updated_at,
        stats:user_stats(
          models_count,
          likes_received,
          comments_received,
          followers_count,
          following_count
        )
      `)
      .eq('id', authData.user.id)
      .single()

    if (userError || !userData) {
      console.error('User data fetch error:', userError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '获取用户信息失败'
      }, { status: 500 })
    }

    // 返回用户信息和会话信息
    return NextResponse.json<ApiResponse<{ user: any; session: any }>>({
      success: true,
      message: '登录成功',
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
        },
        session: {
          accessToken: authData.session?.access_token,
          refreshToken: authData.session?.refresh_token,
          expiresAt: authData.session?.expires_at
        }
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}