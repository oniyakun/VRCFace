import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json({ 
        authenticated: false, 
        error: 'No token provided' 
      }, { status: 401 })
    }

    // 使用 Supabase 验证 token
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return NextResponse.json({ 
        authenticated: false, 
        error: 'Invalid token' 
      }, { status: 401 })
    }

    // 获取用户角色
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('获取用户角色失败:', userError)
      return NextResponse.json({ 
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          role: 'user' // 默认角色
        }
      })
    }

    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: userData?.role || 'user'
      }
    })

  } catch (error) {
    console.error('认证验证错误:', error)
    return NextResponse.json({ 
      authenticated: false, 
      error: 'Server error' 
    }, { status: 500 })
  }
}