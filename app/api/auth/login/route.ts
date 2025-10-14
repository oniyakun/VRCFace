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
      .eq('id', authData.user.id)
      .single()

    // 如果用户记录不存在，创建一个新的用户记录
    if (userError && userError.code === 'PGRST116') {
      console.log('User record not found during login, creating new user record for:', authData.user.email)
      
      // 生成用户名（从邮箱前缀生成，确保唯一性）
      const baseUsername = authData.user.email?.split('@')[0] || 'user'
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
          id: authData.user.id,
          username: username,
          email: authData.user.email,
          display_name: authData.user.user_metadata?.display_name || username,
          avatar: authData.user.user_metadata?.avatar_url || null,
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
        console.error('Failed to create user record during login:', createError)
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: '创建用户记录失败'
        }, { status: 500 })
      }

      // 创建用户统计记录
      await supabaseAdmin
        .from('user_stats')
        .insert({
          user_id: authData.user.id,
          models_count: 0,
          likes_received: 0,
          comments_received: 0,
          followers_count: 0,
          following_count: 0
        })

      userData = {
        ...newUser,
        stats: [{
          models_count: 0,
          likes_received: 0,
          comments_received: 0,
          followers_count: 0,
          following_count: 0
        }]
      }
    } else if (userError || !userData) {
      console.error('User data fetch error:', userError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '获取用户信息失败'
      }, { status: 500 })
    }

    // 确保 userData 不为 null 并且有正确的结构
    if (!userData) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '用户数据获取失败'
      }, { status: 500 })
    }

    // 获取用户统计数据，如果没有则使用默认值
    const userStats = userData.stats && Array.isArray(userData.stats) && userData.stats.length > 0 
      ? userData.stats[0] 
      : {
          models_count: 0,
          likes_received: 0,
          comments_received: 0,
          followers_count: 0,
          following_count: 0
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
          stats: {
            modelsCount: userStats.models_count || 0,
            likesReceived: userStats.likes_received || 0,
            commentsReceived: userStats.comments_received || 0,
            followersCount: userStats.followers_count || 0,
            followingCount: userStats.following_count || 0
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