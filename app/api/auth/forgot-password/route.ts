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
    const { email } = await request.json()

    // 验证必填字段
    if (!email) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '邮箱为必填项'
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

    // 发送密码重置邮件
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`
    })

    if (error) {
      console.error('Password reset error:', error)
      
      // 为了安全考虑，不透露用户是否存在
      // 即使邮箱不存在也返回成功消息
      if (error.message.includes('User not found')) {
        return NextResponse.json<ApiResponse<null>>({
          success: true,
          message: '如果该邮箱已注册，您将收到密码重置邮件'
        })
      }

      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '发送密码重置邮件失败，请稍后重试'
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: '密码重置邮件已发送，请检查您的邮箱'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}