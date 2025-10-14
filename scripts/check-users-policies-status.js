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

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkUsersPoliciesStatus() {
  try {
    console.log('🔍 检查 users 表的 RLS 策略状态...\n')
    
    // 1. 检查 RLS 是否启用
    console.log('1. 检查 RLS 是否启用:')
    const { data: rlsData, error: rlsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        SELECT 
          schemaname, 
          tablename, 
          rowsecurity 
        FROM pg_tables 
        WHERE tablename = 'users';
      `
    })
    
    if (rlsError) {
      console.error('   ❌ 检查 RLS 状态失败:', rlsError)
    } else {
      console.log('   ✅ RLS 状态查询成功')
    }
    
    // 2. 检查现有策略
    console.log('\n2. 检查现有策略:')
    const { data: policiesData, error: policiesError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        SELECT 
          policyname,
          cmd,
          qual,
          with_check
        FROM pg_policies 
        WHERE tablename = 'users';
      `
    })
    
    if (policiesError) {
      console.error('   ❌ 检查策略失败:', policiesError)
    } else {
      console.log('   ✅ 策略查询成功')
    }
    
    // 3. 测试匿名用户查询
    console.log('\n3. 测试匿名用户查询:')
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('users')
      .select('id, username, display_name, avatar, role')
      .limit(3)
    
    if (anonError) {
      console.error('   ❌ 匿名查询失败:', anonError.message)
    } else {
      console.log('   ✅ 匿名查询成功，返回', anonData.length, '条记录')
      anonData.forEach(user => {
        console.log(`      - ${user.username} (${user.display_name || '无显示名'})`)
      })
    }
    
    // 4. 测试关联查询
    console.log('\n4. 测试关联查询:')
    const { data: joinData, error: joinError } = await supabaseAnon
      .from('face_models')
      .select(`
        id,
        title,
        author:users!face_models_author_id_fkey(
          id,
          username,
          display_name,
          avatar,
          role
        )
      `)
      .limit(3)
    
    if (joinError) {
      console.error('   ❌ 关联查询失败:', joinError.message)
    } else {
      console.log('   ✅ 关联查询成功，返回', joinData.length, '条记录')
      joinData.forEach(model => {
        console.log(`      - 模型: ${model.title}`)
        console.log(`        作者: ${model.author?.username || '无'} (${model.author?.display_name || '无显示名'})`)
      })
    }
    
    console.log('\n🎉 检查完成！')
    
  } catch (error) {
    console.error('💥 检查过程中出错:', error)
  }
}

checkUsersPoliciesStatus()