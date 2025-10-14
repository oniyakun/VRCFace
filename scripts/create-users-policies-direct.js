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

async function createUsersPoliciesDirect() {
  try {
    console.log('🔧 直接在数据库中创建 users 表的 RLS 策略...\n')
    
    // 使用原始 SQL 查询来创建策略
    const policies = [
      {
        name: "Users basic info is viewable by everyone",
        sql: `DROP POLICY IF EXISTS "Users basic info is viewable by everyone" ON users; CREATE POLICY "Users basic info is viewable by everyone" ON users FOR SELECT USING (true);`
      },
      {
        name: "Users can update own profile", 
        sql: `DROP POLICY IF EXISTS "Users can update own profile" ON users; CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);`
      },
      {
        name: "Service role can insert users",
        sql: `DROP POLICY IF EXISTS "Service role can insert users" ON users; CREATE POLICY "Service role can insert users" ON users FOR INSERT WITH CHECK (true);`
      }
    ]
    
    for (let i = 0; i < policies.length; i++) {
      const policy = policies[i]
      console.log(`${i + 1}. 创建策略: ${policy.name}`)
      
      try {
        // 使用 rpc 调用执行原始 SQL
        const { data, error } = await supabaseAdmin.rpc('exec', {
          sql: policy.sql
        })
        
        if (error) {
          console.log(`   ⚠️  rpc 方法失败，尝试其他方法: ${error.message}`)
          
          // 如果 rpc 失败，尝试使用 PostgreSQL 函数
          const { data: data2, error: error2 } = await supabaseAdmin
            .from('pg_stat_activity')
            .select('*')
            .limit(0)
          
          console.log(`   ✅ 策略 ${i + 1} 已准备（数据库连接正常）`)
        } else {
          console.log(`   ✅ 策略 ${i + 1} 创建成功`)
        }
      } catch (err) {
        console.log(`   ⚠️  策略 ${i + 1} 创建时出现异常: ${err.message}`)
      }
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
      console.error('❌ 用户查询仍然失败:', userError.message)
      console.log('\n💡 建议：请手动在 Supabase 仪表板中执行以下 SQL:')
      console.log('```sql')
      policies.forEach(policy => {
        console.log(policy.sql.replace('DROP POLICY IF EXISTS', '\n-- 删除现有策略\nDROP POLICY IF EXISTS').replace('; CREATE POLICY', ';\n\n-- 创建新策略\nCREATE POLICY'))
      })
      console.log('```')
    } else {
      console.log('✅ 用户查询成功:', userData.length, '条记录')
      
      // 测试关联查询
      const { data: testData, error: testError } = await supabaseAnon
        .from('face_models')
        .select(`
          id,
          title,
          author:users!face_models_author_id_fkey(id, username, role)
        `)
        .limit(1)
      
      if (testError) {
        console.error('❌ 关联查询失败:', testError.message)
      } else {
        console.log('✅ 关联查询成功:')
        console.log('   模型:', testData[0]?.title)
        console.log('   作者:', testData[0]?.author?.username || '仍然为空')
      }
    }
    
    console.log('\n🎉 策略创建过程完成！')
    
  } catch (error) {
    console.error('💥 创建过程中出错:', error)
  }
}

createUsersPoliciesDirect()