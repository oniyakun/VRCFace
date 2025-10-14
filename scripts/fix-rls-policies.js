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
    // 添加用户表的查看策略
    const { error: policy1Error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Users are viewable by everyone" ON users
        FOR SELECT USING (true);
      `
    })

    if (policy1Error) {
      console.log('❌ 创建查看策略失败:', policy1Error.message)
    } else {
      console.log('✅ 用户查看策略创建成功')
    }

    // 添加用户表的更新策略
    const { error: policy2Error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Users can update own profile" ON users
        FOR UPDATE USING (auth.uid() = id);
      `
    })

    if (policy2Error) {
      console.log('❌ 创建更新策略失败:', policy2Error.message)
    } else {
      console.log('✅ 用户更新策略创建成功')
    }

    // 添加服务角色创建用户策略
    const { error: policy3Error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Service role can create users" ON users
        FOR INSERT WITH CHECK (true);
      `
    })

    if (policy3Error) {
      console.log('❌ 创建插入策略失败:', policy3Error.message)
    } else {
      console.log('✅ 服务角色插入策略创建成功')
    }

    // 为用户统计表启用 RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;`
    })

    if (rlsError && !rlsError.message.includes('already enabled')) {
      console.log('❌ 启用用户统计表 RLS 失败:', rlsError.message)
    } else {
      console.log('✅ 用户统计表 RLS 已启用')
    }

    // 添加用户统计表的查看策略
    const { error: statsPolicy1Error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "User stats are viewable by everyone" ON user_stats
        FOR SELECT USING (true);
      `
    })

    if (statsPolicy1Error) {
      console.log('❌ 创建用户统计查看策略失败:', statsPolicy1Error.message)
    } else {
      console.log('✅ 用户统计查看策略创建成功')
    }

    // 添加用户统计表的管理策略
    const { error: statsPolicy2Error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY IF NOT EXISTS "Service role can manage user stats" ON user_stats
        FOR ALL WITH CHECK (true);
      `
    })

    if (statsPolicy2Error) {
      console.log('❌ 创建用户统计管理策略失败:', statsPolicy2Error.message)
    } else {
      console.log('✅ 用户统计管理策略创建成功')
    }

    console.log('🎉 RLS 策略修复完成！')

  } catch (error) {
    console.error('❌ 修复 RLS 策略时出错:', error)
  }
}

fixRLSPolicies()