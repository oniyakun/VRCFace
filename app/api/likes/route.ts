import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// POST - 点赞或取消点赞
export async function POST(request: NextRequest) {
  try {
    const { model_id, user_id } = await request.json()

    if (!model_id || !user_id) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 检查是否已经点赞
    const { data: existingLike, error: checkError } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('user_id', user_id)
      .eq('model_id', model_id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('检查点赞状态失败:', checkError)
      return NextResponse.json(
        { error: '检查点赞状态失败' },
        { status: 500 }
      )
    }

    if (existingLike) {
      // 取消点赞
      const { error: deleteError } = await supabaseAdmin
        .from('likes')
        .delete()
        .eq('user_id', user_id)
        .eq('model_id', model_id)

      if (deleteError) {
        console.error('取消点赞失败:', deleteError)
        return NextResponse.json(
          { error: '取消点赞失败' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        action: 'unliked',
        message: '已取消点赞' 
      })
    } else {
      // 添加点赞
      const { error: insertError } = await supabaseAdmin
        .from('likes')
        .insert({
          user_id,
          model_id
        })

      if (insertError) {
        console.error('点赞失败:', insertError)
        return NextResponse.json(
          { error: '点赞失败' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        action: 'liked',
        message: '点赞成功' 
      })
    }
  } catch (error) {
    console.error('点赞操作异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// GET - 获取用户的点赞状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const model_id = searchParams.get('model_id')
    const user_id = searchParams.get('user_id')

    if (!model_id || !user_id) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const { data: like, error } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('user_id', user_id)
      .eq('model_id', model_id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('获取点赞状态失败:', error)
      return NextResponse.json(
        { error: '获取点赞状态失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      isLiked: !!like
    })
  } catch (error) {
    console.error('获取点赞状态异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}