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

// GET - 获取所有用户列表
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
    const role = url.searchParams.get('role') || ''

    let query = supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        display_name,
        avatar,
        role,
        is_verified,
        created_at,
        user_stats (
          models_count,
          likes_received,
          followers_count
        )
      `)

    // 搜索过滤
    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,display_name.ilike.%${search}%`)
    }

    // 角色过滤
    if (role) {
      query = query.eq('role', role)
    }

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: users, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取用户列表失败:', error)
      return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 })
    }

    return NextResponse.json({
      data: users,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('获取用户列表错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// PUT - 更新用户信息（包括封禁/解封）
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAdmin(request)
    if (!user) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const { userId, updates } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: '用户ID不能为空' }, { status: 400 })
    }

    // 防止管理员修改自己的角色
    if (userId === user.id && updates.role) {
      return NextResponse.json({ error: '不能修改自己的角色' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('更新用户信息失败:', error)
      return NextResponse.json({ error: '更新用户信息失败' }, { status: 500 })
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('更新用户信息错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// DELETE - 删除用户
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAdmin(request)
    if (!user) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: '用户ID不能为空' }, { status: 400 })
    }

    // 防止管理员删除自己
    if (userId === user.id) {
      return NextResponse.json({ error: '不能删除自己的账户' }, { status: 400 })
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('删除用户失败:', error)
      return NextResponse.json({ error: '删除用户失败' }, { status: 500 })
    }

    return NextResponse.json({ message: '用户删除成功' })

  } catch (error) {
    console.error('删除用户错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}