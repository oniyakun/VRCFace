import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/types'

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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '无效的授权令牌'
      }, { status: 401 })
    }

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
    const { data: existingFollow } = await supabase
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
    const { error: followError } = await supabase
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: '无效的授权令牌'
      }, { status: 401 })
    }

    const followerId = user.id

    // 检查关注关系是否存在
    const { data: existingFollow, error: followCheckError } = await supabase
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
    const { error: unfollowError } = await supabase
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