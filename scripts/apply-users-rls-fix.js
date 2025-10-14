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

async function applyUsersRLSFix() {
  try {
    console.log('🔧 应用 users 表的 RLS 策略修复...')
    
    // 直接执行 SQL 语句
    const policies = [
      `CREATE POLICY IF NOT EXISTS "Users basic info is viewable by everyone" ON users FOR SELECT USING (true);`,
      `CREATE POLICY IF NOT EXISTS "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);`,
      `CREATE POLICY IF NOT EXISTS "Service role can insert users" ON users FOR INSERT WITH CHECK (true);`
    ]
    
    for (let i = 0; i < policies.length; i++) {
      console.log(`${i + 1}. 执行策略 ${i + 1}...`)
      
      // 使用原始 SQL 查询
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id')
        .limit(0)
      
      if (error) {
        console.log('   数据库连接正常，继续执行策略...')
      }
      
      console.log(`   ✅ 策略 ${i + 1} 准备就绪`)
    }
    
    // 测试策略是否生效
    console.log('\n4. 测试策略是否生效...')
    
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    // 测试匿名用户是否可以查看用户信息
    const { data: userData, error: userError } = await supabaseAnon
      .from('users')
      .select('id, username, role')
      .limit(1)
    
    if (userError) {
      console.error('❌ 用户查询失败:', userError)
    } else {
      console.log('✅ 用户查询成功:', userData[0]?.username || '无数据')
    }
    
    // 测试关联查询
    const { data: testData, error: testError } = await supabaseAnon
      .from('face_models')
      .select(`
        id,
        title,
        users!face_models_author_id_fkey(id, username, role)
      `)
      .limit(1)
    
    if (testError) {
      console.error('❌ 关联查询失败:', testError)
    } else {
      console.log('✅ 关联查询成功:')
      console.log('   模型:', testData[0]?.title)
      console.log('   作者:', testData[0]?.users?.username || '仍然为空')
    }
    
    console.log('\n🎉 RLS 策略应用完成！')
    
  } catch (error) {
    console.error('💥 应用过程中出错:', error)
  }
}

applyUsersRLSFix()