'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import UserProfile from '@/components/profile/UserProfile'

export default function ProfilePage() {
  const params = useParams()
  const userId = params.id as string

  // 获取当前登录用户的ID（如果有的话）
  const currentUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
  const currentUserData = currentUserStr ? JSON.parse(currentUserStr) : null
  const currentUserId = currentUserData?.id
  const isOwnProfile = currentUserId === userId

  // 调试信息
  console.log('Profile page - userId from params:', userId)
  console.log('Profile page - currentUserData:', currentUserData)
  console.log('Profile page - currentUserEmail:', currentUserData?.email)
  console.log('Profile page - isOwnProfile:', isOwnProfile)

  return (
    <div className="min-h-screen bg-gray-50">
      <UserProfile userId={userId} isOwnProfile={isOwnProfile} />
    </div>
  )
}