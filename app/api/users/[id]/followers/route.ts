import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ApiResponse } from '@/types'

interface Follower {
  id: string
  username: string
  display_name: string | null
  avatar: string | null
  is_verified: boolean
  created_at: string
}

// 创建服务端 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    // 获取用户的访问令牌
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    // 对于 followers 查询，使用服务角色密钥客户端
    // 这样可以绕过 RLS 策略限制，确保能够查询到数据
    const queryClient = supabase

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

    // 获取粉丝列表 - 使用服务端客户端
    const { data: followers, error: followersError } = await queryClient
      .from('follows')
      .select(`
        follower_id,
        created_at,
        follower:users!follows_follower_id_fkey (
          id,
          username,
          display_name,
          avatar,
          is_verified
        )
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (followersError) {
      console.error('Followers fetch error:', followersError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '获取粉丝列表失败'
      }, { status: 500 })
    }

    // 获取总数 - 使用服务端客户端
    const { count, error: countError } = await queryClient
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)

    if (countError) {
      console.error('Followers count error:', countError)
    }

    // 格式化数据
    const formattedFollowers: Follower[] = followers?.map((follow: any) => ({
      id: follow.follower.id,
      username: follow.follower.username,
      display_name: follow.follower.display_name,
      avatar: follow.follower.avatar,
      is_verified: follow.follower.is_verified,
      created_at: follow.created_at
    })) || []

    return NextResponse.json<ApiResponse<{
      followers: Follower[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }>>({
      success: true,
      data: {
        followers: formattedFollowers,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get followers error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}