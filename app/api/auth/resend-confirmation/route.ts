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

    // 重新发送确认邮件
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth?verified=true`
      }
    })

    if (error) {
      console.error('Resend confirmation error:', error)
      
      if (error.message.includes('already confirmed')) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: '该邮箱已经验证过了'
        }, { status: 400 })
      }

      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '发送验证邮件失败，请稍后重试'
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: '验证邮件已重新发送，请检查您的邮箱'
    })

  } catch (error) {
    console.error('Resend confirmation error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}