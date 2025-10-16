import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { ApiResponse } from '@/types'

interface Following {
  id: string
  username: string
  display_name: string | null
  avatar: string | null
  is_verified: boolean
  created_at: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = (page - 1) * limit

    if (!userId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '用户ID不能为空'
      }, { status: 400 })
    }

    // 创建服务角色密钥客户端，用于绕过 RLS 策略查询关注数据
    const queryClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 检查目标用户是否存在
    const { data: targetUser, error: targetUserError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (targetUserError || !targetUser) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '用户不存在'
      }, { status: 404 })
    }

    // 获取关注列表 - 使用服务角色密钥客户端绕过 RLS 策略
    const { data: following, error: followingError } = await queryClient
      .from('follows')
      .select(`
        following_id,
        created_at,
        following:users!follows_following_id_fkey (
          id,
          username,
          display_name,
          avatar,
          is_verified
        )
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (followingError) {
      console.error('Following fetch error:', followingError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '获取关注列表失败'
      }, { status: 500 })
    }

    // 获取总数 - 使用服务角色密钥客户端绕过 RLS 策略
    const { count, error: countError } = await queryClient
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)

    if (countError) {
      console.error('Following count error:', countError)
    }

    // 格式化数据
    const formattedFollowing: Following[] = following?.map((follow: any) => ({
      id: follow.following.id,
      username: follow.following.username,
      display_name: follow.following.display_name,
      avatar: follow.following.avatar,
      is_verified: follow.following.is_verified,
      created_at: follow.created_at
    })) || []

    return NextResponse.json<ApiResponse<{
      following: Following[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }>>({
      success: true,
      data: {
        following: formattedFollowing,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get following error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}