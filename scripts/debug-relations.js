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

async function debugRelations() {
  try {
    console.log('🔍 调试数据关联问题...')
    
    // 1. 检查 face_models 表的原始数据
    console.log('\n1. 检查 face_models 表原始数据:')
    const { data: rawModels, error: rawError } = await supabaseAdmin
      .from('face_models')
      .select('*')
      .limit(3)
    
    if (rawError) {
      console.error('❌ 查询失败:', rawError)
      return
    }
    
    rawModels.forEach(model => {
      console.log(`   模型: ${model.title}`)
      console.log(`   作者ID: ${model.author_id}`)
      console.log(`   创建时间: ${model.created_at}`)
      console.log('')
    })
    
    // 2. 检查 users 表数据
    console.log('2. 检查 users 表数据:')
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, username, email')
    
    if (usersError) {
      console.error('❌ 查询用户失败:', usersError)
    } else {
      users.forEach(user => {
        console.log(`   用户: ${user.username} (${user.id})`)
      })
    }
    
    // 3. 检查 model_tags 关联表
    console.log('\n3. 检查 model_tags 关联表:')
    const { data: modelTags, error: modelTagsError } = await supabaseAdmin
      .from('model_tags')
      .select('*')
    
    if (modelTagsError) {
      console.error('❌ 查询 model_tags 失败:', modelTagsError)
    } else {
      console.log(`   model_tags 记录数: ${modelTags.length}`)
      modelTags.forEach(mt => {
        console.log(`   模型 ${mt.model_id} -> 标签 ${mt.tag_id}`)
      })
    }
    
    // 4. 检查 tags 表
    console.log('\n4. 检查 tags 表:')
    const { data: tags, error: tagsError } = await supabaseAdmin
      .from('tags')
      .select('id, name')
      .limit(5)
    
    if (tagsError) {
      console.error('❌ 查询标签失败:', tagsError)
    } else {
      tags.forEach(tag => {
        console.log(`   标签: ${tag.name} (${tag.id})`)
      })
    }
    
    // 5. 测试不同的关联查询方式
    console.log('\n5. 测试关联查询:')
    
    // 方式1: 使用外键名称
    console.log('   方式1 - 使用外键名称:')
    const { data: test1, error: error1 } = await supabaseAdmin
      .from('face_models')
      .select(`
        id,
        title,
        author_id,
        users!face_models_author_id_fkey(id, username, role)
      `)
      .limit(1)
    
    if (error1) {
      console.error('   ❌ 方式1失败:', error1)
    } else {
      console.log('   ✅ 方式1成功:', test1[0])
    }
    
    // 方式2: 使用简单关联
    console.log('\n   方式2 - 使用简单关联:')
    const { data: test2, error: error2 } = await supabaseAdmin
      .from('face_models')
      .select(`
        id,
        title,
        author_id,
        users(id, username, role)
      `)
      .limit(1)
    
    if (error2) {
      console.error('   ❌ 方式2失败:', error2)
    } else {
      console.log('   ✅ 方式2成功:', test2[0])
    }
    
    // 方式3: 手动 JOIN
    console.log('\n   方式3 - 检查数据是否匹配:')
    if (rawModels.length > 0) {
      const modelId = rawModels[0].id
      const authorId = rawModels[0].author_id
      
      const { data: author, error: authorError } = await supabaseAdmin
        .from('users')
        .select('id, username, role')
        .eq('id', authorId)
        .single()
      
      if (authorError) {
        console.error('   ❌ 查询作者失败:', authorError)
      } else {
        console.log('   ✅ 找到作者:', author)
      }
    }
    
    // 6. 检查 RLS 策略
    console.log('\n6. 检查是否是 RLS 问题:')
    
    // 使用匿名客户端测试
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    const { data: anonTest, error: anonError } = await supabaseAnon
      .from('face_models')
      .select(`
        id,
        title,
        users!face_models_author_id_fkey(id, username, role)
      `)
      .limit(1)
    
    if (anonError) {
      console.error('   ❌ 匿名客户端查询失败:', anonError)
    } else {
      console.log('   ✅ 匿名客户端查询成功:', anonTest[0])
    }
    
  } catch (error) {
    console.error('💥 调试过程中出错:', error)
  }
}

debugRelations()