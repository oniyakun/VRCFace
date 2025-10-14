import { createClient } from '@supabase/supabase-js'
import { FaceModel, User, Tag, Comment, ModelStats } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库 API 函数

/**
 * 获取所有面部模型（带分页）
 */
export async function getFaceModels(page = 1, limit = 12, filters?: {
  category?: string
  tags?: string[]
  search?: string
  sortBy?: 'latest' | 'popular' | 'trending' | 'most_liked'
}) {
  try {
    let query = supabase
      .from('face_models')
      .select(`
        *,
        author:users!face_models_author_id_fkey(id, username, role),
        stats:model_stats(views, downloads, likes, comments),
        tags:model_tags(tag:tags(id, name, category))
      `)
      .eq('is_public', true)

    // 应用过滤器
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // 应用排序
    switch (filters?.sortBy) {
      case 'popular':
        query = query.order('created_at', { ascending: false }) // 暂时按创建时间排序
        break
      case 'trending':
        query = query.order('created_at', { ascending: false }) // 暂时按创建时间排序
        break
      case 'most_liked':
        query = query.order('created_at', { ascending: false }) // 暂时按创建时间排序
        break
      case 'latest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    // 应用分页
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('获取模型数据失败:', error)
      return { data: [], error: error.message, total: 0 }
    }

    return {
      data: data || [],
      error: null,
      total: count || 0,
      page,
      limit,
      hasNext: (count || 0) > page * limit,
      hasPrev: page > 1
    }
  } catch (error) {
    console.error('获取模型数据异常:', error)
    return { data: [], error: '获取数据失败', total: 0 }
  }
}

/**
 * 根据 ID 获取单个面部模型
 */
export async function getFaceModelById(id: string) {
  try {
    const { data, error } = await supabase
      .from('face_models')
      .select(`
        *,
        author:users!face_models_author_id_fkey(id, username, role),
        stats:model_stats(views, downloads, likes, comments),
        tags:model_tags(tag:tags(id, name, category)),
        comments:comments(
          id, content, created_at,
          author:users!comments_author_id_fkey(id, username)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('获取模型详情失败:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('获取模型详情异常:', error)
    return { data: null, error: '获取数据失败' }
  }
}

/**
 * 获取所有标签
 */
export async function getTags() {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name')

    if (error) {
      console.error('获取标签失败:', error)
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('获取标签异常:', error)
    return { data: [], error: '获取数据失败' }
  }
}

/**
 * 获取用户信息
 */
export async function getUserById(id: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        stats:user_stats(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('获取用户信息失败:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('获取用户信息异常:', error)
    return { data: null, error: '获取数据失败' }
  }
}

/**
 * 获取模型的评论
 */
export async function getModelComments(modelId: string) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users!comments_author_id_fkey(id, username)
      `)
      .eq('model_id', modelId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取评论失败:', error)
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('获取评论异常:', error)
    return { data: [], error: '获取数据失败' }
  }
}

/**
 * 获取模型统计信息
 */
export async function getModelStats(modelId: string) {
  try {
    const { data, error } = await supabase
      .from('model_stats')
      .select('*')
      .eq('model_id', modelId)
      .single()

    if (error) {
      console.error('获取模型统计失败:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('获取模型统计异常:', error)
    return { data: null, error: '获取数据失败' }
  }
}