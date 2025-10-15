import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 验证管理员权限
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    // 检查用户角色
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || userData?.role !== 'admin') {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}

// GET - 获取所有模型/发帖列表
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdmin(request)
    if (!user) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const search = url.searchParams.get('search') || ''
    const authorId = url.searchParams.get('authorId') || ''

    let query = supabase
      .from('face_models')
      .select(`
        id,
        title,
        description,
        is_public,
        created_at,
        updated_at,
        images,
        author:users!face_models_author_id_fkey (
          id,
          username,
          display_name,
          avatar
        ),
        stats:model_stats (
          likes,
          comments,
          views,
          downloads
        )
      `)

    // 搜索过滤
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // 作者过滤
    if (authorId) {
      query = query.eq('author_id', authorId)
    }

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: models, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取模型列表失败:', error)
      return NextResponse.json({ error: '获取模型列表失败' }, { status: 500 })
    }

    return NextResponse.json({
      data: models,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('获取模型列表错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// DELETE - 删除模型/发帖
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAdmin(request)
    if (!user) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const { modelId } = await request.json()

    if (!modelId) {
      return NextResponse.json({ error: '模型ID不能为空' }, { status: 400 })
    }

    // 获取模型信息（用于删除相关图片）
    const { data: model, error: getError } = await supabase
      .from('face_models')
      .select(`
        id,
        author_id,
        images
      `)
      .eq('id', modelId)
      .single()

    if (getError) {
      console.error('获取模型信息失败:', getError)
      return NextResponse.json({ error: '模型不存在' }, { status: 404 })
    }

    // 删除相关图片文件
    if (model.images && model.images.length > 0) {
      const imagePaths = model.images.map((imageUrl: string) => {
        const url = imageUrl
        const path = url.split('/').pop()
        return `models/${model.author_id}/${path}`
      })

      const { error: storageError } = await supabase.storage
        .from('face-models')
        .remove(imagePaths)

      if (storageError) {
        console.error('删除图片文件失败:', storageError)
      }
    }

    // 删除模型记录（级联删除相关数据）
    const { error } = await supabase
      .from('face_models')
      .delete()
      .eq('id', modelId)

    if (error) {
      console.error('删除模型失败:', error)
      return NextResponse.json({ error: '删除模型失败' }, { status: 500 })
    }

    return NextResponse.json({ message: '模型删除成功' })

  } catch (error) {
    console.error('删除模型错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// PUT - 更新模型状态（如设为私有/公开）
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAdmin(request)
    if (!user) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const { modelId, updates } = await request.json()

    if (!modelId) {
      return NextResponse.json({ error: '模型ID不能为空' }, { status: 400 })
    }

    // 首先检查模型是否存在
    const { data: existingModel, error: checkError } = await supabase
      .from('face_models')
      .select('id')
      .eq('id', modelId)
      .single()

    if (checkError || !existingModel) {
      console.error('模型不存在:', checkError)
      return NextResponse.json({ error: '模型不存在' }, { status: 404 })
    }

    // 更新模型
    const { data, error } = await supabase
      .from('face_models')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', modelId)
      .select()

    if (error) {
      console.error('更新模型失败:', error)
      return NextResponse.json({ error: '更新模型失败' }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: '更新失败，模型可能已被删除' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: '模型更新成功',
      data: data[0] 
    })

  } catch (error) {
    console.error('更新模型错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}