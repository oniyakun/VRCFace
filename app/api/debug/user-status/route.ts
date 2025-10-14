import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({
        success: false,
        error: '邮箱为必填项'
      }, { status: 400 })
    }

    // 检查数据库中的用户
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .select('id, email, is_verified, created_at')
      .eq('email', email)
      .single()

    // 检查 Supabase Auth 中的用户
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    const authUser = authUsers?.users.find(u => u.email === email)

    return NextResponse.json({
      success: true,
      data: {
        database_user: dbUser || null,
        database_error: dbError?.message || null,
        auth_user: authUser ? {
          id: authUser.id,
          email: authUser.email,
          email_confirmed_at: authUser.email_confirmed_at,
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at,
          confirmed_at: authUser.confirmed_at
        } : null,
        auth_error: authError?.message || null
      }
    })

  } catch (error) {
    console.error('Debug user status error:', error)
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}