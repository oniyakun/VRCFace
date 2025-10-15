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

// GET - 获取评论的回复列表
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!commentId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '评论ID不能为空'
      }, { status: 400 })
    }

    // 检查父评论是否存在
    const { data: parentComment, error: parentError } = await supabaseAdmin
      .from('comments')
      .select(`
        id,
        model_id,
        model:face_models!comments_model_id_fkey (
          is_public
        )
      `)
      .eq('id', commentId)
      .single()

    if (parentError || !parentComment) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '评论不存在'
      }, { status: 404 })
    }

    // 检查模型是否公开
    const model = Array.isArray(parentComment.model) ? parentComment.model[0] : parentComment.model
    if (!model || !model.is_public) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '无权限查看此评论的回复'
      }, { status: 403 })
    }

    // 计算分页
    const from = (page - 1) * limit
    const to = from + limit - 1

    // 递归获取回复及其子回复的函数
    const getRepliesRecursively = async (parentId: string): Promise<any[]> => {
      const { data: directReplies, error } = await supabaseAdmin
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
        `)
        .eq('parent_id', parentId)
        .order('created_at', { ascending: true })

      if (error || !directReplies) {
        return []
      }

      // 为每个回复递归获取其子回复
      const repliesWithChildren = await Promise.all(
        directReplies.map(async (reply) => {
          const childReplies = await getRepliesRecursively(reply.id)
          return {
            ...reply,
            replies: childReplies
          }
        })
      )

      return repliesWithChildren
    }

    // 获取回复列表（包含嵌套回复）
    const replies = await getRepliesRecursively(commentId)
    
    // 计算总数（只计算直接回复）
    const { count } = await supabaseAdmin
      .from('comments')
      .select('id', { count: 'exact' })
      .eq('parent_id', commentId)

    if (!replies) {
      console.error('获取回复失败')
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '获取回复失败'
      }, { status: 500 })
    }

    // 对回复进行分页处理
    const paginatedReplies = replies.slice(from, from + limit)
    
    return NextResponse.json<ApiResponse<any>>({
      success: true,
      message: '获取回复成功',
      data: {
        replies: paginatedReplies,
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
    console.error('获取回复异常:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 })
  }
}

// PUT - 更新评论
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id

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

    const { content } = await request.json()

    // 验证评论内容
    if (!content || content.trim().length === 0) {
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

    // 检查评论是否存在且用户有权限编辑
    const { data: existingComment, error: commentError } = await supabaseAdmin
      .from('comments')
      .select('id, author_id, content')
      .eq('id', commentId)
      .single()

    if (commentError || !existingComment) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '评论不存在'
      }, { status: 404 })
    }

    if (existingComment.author_id !== user.id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '无权限编辑此评论'
      }, { status: 403 })
    }

    // 检查内容是否有变化
    if (existingComment.content === content.trim()) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '评论内容未发生变化'
      }, { status: 400 })
    }

    // 更新评论
    const { data: updatedComment, error: updateError } = await supabaseAdmin
      .from('comments')
      .update({
        content: content.trim(),
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
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

    if (updateError) {
      console.error('更新评论失败:', updateError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '更新评论失败'
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      message: '评论更新成功',
      data: updatedComment
    })

  } catch (error) {
    console.error('更新评论异常:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 })
  }
}

// DELETE - 删除评论
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id

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

    // 检查评论是否存在且用户有权限删除
    const { data: existingComment, error: commentError } = await supabaseAdmin
      .from('comments')
      .select('id, author_id')
      .eq('id', commentId)
      .single()

    if (commentError || !existingComment) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '评论不存在'
      }, { status: 404 })
    }

    if (existingComment.author_id !== user.id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '无权限删除此评论'
      }, { status: 403 })
    }

    // 删除评论（级联删除回复）
    const { error: deleteError } = await supabaseAdmin
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (deleteError) {
      console.error('删除评论失败:', deleteError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '删除评论失败'
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: '评论删除成功'
    })

  } catch (error) {
    console.error('删除评论异常:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 })
  }
}