import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// POST - 收藏或取消收藏
export async function POST(request: NextRequest) {
  try {
    const { model_id, user_id } = await request.json()

    if (!model_id || !user_id) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 检查是否已经收藏
    const { data: existingFavorite, error: checkError } = await supabaseAdmin
      .from('favorites')
      .select('id')
      .eq('user_id', user_id)
      .eq('model_id', model_id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('检查收藏状态失败:', checkError)
      return NextResponse.json(
        { error: '检查收藏状态失败' },
        { status: 500 }
      )
    }

    if (existingFavorite) {
      // 取消收藏
      const { error: deleteError } = await supabaseAdmin
        .from('favorites')
        .delete()
        .eq('user_id', user_id)
        .eq('model_id', model_id)

      if (deleteError) {
        console.error('取消收藏失败:', deleteError)
        return NextResponse.json(
          { error: '取消收藏失败' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        action: 'unfavorited',
        message: '已取消收藏' 
      })
    } else {
      // 添加收藏
      const { error: insertError } = await supabaseAdmin
        .from('favorites')
        .insert({
          user_id,
          model_id
        })

      if (insertError) {
        console.error('收藏失败:', insertError)
        return NextResponse.json(
          { error: '收藏失败' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        action: 'favorited',
        message: '收藏成功' 
      })
    }
  } catch (error) {
    console.error('收藏操作异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// GET - 获取用户的收藏状态
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

    const { data: favorite, error } = await supabaseAdmin
      .from('favorites')
      .select('id')
      .eq('user_id', user_id)
      .eq('model_id', model_id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('获取收藏状态失败:', error)
      return NextResponse.json(
        { error: '获取收藏状态失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      isFavorited: !!favorite
    })
  } catch (error) {
    console.error('获取收藏状态异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// DELETE - 批量删除收藏（用于用户管理收藏列表）
export async function DELETE(request: NextRequest) {
  try {
    const { model_ids, user_id } = await request.json()

    if (!model_ids || !Array.isArray(model_ids) || !user_id) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('favorites')
      .delete()
      .eq('user_id', user_id)
      .in('model_id', model_ids)

    if (error) {
      console.error('批量删除收藏失败:', error)
      return NextResponse.json(
        { error: '批量删除收藏失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: `已删除 ${model_ids.length} 个收藏` 
    })
  } catch (error) {
    console.error('批量删除收藏异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}