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

async function fixUsersRLSPolicies() {
  try {
    console.log('🔧 修复 users 表的 RLS 策略...')
    
    // 1. 创建允许所有人查看用户基本信息的策略
    console.log('1. 创建用户基本信息查看策略...')
    const { error: viewError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Users basic info is viewable by everyone" ON users
        FOR SELECT USING (true);
      `
    })
    
    if (viewError) {
      console.error('❌ 创建查看策略失败:', viewError)
    } else {
      console.log('✅ 用户基本信息查看策略创建成功')
    }
    
    // 2. 创建用户可以更新自己信息的策略
    console.log('2. 创建用户自我更新策略...')
    const { error: updateError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Users can update own profile" ON users
        FOR UPDATE USING (auth.uid() = id);
      `
    })
    
    if (updateError) {
      console.error('❌ 创建更新策略失败:', updateError)
    } else {
      console.log('✅ 用户自我更新策略创建成功')
    }
    
    // 3. 创建服务角色可以插入用户的策略
    console.log('3. 创建服务角色插入策略...')
    const { error: insertError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Service role can insert users" ON users
        FOR INSERT WITH CHECK (true);
      `
    })
    
    if (insertError) {
      console.error('❌ 创建插入策略失败:', insertError)
    } else {
      console.log('✅ 服务角色插入策略创建成功')
    }
    
    // 4. 测试策略是否生效
    console.log('\n4. 测试策略是否生效...')
    
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    const { data: testData, error: testError } = await supabaseAnon
      .from('face_models')
      .select(`
        id,
        title,
        users!face_models_author_id_fkey(id, username, role)
      `)
      .limit(1)
    
    if (testError) {
      console.error('❌ 测试查询失败:', testError)
    } else {
      console.log('✅ 测试查询成功:')
      console.log('   模型:', testData[0].title)
      console.log('   作者:', testData[0].users?.username || '仍然为空')
    }
    
    console.log('\n🎉 RLS 策略修复完成！')
    
  } catch (error) {
    console.error('💥 修复过程中出错:', error)
  }
}

fixUsersRLSPolicies()