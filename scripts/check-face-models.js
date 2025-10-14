const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function checkFaceModels() {
  try {
    console.log('🔍 检查 face_models 表数据...')
    
    // 检查表是否存在并获取总数
    const { count, error: countError } = await supabaseAdmin
      .from('face_models')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ 查询 face_models 表失败:', countError)
      return
    }
    
    console.log(`📊 face_models 表总记录数: ${count}`)
    
    if (count === 0) {
      console.log('⚠️  face_models 表为空，需要添加测试数据')
      return
    }
    
    // 获取前几条记录查看数据结构
    const { data: models, error: modelsError } = await supabaseAdmin
      .from('face_models')
      .select(`
        id,
        title,
        description,
        category,
        is_public,
        is_verified,
        created_at,
        author:users!face_models_author_id_fkey(id, username, role),
        stats:model_stats(views, downloads, likes, comments),
        tags:model_tags(tag:tags(id, name, category))
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (modelsError) {
      console.error('❌ 查询模型详情失败:', modelsError)
      return
    }
    
    console.log('📋 最新的 5 条公开模型:')
    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.title}`)
      console.log(`   作者: ${model.author?.username || '未知'}`)
      console.log(`   分类: ${model.category}`)
      console.log(`   验证状态: ${model.is_verified ? '已验证' : '未验证'}`)
      console.log(`   统计: 查看 ${model.stats?.views || 0}, 下载 ${model.stats?.downloads || 0}, 点赞 ${model.stats?.likes || 0}`)
      console.log(`   标签: ${model.tags?.map(t => t.tag.name).join(', ') || '无'}`)
      console.log(`   创建时间: ${model.created_at}`)
      console.log('')
    })
    
    // 检查用户表
    const { count: userCount, error: userCountError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    if (userCountError) {
      console.error('❌ 查询 users 表失败:', userCountError)
    } else {
      console.log(`👥 users 表总记录数: ${userCount}`)
    }
    
    // 检查标签表
    const { count: tagCount, error: tagCountError } = await supabaseAdmin
      .from('tags')
      .select('*', { count: 'exact', head: true })
    
    if (tagCountError) {
      console.error('❌ 查询 tags 表失败:', tagCountError)
    } else {
      console.log(`🏷️  tags 表总记录数: ${tagCount}`)
    }
    
  } catch (error) {
    console.error('💥 检查过程中出错:', error)
  }
}

checkFaceModels()