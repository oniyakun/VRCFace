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

// GET - 获取所有标签列表
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdmin(request)
    if (!user) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const search = url.searchParams.get('search') || ''

    let query = supabase
      .from('tags')
      .select(`
        id,
        name,
        description,
        color,
        created_at,
        usage_count:model_tags(count)
      `)

    // 搜索过滤
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: tags, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取标签列表失败:', error)
      return NextResponse.json({ error: '获取标签列表失败' }, { status: 500 })
    }

    return NextResponse.json({
      data: tags,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('获取标签列表错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// POST - 创建新标签
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdmin(request)
    if (!user) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const { name, description, color } = await request.json()

    if (!name) {
      return NextResponse.json({ error: '标签名称不能为空' }, { status: 400 })
    }

    // 检查标签是否已存在
    const { data: existingTag } = await supabase
      .from('tags')
      .select('id')
      .eq('name', name)
      .single()

    if (existingTag) {
      return NextResponse.json({ error: '标签已存在' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tags')
      .insert({
        name,
        description: description || null,
        color: color || '#3B82F6'
      })
      .select()
      .single()

    if (error) {
      console.error('创建标签失败:', error)
      return NextResponse.json({ error: '创建标签失败' }, { status: 500 })
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('创建标签错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// PUT - 更新标签
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAdmin(request)
    if (!user) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const { tagId, updates } = await request.json()

    if (!tagId) {
      return NextResponse.json({ error: '标签ID不能为空' }, { status: 400 })
    }

    // 如果更新名称，检查是否与其他标签重复
    if (updates.name) {
      const { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', updates.name)
        .neq('id', tagId)
        .single()

      if (existingTag) {
        return NextResponse.json({ error: '标签名称已存在' }, { status: 400 })
      }
    }

    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', tagId)
      .select()
      .single()

    if (error) {
      console.error('更新标签失败:', error)
      return NextResponse.json({ error: '更新标签失败' }, { status: 500 })
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('更新标签错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// DELETE - 删除标签
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAdmin(request)
    if (!user) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const { tagId } = await request.json()

    if (!tagId) {
      return NextResponse.json({ error: '标签ID不能为空' }, { status: 400 })
    }

    // 检查标签是否被使用
    const { data: usage, error: usageError } = await supabase
      .from('model_tags')
      .select('id')
      .eq('tag_id', tagId)
      .limit(1)

    if (usageError) {
      console.error('检查标签使用情况失败:', usageError)
      return NextResponse.json({ error: '检查标签使用情况失败' }, { status: 500 })
    }

    if (usage && usage.length > 0) {
      return NextResponse.json({ error: '标签正在被使用，无法删除' }, { status: 400 })
    }

    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId)

    if (error) {
      console.error('删除标签失败:', error)
      return NextResponse.json({ error: '删除标签失败' }, { status: 500 })
    }

    return NextResponse.json({ message: '标签删除成功' })

  } catch (error) {
    console.error('删除标签错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}