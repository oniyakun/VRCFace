'use client'

import { useParams } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import UserProfile from '@/components/profile/UserProfile'

export default function ProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const { user: currentUser } = useAuth()

  // 判断是否为自己的主页
  const isOwnProfile = currentUser?.id === userId

  // 调试信息
  console.log('Profile page - userId from params:', userId)
  console.log('Profile page - currentUser:', currentUser)
  console.log('Profile page - currentUser ID:', currentUser?.id)
  console.log('Profile page - isOwnProfile:', isOwnProfile)

  return (
    <div className="min-h-screen bg-gray-50">
      <UserProfile userId={userId} isOwnProfile={isOwnProfile} />
    </div>
  )
}