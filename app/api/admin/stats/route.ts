import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 验证管理员权限
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  
  try {
    // 使用管理员客户端验证token
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    // 检查用户角色
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || userData?.role !== 'admin') {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}

// GET - 获取管理员统计数据
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdmin(request)
    if (!user) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    // 获取用户统计
    const { data: userStats, error: userError } = await supabase
      .from('users')
      .select('role')

    if (userError) {
      console.error('获取用户统计失败:', userError)
      return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 })
    }

    // 统计各角色用户数量
    const userCounts = userStats.reduce((acc: any, user: any) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {})

    // 获取模型统计
    const { count: totalModels, error: modelError } = await supabase
      .from('face_models')
      .select('*', { count: 'exact', head: true })

    if (modelError) {
      console.error('获取模型统计失败:', modelError)
      return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 })
    }

    // 获取公开模型数量
    const { count: publicModels, error: publicError } = await supabase
      .from('face_models')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true)

    if (publicError) {
      console.error('获取公开模型统计失败:', publicError)
    }

    // 获取标签统计
    const { count: totalTags, error: tagError } = await supabase
      .from('tags')
      .select('*', { count: 'exact', head: true })

    if (tagError) {
      console.error('获取标签统计失败:', tagError)
    }

    // 获取最近7天的新用户数量
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: newUsers, error: newUserError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())

    if (newUserError) {
      console.error('获取新用户统计失败:', newUserError)
    }

    // 获取最近7天的新模型数量
    const { count: newModels, error: newModelError } = await supabase
      .from('face_models')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())

    if (newModelError) {
      console.error('获取新模型统计失败:', newModelError)
    }

    // 获取最活跃的用户（按模型数量）
    const { data: activeUsers, error: activeError } = await supabase
      .from('users')
      .select(`
        id,
        username,
        display_name,
        avatar
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (activeError) {
      // 获取活跃用户失败，使用空数组
    }

    // 为活跃用户添加统计信息
    let usersWithStats = []
    if (activeUsers) {
      for (const user of activeUsers) {
        // 获取用户的模型数量
        const { count: modelsCount } = await supabase
          .from('face_models')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', user.id)

        // 获取用户收到的点赞数
        const { data: likesData } = await supabase
          .from('face_models')
          .select('likes_count')
          .eq('author_id', user.id)

        const likesReceived = likesData?.reduce((sum, model) => sum + (model.likes_count || 0), 0) || 0

        usersWithStats.push({
          ...user,
          user_stats: {
            models_count: modelsCount || 0,
            likes_received: likesReceived,
            followers_count: 0 // 暂时设为0，后续可以添加关注功能
          }
        })
      }

      // 按模型数量排序
      usersWithStats.sort((a, b) => b.user_stats.models_count - a.user_stats.models_count)
      usersWithStats = usersWithStats.slice(0, 5)
    }

    // 获取最受欢迎的模型
    const { data: popularModels, error: popularError } = await supabase
      .from('face_models')
      .select(`
        id,
        title,
        likes_count,
        comments_count,
        created_at,
        author_id
      `)
      .eq('is_public', true)
      .order('likes_count', { ascending: false })
      .limit(5)

    // 为每个模型获取作者信息
    let modelsWithAuthors = []
    if (popularModels && !popularError) {
      for (const model of popularModels) {
        const { data: authorData } = await supabase
          .from('users')
          .select('username, display_name')
          .eq('id', model.author_id)
          .single()

        modelsWithAuthors.push({
          ...model,
          author: authorData || { username: 'Unknown', display_name: 'Unknown' }
        })
      }
    }

    if (popularError) {
      // 获取热门模型失败，使用空数组
    }

    return NextResponse.json({
      data: {
        overview: {
          totalUsers: userStats.length,
          totalModels: totalModels || 0,
          publicModels: publicModels || 0,
          totalTags: totalTags || 0,
          newUsersThisWeek: newUsers || 0,
          newModelsThisWeek: newModels || 0
        },
        usersByRole: {
          admin: userCounts.admin || 0,
          moderator: userCounts.moderator || 0,
          user: userCounts.user || 0
        },
        activeUsers: usersWithStats || [],
        popularModels: modelsWithAuthors || []
      }
    })

  } catch (error) {
    console.error('获取统计数据错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}