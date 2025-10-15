import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ApiResponse } from '@/types'

// 使用服务角色密钥创建管理员客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// GET - 获取模型的评论列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const modelId = searchParams.get('model_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!modelId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '模型ID不能为空'
      }, { status: 400 })
    }

    // 检查模型是否存在且为公开
    const { data: model, error: modelError } = await supabaseAdmin
      .from('face_models')
      .select('id, is_public')
      .eq('id', modelId)
      .single()

    if (modelError || !model) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '模型不存在'
      }, { status: 404 })
    }

    if (!model.is_public) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '无权限查看此模型的评论'
      }, { status: 403 })
    }

    // 计算分页
    const from = (page - 1) * limit
    const to = from + limit - 1

    // 获取评论列表（只获取顶级评论，不包括回复）
    const { data: comments, error: commentsError, count } = await supabaseAdmin
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        updated_at,
        is_edited,
        likes,
        author:users!comments_author_id_fkey (
          id,
          username,
          display_name,
          avatar
        )
      `, { count: 'exact' })
      .eq('model_id', modelId)
      .is('parent_id', null) // 只获取顶级评论
      .order('created_at', { ascending: false })
      .range(from, to)

    if (commentsError) {
      console.error('获取评论失败:', commentsError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '获取评论失败'
      }, { status: 500 })
    }

    // 为每个评论获取回复数量
    const commentsWithReplies = await Promise.all(
      (comments || []).map(async (comment) => {
        const { count: repliesCount } = await supabaseAdmin
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('parent_id', comment.id)

        return {
          ...comment,
          reply_count: repliesCount || 0
        }
      })
    )

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      message: '获取评论成功',
      data: {
        comments: commentsWithReplies,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: (page * limit) < (count || 0),
          hasPrev: page > 1
        }
      }
    })

  } catch (error) {
    console.error('获取评论异常:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 })
  }
}

// POST - 发表评论
export async function POST(request: NextRequest) {
  try {
    // 获取认证token
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '未提供认证token'
      }, { status: 401 })
    }

    // 验证用户身份
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('认证失败:', authError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '认证失败'
      }, { status: 401 })
    }

    const { model_id, content, parent_id } = await request.json()

    // 验证必要参数
    if (!model_id || !content) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '模型ID和评论内容不能为空'
      }, { status: 400 })
    }

    // 验证评论内容长度
    if (content.trim().length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '评论内容不能为空'
      }, { status: 400 })
    }

    if (content.length > 1000) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '评论内容不能超过1000个字符'
      }, { status: 400 })
    }

    // 检查模型是否存在且为公开
    const { data: model, error: modelError } = await supabaseAdmin
      .from('face_models')
      .select('id, is_public')
      .eq('id', model_id)
      .single()

    if (modelError || !model) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '模型不存在'
      }, { status: 404 })
    }

    if (!model.is_public) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '无权限评论此模型'
      }, { status: 403 })
    }

    // 如果是回复评论，检查父评论是否存在
    if (parent_id) {
      const { data: parentComment, error: parentError } = await supabaseAdmin
        .from('comments')
        .select('id, model_id')
        .eq('id', parent_id)
        .single()

      if (parentError || !parentComment) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          message: '父评论不存在'
        }, { status: 404 })
      }

      if (parentComment.model_id !== model_id) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          message: '父评论与模型不匹配'
        }, { status: 400 })
      }
    }

    // 插入评论
    const { data: newComment, error: insertError } = await supabaseAdmin
      .from('comments')
      .insert({
        content: content.trim(),
        author_id: user.id,
        model_id,
        parent_id: parent_id || null
      })
      .select(`
        id,
        content,
        created_at,
        updated_at,
        is_edited,
        likes,
        author:users!comments_author_id_fkey (
          id,
          username,
          display_name,
          avatar
        )
      `)
      .single()

    if (insertError) {
      console.error('插入评论失败:', insertError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '发表评论失败'
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      message: '评论发表成功',
      data: {
        ...newComment,
        reply_count: 0
      }
    })

  } catch (error) {
    console.error('发表评论异常:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 })
  }
}