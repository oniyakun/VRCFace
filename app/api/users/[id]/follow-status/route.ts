import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const targetUserId = params.id

    if (!targetUserId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '用户ID不能为空'
      }, { status: 400 })
    }

    // 验证用户认证
    const authorization = request.headers.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse<{ isFollowing: boolean }>>({
        success: true,
        data: { isFollowing: false }
      })
    }

    const token = authorization.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json<ApiResponse<{ isFollowing: boolean }>>({
        success: true,
        data: { isFollowing: false }
      })
    }

    const currentUserId = user.id

    // 如果是查看自己的状态，返回false
    if (currentUserId === targetUserId) {
      return NextResponse.json<ApiResponse<{ isFollowing: boolean }>>({
        success: true,
        data: { isFollowing: false }
      })
    }

    // 检查是否已关注
    const { data: followRelation, error: followError } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId)
      .single()

    if (followError && followError.code !== 'PGRST116') {
      console.error('Follow status check error:', followError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '检查关注状态失败'
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<{ isFollowing: boolean }>>({
      success: true,
      data: { isFollowing: !!followRelation }
    })

  } catch (error) {
    console.error('Follow status error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}