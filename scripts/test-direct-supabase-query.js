const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

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

async function testDirectSupabaseQuery() {
  try {
    console.log('🔍 测试直接 Supabase 查询...\n')
    
    // 1. 测试匿名客户端查询用户表
    console.log('1. 测试匿名客户端查询用户表:')
    const { data: usersData, error: usersError } = await supabaseAnon
      .from('users')
      .select('id, username, role')
      .limit(3)
    
    if (usersError) {
      console.error('❌ 用户查询失败:', usersError)
    } else {
      console.log('✅ 用户查询成功:', usersData.length, '条记录')
      usersData.forEach(user => {
        console.log(`   - ${user.username} (${user.role})`)
      })
    }
    
    // 2. 测试管理员客户端查询用户表
    console.log('\n2. 测试管理员客户端查询用户表:')
    const { data: adminUsersData, error: adminUsersError } = await supabaseAdmin
      .from('users')
      .select('id, username, role')
      .limit(3)
    
    if (adminUsersError) {
      console.error('❌ 管理员用户查询失败:', adminUsersError)
    } else {
      console.log('✅ 管理员用户查询成功:', adminUsersData.length, '条记录')
      adminUsersData.forEach(user => {
        console.log(`   - ${user.username} (${user.role})`)
      })
    }
    
    // 3. 测试匿名客户端的关联查询（原始方式）
    console.log('\n3. 测试匿名客户端的关联查询（原始方式）:')
    const { data: modelsData1, error: modelsError1 } = await supabaseAnon
      .from('face_models')
      .select(`
        id,
        title,
        author_id,
        users!face_models_author_id_fkey(id, username, role)
      `)
      .limit(2)
    
    if (modelsError1) {
      console.error('❌ 关联查询失败:', modelsError1)
    } else {
      console.log('✅ 关联查询成功:', modelsData1.length, '条记录')
      modelsData1.forEach(model => {
        console.log(`   - ${model.title}`)
        console.log(`     作者ID: ${model.author_id}`)
        console.log(`     作者信息: ${model.users ? model.users.username : '无'}`)
      })
    }
    
    // 4. 测试匿名客户端的关联查询（别名方式）
    console.log('\n4. 测试匿名客户端的关联查询（别名方式）:')
    const { data: modelsData2, error: modelsError2 } = await supabaseAnon
      .from('face_models')
      .select(`
        id,
        title,
        author_id,
        author:users!face_models_author_id_fkey(id, username, role)
      `)
      .limit(2)
    
    if (modelsError2) {
      console.error('❌ 别名关联查询失败:', modelsError2)
    } else {
      console.log('✅ 别名关联查询成功:', modelsData2.length, '条记录')
      modelsData2.forEach(model => {
        console.log(`   - ${model.title}`)
        console.log(`     作者ID: ${model.author_id}`)
        console.log(`     作者信息: ${model.author ? model.author.username : '无'}`)
      })
    }
    
    // 5. 测试管理员客户端的关联查询
    console.log('\n5. 测试管理员客户端的关联查询:')
    const { data: adminModelsData, error: adminModelsError } = await supabaseAdmin
      .from('face_models')
      .select(`
        id,
        title,
        author_id,
        author:users!face_models_author_id_fkey(id, username, role)
      `)
      .limit(2)
    
    if (adminModelsError) {
      console.error('❌ 管理员关联查询失败:', adminModelsError)
    } else {
      console.log('✅ 管理员关联查询成功:', adminModelsData.length, '条记录')
      adminModelsData.forEach(model => {
        console.log(`   - ${model.title}`)
        console.log(`     作者ID: ${model.author_id}`)
        console.log(`     作者信息: ${model.author ? model.author.username : '无'}`)
      })
    }
    
    console.log('\n🎉 测试完成！')
    
  } catch (error) {
    console.error('💥 测试过程中出错:', error)
  }
}

testDirectSupabaseQuery()