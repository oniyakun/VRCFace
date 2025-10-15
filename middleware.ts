import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('🔍 Middleware: 检查admin路由访问:', request.nextUrl.pathname)

  // 只对 admin 路由进行鉴权
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // 从 localStorage 获取 token（通过自定义 header 传递）
  const authToken = request.headers.get('x-auth-token') || 
                   request.cookies.get('auth-token')?.value

  console.log('🔍 Middleware: 检查认证token:', {
    hasToken: !!authToken,
    tokenLength: authToken?.length || 0,
    source: request.headers.get('x-auth-token') ? 'header' : 'cookie'
  })

  if (!authToken) {
    console.log('❌ Middleware: 没有认证token，重定向到登录页')
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  try {
    // 调用认证验证 API
    const verifyResponse = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: authToken })
    })

    const verifyResult = await verifyResponse.json()

    console.log('👤 Middleware: 用户认证结果:', {
      authenticated: verifyResult.authenticated,
      userId: verifyResult.user?.id,
      userEmail: verifyResult.user?.email,
      userRole: verifyResult.user?.role
    })

    if (!verifyResult.authenticated) {
      console.log('❌ Middleware: 用户未认证，重定向到登录页')
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    // 检查管理员权限
    if (verifyResult.user?.role !== 'admin') {
      console.log('❌ Middleware: 用户无管理员权限，重定向到403页面')
      return NextResponse.redirect(new URL('/403', request.url))
    }

    console.log('✅ Middleware: 管理员权限验证通过')
    return NextResponse.next()

  } catch (error) {
    console.error('❌ Middleware: 认证验证失败:', error)
    return NextResponse.redirect(new URL('/auth', request.url))
  }
}

export const config = {
  matcher: ['/admin/:path*']
}