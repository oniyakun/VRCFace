import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ApiResponse } from '@/types'

// 创建Supabase管理员客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 创建普通Supabase客户端用于认证
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 获取标签列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const sortBy = searchParams.get('sortBy') || 'usage_count' // usage_count, name, created_at

    // 构建查询
    let query = supabaseAdmin
      .from('tags')
      .select('*')

    // 分类筛选
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // 搜索筛选
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    // 排序
    switch (sortBy) {
      case 'name':
        query = query.order('name', { ascending: true })
        break
      case 'created_at':
        query = query.order('created_at', { ascending: false })
        break
      default: // usage_count
        query = query.order('usage_count', { ascending: false })
    }

    // 限制数量
    query = query.limit(limit)

    const { data: tags, error } = await query

    if (error) {
      console.error('Tags fetch error:', error)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '获取标签列表失败'
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: {
        tags: tags || []
      }
    })

  } catch (error) {
    console.error('Tags fetch error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 })
  }
}

// 创建新标签
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '认证失败'
      }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, category, color, tag_type } = body

    // 验证必填字段
    if (!name || !name.trim()) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '标签名称不能为空'
      }, { status: 400 })
    }

    // 验证标签名称长度
    if (name.trim().length > 20) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '标签名称不能超过20个字符'
      }, { status: 400 })
    }

    // 验证分类
    const validCategories = ['emotion', 'style', 'character', 'technical']
    const tagCategory = category || 'style'
    if (!validCategories.includes(tagCategory)) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '无效的标签分类'
      }, { status: 400 })
    }

    // 验证标签类型
    const validTagTypes = ['model_name', 'model_style']
    const tagType = tag_type || 'model_style'
    if (!validTagTypes.includes(tagType)) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '无效的标签类型'
      }, { status: 400 })
    }

    // 验证颜色格式（如果提供）
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '颜色格式不正确，请使用十六进制格式（如 #FF0000）'
      }, { status: 400 })
    }

    // 检查标签是否已存在
    const { data: existingTag, error: checkError } = await supabaseAdmin
      .from('tags')
      .select('id, name')
      .ilike('name', name.trim())
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Tag check error:', checkError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '检查标签是否存在时出错'
      }, { status: 500 })
    }

    if (existingTag) {
      return NextResponse.json<ApiResponse<any>>({
        success: false,
        message: '标签已存在',
        data: {
          tag: existingTag
        }
      }, { status: 409 })
    }

    // 生成默认颜色（如果未提供）
    const defaultColors = {
      emotion: '#FF69B4',
      style: '#4169E1',
      character: '#8B4513',
      technical: '#9370DB'
    }

    const tagColor = color || defaultColors[tagCategory as keyof typeof defaultColors]

    // 创建新标签
    const { data: newTag, error: createError } = await supabaseAdmin
      .from('tags')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        category: tagCategory,
        color: tagColor,
        tag_type: tagType,
        usage_count: 0
      })
      .select()
      .single()

    if (createError) {
      console.error('Tag creation error:', createError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '创建标签失败'
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      message: '标签创建成功',
      data: {
        tag: newTag
      }
    })

  } catch (error) {
    console.error('Tag creation error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 })
  }
}

// 更新标签
export async function PUT(request: NextRequest) {
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '认证失败'
      }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, description, category, color } = body

    // 验证必填字段
    if (!id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '标签ID不能为空'
      }, { status: 400 })
    }

    // 检查标签是否存在
    const { data: existingTag, error: checkError } = await supabaseAdmin
      .from('tags')
      .select('*')
      .eq('id', id)
      .single()

    if (checkError || !existingTag) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '标签不存在'
      }, { status: 404 })
    }

    // 构建更新数据
    const updateData: any = {}

    if (name && name.trim()) {
      if (name.trim().length > 20) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          message: '标签名称不能超过20个字符'
        }, { status: 400 })
      }
      updateData.name = name.trim()
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null
    }

    if (category) {
      const validCategories = ['emotion', 'style', 'character', 'technical']
      if (!validCategories.includes(category)) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          message: '无效的标签分类'
        }, { status: 400 })
      }
      updateData.category = category
    }

    if (color) {
      if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          message: '颜色格式不正确，请使用十六进制格式（如 #FF0000）'
        }, { status: 400 })
      }
      updateData.color = color
    }

    // 如果没有要更新的字段
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '没有要更新的字段'
      }, { status: 400 })
    }

    // 更新标签
    const { data: updatedTag, error: updateError } = await supabaseAdmin
      .from('tags')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Tag update error:', updateError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '更新标签失败'
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      message: '标签更新成功',
      data: {
        tag: updatedTag
      }
    })

  } catch (error) {
    console.error('Tag update error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 })
  }
}

// 删除标签
export async function DELETE(request: NextRequest) {
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '认证失败'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '标签ID不能为空'
      }, { status: 400 })
    }

    // 检查标签是否存在
    const { data: existingTag, error: checkError } = await supabaseAdmin
      .from('tags')
      .select('*')
      .eq('id', id)
      .single()

    if (checkError || !existingTag) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '标签不存在'
      }, { status: 404 })
    }

    // 检查标签是否被使用
    const { data: tagUsage, error: usageError } = await supabaseAdmin
      .from('model_tags')
      .select('model_id')
      .eq('tag_id', id)
      .limit(1)

    if (usageError) {
      console.error('Tag usage check error:', usageError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '检查标签使用情况时出错'
      }, { status: 500 })
    }

    if (tagUsage && tagUsage.length > 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '标签正在被使用，无法删除'
      }, { status: 409 })
    }

    // 删除标签
    const { error: deleteError } = await supabaseAdmin
      .from('tags')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Tag deletion error:', deleteError)
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: '删除标签失败'
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: '标签删除成功'
    })

  } catch (error) {
    console.error('Tag deletion error:', error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: '服务器内部错误'
    }, { status: 500 })
  }
}