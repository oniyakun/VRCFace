import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ApiResponse } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const followingId = params.id

    if (!followingId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '用户ID不能为空'
      }, { status: 400 })
    }

    // 验证用户认证
    const authorization = request.headers.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '未提供有效的授权令牌'
      }, { status: 401 })
    }

    const token = authorization.replace('Bearer ', '')
    
    // 创建带有用户 token 的 Supabase 客户端
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 设置用户会话
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '无效的授权令牌'
      }, { status: 401 })
    }

    // 创建一个新的客户端实例，使用用户的访问令牌
    const userSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    const followerId = user.id

    // 检查是否尝试关注自己
    if (followerId === followingId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '不能关注自己'
      }, { status: 400 })
    }

    // 检查目标用户是否存在
    const { data: targetUser, error: targetUserError } = await supabase
      .from('users')
      .select('id')
      .eq('id', followingId)
      .single()

    if (targetUserError || !targetUser) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '目标用户不存在'
      }, { status: 404 })
    }

    // 检查是否已经关注
    const { data: existingFollow } = await userSupabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single()

    if (existingFollow) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '已经关注了该用户'
      }, { status: 409 })
    }

    // 创建关注关系
    const { error: followError } = await userSupabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId
      })

    if (followError) {
      console.error('Follow creation error:', followError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '关注失败，请稍后重试'
      }, { status: 500 })
    }

    // 更新用户统计数据
    await Promise.all([
      // 更新关注者的关注数
      supabase.rpc('increment_following_count', { user_id: followerId }),
      // 更新被关注者的粉丝数
      supabase.rpc('increment_followers_count', { user_id: followingId })
    ])

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: '关注成功'
    })

  } catch (error) {
    console.error('Follow error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const followingId = params.id

    if (!followingId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '用户ID不能为空'
      }, { status: 400 })
    }

    // 验证用户认证
    const authorization = request.headers.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '未提供有效的授权令牌'
      }, { status: 401 })
    }

    const token = authorization.replace('Bearer ', '')
    
    // 创建带有用户 token 的 Supabase 客户端
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 设置用户会话
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '无效的授权令牌'
      }, { status: 401 })
    }

    // 创建一个新的客户端实例，使用用户的访问令牌
    const userSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    const followerId = user.id

    // 检查关注关系是否存在
    const { data: existingFollow, error: followCheckError } = await userSupabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single()

    if (followCheckError || !existingFollow) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '未关注该用户'
      }, { status: 404 })
    }

    // 删除关注关系
    const { error: unfollowError } = await userSupabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId)

    if (unfollowError) {
      console.error('Unfollow error:', unfollowError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '取消关注失败，请稍后重试'
      }, { status: 500 })
    }

    // 更新用户统计数据
    await Promise.all([
      // 更新关注者的关注数
      supabase.rpc('decrement_following_count', { user_id: followerId }),
      // 更新被关注者的粉丝数
      supabase.rpc('decrement_followers_count', { user_id: followingId })
    ])

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: '取消关注成功'
    })

  } catch (error) {
    console.error('Unfollow error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}