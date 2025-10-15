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
    const { email, password, username, displayName } = await request.json()

    // 验证必填字段
    if (!email || !password || !username) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '邮箱、密码和用户名为必填项'
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

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '密码长度至少为6位'
      }, { status: 400 })
    }

    // 验证用户名格式
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '用户名只能包含字母、数字和下划线，长度为3-20位'
      }, { status: 400 })
    }

    // 检查用户名是否已存在
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '用户名已存在'
      }, { status: 409 })
    }

    // 使用 Supabase Auth 注册用户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: displayName || username
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth?verified=true`
      }
    })

    if (authError) {
      console.error('Auth registration error:', authError)
      
      // 处理常见的认证错误
      if (authError.message.includes('already registered')) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: '该邮箱已被注册'
        }, { status: 409 })
      }

      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '注册失败，请稍后重试'
      }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '注册失败，请稍后重试'
      }, { status: 500 })
    }

    // 在用户表中创建用户记录
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        username,
        email,
        display_name: displayName || username,
        role: 'user'
      })

    if (dbError) {
      console.error('Database user creation error:', dbError)
      
      // 如果数据库插入失败，删除已创建的认证用户
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '用户创建失败，请稍后重试'
      }, { status: 500 })
    }

    // 创建用户统计记录
    const { error: statsError } = await supabaseAdmin
      .from('user_stats')
      .insert({
        user_id: authData.user.id,
        models_count: 0,
        likes_received: 0,
        comments_received: 0,
        followers_count: 0,
        following_count: 0
      })

    if (statsError) {
      console.error('User stats creation error:', statsError)
      // 如果统计记录创建失败，不影响注册流程，只记录错误
    }

    return NextResponse.json<ApiResponse<{ user: any }>>({
      success: true,
      message: '注册成功！请检查您的邮箱以验证账户。',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          username,
          displayName: displayName || username
        }
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}