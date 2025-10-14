const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少环境变量:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testFavorites() {
  console.log('🔍 测试收藏功能...\n')
  
  const testUserId = '550e8400-e29b-41d4-a716-446655440003'
  
  try {
    // 1. 检查收藏表数据
    console.log('1️⃣ 检查收藏表数据...')
    const { data: favorites, error: favError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', testUserId)
    
    if (favError) {
      console.error('❌ 查询收藏失败:', favError)
      return
    }
    
    console.log(`✅ 找到 ${favorites?.length || 0} 条收藏记录`)
    if (favorites && favorites.length > 0) {
      favorites.forEach((fav, index) => {
        console.log(`   ${index + 1}. 收藏ID: ${fav.id}, 模型ID: ${fav.model_id}, 时间: ${fav.created_at}`)
      })
    }
    
    // 2. 测试关联查询
    console.log('\n2️⃣ 测试关联查询...')
    const { data: favoritesWithModels, error: joinError } = await supabase
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
      .eq('user_id', testUserId)
      .not('model_id', 'is', null)
    
    if (joinError) {
      console.error('❌ 关联查询失败:', joinError)
      return
    }
    
    console.log(`✅ 关联查询成功，返回 ${favoritesWithModels?.length || 0} 条记录`)
    if (favoritesWithModels && favoritesWithModels.length > 0) {
      favoritesWithModels.forEach((fav, index) => {
        console.log(`   ${index + 1}. 收藏: ${fav.id}`)
        console.log(`      模型: ${fav.model?.title || '未知'} (ID: ${fav.model?.id || '未知'})`)
        console.log(`      作者: ${fav.model?.author?.username || '未知'}`)
        console.log(`      统计: 点赞 ${fav.model?.stats?.likes || 0}, 查看 ${fav.model?.stats?.views || 0}`)
      })
    }
    
    // 3. 测试计数查询
    console.log('\n3️⃣ 测试计数查询...')
    const { count, error: countError } = await supabase
      .from('favorites')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', testUserId)
    
    if (countError) {
      console.error('❌ 计数查询失败:', countError)
    } else {
      console.log(`✅ 计数查询成功: ${count} 条记录`)
    }
    
    // 4. 检查模型表数据
    console.log('\n4️⃣ 检查模型表数据...')
    const { data: models, error: modelError } = await supabase
      .from('face_models')
      .select('id, title, author_id')
      .limit(5)
    
    if (modelError) {
      console.error('❌ 查询模型失败:', modelError)
    } else {
      console.log(`✅ 找到 ${models?.length || 0} 个模型`)
      models?.forEach((model, index) => {
        console.log(`   ${index + 1}. ${model.title} (ID: ${model.id})`)
      })
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  }
}

testFavorites()