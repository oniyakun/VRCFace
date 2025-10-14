import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
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

    // 使用 Supabase Auth 登出
    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      console.error('Auth logout error:', signOutError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '登出失败，请稍后重试'
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: '登出成功'
    })

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}