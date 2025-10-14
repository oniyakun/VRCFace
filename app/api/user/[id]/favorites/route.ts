import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// GET - 获取用户的收藏模型列表
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID不能为空' },
        { status: 400 }
      )
    }

    // 计算分页偏移量
    const from = (page - 1) * limit
    const to = from + limit - 1

    // 构建查询 - 固定按收藏时间倒序排列
    let query = supabaseAdmin
      .from('favorites')
      .select(`
        id,
        created_at,
        model:face_models!favorites_model_id_fkey(
          id,
          title,
          description,
          thumbnail,
          category,
          created_at,
          author:users!face_models_author_id_fkey(
            id,
            username,
            display_name,
            avatar
          ),
          stats:model_stats(
            views,
            downloads,
            likes,
            comments
          ),
          tags:model_tags(
            tag:tags(
              id,
              name,
              category
            )
          )
        )
      `)
      .eq('user_id', userId)
      .not('model_id', 'is', null) // 确保模型存在
      .order('created_at', { ascending: false }) // 固定按收藏时间倒序

    // 应用分页
    query = query.range(from, to)

    const { data: favorites, error } = await query

    if (error) {
      console.error('获取用户收藏失败:', error)
      return NextResponse.json(
        { error: '获取收藏列表失败' },
        { status: 500 }
      )
    }

    // 获取总数（用于分页）- 使用简单查询避免关联查询的复杂性
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    let finalCount = totalCount || 0
    if (countError) {
      console.error('获取收藏总数失败:', countError)
      // 如果计数失败，使用 favorites 数组的长度作为备选
      finalCount = favorites?.length || 0
      console.log('使用备选计数:', finalCount)
    }

    // 格式化数据
    const formattedFavorites = favorites?.map(favorite => {
      const model = favorite.model as any
      return {
        id: model.id,
        title: model.title,
        description: model.description,
        thumbnail: model.thumbnail,
        category: model.category,
        created_at: model.created_at,
        favorited_at: favorite.created_at,
        author: {
          id: model.author?.[0]?.id || model.author?.id,
          username: model.author?.[0]?.username || model.author?.username,
          displayName: model.author?.[0]?.display_name || model.author?.display_name,
          avatar: model.author?.[0]?.avatar || model.author?.avatar
        },
        stats: {
          views: model.stats?.[0]?.views || model.stats?.views || 0,
          downloads: model.stats?.[0]?.downloads || model.stats?.downloads || 0,
          likes: model.stats?.[0]?.likes || model.stats?.likes || 0,
          comments: model.stats?.[0]?.comments || model.stats?.comments || 0
        },
        tags: model.tags?.map((tagRelation: any) => tagRelation.tag || tagRelation) || []
      }
    }) || []

    return NextResponse.json({
      success: true,
      data: formattedFavorites,
      pagination: {
        page,
        limit,
        total: finalCount,
        totalPages: Math.ceil(finalCount / limit),
        hasNext: (page * limit) < finalCount,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('获取用户收藏异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}