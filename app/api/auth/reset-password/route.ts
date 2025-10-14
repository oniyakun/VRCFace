import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ApiResponse } from '@/types'

// 普通客户端用于认证
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { password, accessToken, refreshToken } = await request.json()

    // 验证必填字段
    if (!password || !accessToken || !refreshToken) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '缺少必要参数'
      }, { status: 400 })
    }

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '密码长度至少为6位'
      }, { status: 400 })
    }

    // 设置会话
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    })

    if (sessionError) {
      console.error('Session error:', sessionError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '无效的重置链接或链接已过期'
      }, { status: 400 })
    }

    // 更新密码
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '密码更新失败，请稍后重试'
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: '密码重置成功，请使用新密码登录'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}