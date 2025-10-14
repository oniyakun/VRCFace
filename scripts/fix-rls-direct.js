const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function fixRLSPolicies() {
  console.log('🔧 修复用户表 RLS 策略...')

  try {
    // 直接执行 SQL 语句
    const policies = [
      {
        name: '用户查看策略',
        sql: `CREATE POLICY IF NOT EXISTS "Users are viewable by everyone" ON users FOR SELECT USING (true);`
      },
      {
        name: '用户更新策略',
        sql: `CREATE POLICY IF NOT EXISTS "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);`
      },
      {
        name: '服务角色插入策略',
        sql: `CREATE POLICY IF NOT EXISTS "Service role can create users" ON users FOR INSERT WITH CHECK (true);`
      },
      {
        name: '启用用户统计表 RLS',
        sql: `ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;`
      },
      {
        name: '用户统计查看策略',
        sql: `CREATE POLICY IF NOT EXISTS "User stats are viewable by everyone" ON user_stats FOR SELECT USING (true);`
      },
      {
        name: '用户统计管理策略',
        sql: `CREATE POLICY IF NOT EXISTS "Service role can manage user stats" ON user_stats FOR ALL WITH CHECK (true);`
      }
    ]

    for (const policy of policies) {
      try {
        const { error } = await supabase
          .from('_dummy_table_that_does_not_exist')
          .select('*')
          .limit(0)

        // 使用原始查询
        const { error: sqlError } = await supabase.rpc('exec', { sql: policy.sql })
        
        if (sqlError) {
          console.log(`❌ ${policy.name}失败:`, sqlError.message)
        } else {
          console.log(`✅ ${policy.name}成功`)
        }
      } catch (err) {
        console.log(`❌ ${policy.name}失败:`, err.message)
      }
    }

    console.log('🎉 RLS 策略修复完成！')

  } catch (error) {
    console.error('❌ 修复 RLS 策略时出错:', error)
  }
}

fixRLSPolicies()