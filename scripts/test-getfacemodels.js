const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// 使用与前端相同的配置
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// 复制 lib/supabase.ts 中的 getFaceModels 函数
async function getFaceModels(page = 1, limit = 12, filters = {}) {
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

// 复制 getTags 函数
async function getTags() {
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

async function testGetFaceModels() {
  try {
    console.log('🧪 测试 getFaceModels 函数...')
    
    // 测试基本调用
    console.log('\n1. 测试基本调用（无参数）:')
    const result1 = await getFaceModels()
    console.log('   结果:', {
      dataLength: result1.data.length,
      error: result1.error,
      total: result1.total,
      page: result1.page,
      limit: result1.limit
    })
    
    if (result1.data.length > 0) {
      console.log('   第一个模型:', {
        id: result1.data[0].id,
        title: result1.data[0].title,
        author: result1.data[0].author?.username,
        tags: result1.data[0].tags?.map(t => t.tag?.name)
      })
    }
    
    // 测试分页
    console.log('\n2. 测试分页（第1页，每页2条）:')
    const result2 = await getFaceModels(1, 2)
    console.log('   结果:', {
      dataLength: result2.data.length,
      error: result2.error,
      total: result2.total,
      hasNext: result2.hasNext,
      hasPrev: result2.hasPrev
    })
    
    // 测试搜索
    console.log('\n3. 测试搜索（关键词: "表情"）:')
    const result3 = await getFaceModels(1, 12, { search: '表情' })
    console.log('   结果:', {
      dataLength: result3.data.length,
      error: result3.error,
      total: result3.total
    })
    
    // 测试标签获取
    console.log('\n4. 测试 getTags 函数:')
    const tagsResult = await getTags()
    console.log('   结果:', {
      dataLength: tagsResult.data.length,
      error: tagsResult.error
    })
    
    if (tagsResult.data.length > 0) {
      console.log('   前3个标签:', tagsResult.data.slice(0, 3).map(tag => ({
        id: tag.id,
        name: tag.name,
        category: tag.category
      })))
    }
    
    console.log('\n✅ getFaceModels 函数测试完成！')
    
  } catch (error) {
    console.error('💥 测试过程中出错:', error)
  }
}

testGetFaceModels()