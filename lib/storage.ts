import { createClient } from '@supabase/supabase-js'

// 创建Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 创建管理员客户端用于存储操作（绕过RLS）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// 存储桶名称
const BUCKET_NAME = 'model-images'

/**
 * 上传图片到Supabase Storage
 * @param file 图片文件
 * @param path 存储路径
 * @returns 上传结果
 */
export async function uploadImage(
  file: File,
  path: string
): Promise<{
  success: boolean
  url?: string
  error?: string
}> {
  try {
    // 使用管理员客户端上传文件以绕过RLS
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // 使用管理员客户端获取公共URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path)

    return {
      success: true,
      url: urlData.publicUrl
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: '上传失败'
    }
  }
}

/**
 * 删除图片
 * @param path 图片路径
 * @returns 删除结果
 */
export async function deleteImage(path: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // 使用管理员客户端删除文件
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([path])

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: '删除失败'
    }
  }
}

/**
 * 生成唯一的文件路径
 * @param userId 用户ID
 * @param fileName 原始文件名
 * @returns 唯一路径
 */
export function generateImagePath(userId: string, fileName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = fileName.split('.').pop()
  
  return `users/${userId}/models/${timestamp}-${randomString}.${extension}`
}

/**
 * 生成缩略图路径
 * @param originalPath 原始图片路径
 * @returns 缩略图路径
 */
export function generateThumbnailPath(originalPath: string): string {
  const pathParts = originalPath.split('.')
  const extension = pathParts.pop()
  const basePath = pathParts.join('.')
  
  return `${basePath}_thumb.${extension}`
}

/**
 * 批量上传图片
 * @param files 图片文件数组
 * @param userId 用户ID
 * @returns 上传结果数组
 */
export async function uploadMultipleImages(
  files: File[],
  userId: string
): Promise<Array<{
  success: boolean
  url?: string
  error?: string
  originalName: string
}>> {
  const results = []
  
  for (const file of files) {
    const path = generateImagePath(userId, file.name)
    const result = await uploadImage(file, path)
    
    results.push({
      ...result,
      originalName: file.name
    })
  }
  
  return results
}

/**
 * 检查存储桶是否存在，如果不存在则创建
 */
export async function ensureBucketExists(): Promise<void> {
  try {
    // 使用管理员客户端检查存储桶是否存在
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME)
    
    if (!bucketExists) {
      // 使用管理员客户端创建存储桶
      const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      })
      
      if (createError) {
        console.error('Error creating bucket:', createError)
      } else {
        console.log(`Bucket ${BUCKET_NAME} created successfully`)
      }
    }
  } catch (error) {
    console.error('Error ensuring bucket exists:', error)
  }
}

/**
 * 获取图片的公共URL
 * @param path 图片路径
 * @returns 公共URL
 */
export function getImageUrl(path: string): string {
  // 使用管理员客户端获取公共URL
  const { data } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)
  
  return data.publicUrl
}

/**
 * 列出用户的所有图片
 * @param userId 用户ID
 * @returns 图片列表
 */
export async function listUserImages(userId: string): Promise<{
  success: boolean
  images?: Array<{
    name: string
    url: string
    size: number
    createdAt: string
  }>
  error?: string
}> {
  try {
    // 使用管理员客户端列出用户图片
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .list(`users/${userId}/models`, {
        limit: 100,
        offset: 0
      })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    const images = data?.map(file => ({
      name: file.name,
      url: getImageUrl(`users/${userId}/models/${file.name}`),
      size: file.metadata?.size || 0,
      createdAt: file.created_at || ''
    })) || []

    return {
      success: true,
      images
    }
  } catch (error) {
    return {
      success: false,
      error: '获取图片列表失败'
    }
  }
}

/**
 * 从Supabase存储URL中提取文件路径
 * @param url 完整的Supabase存储URL或JSON格式的URL
 * @returns 文件路径
 */
export function extractPathFromUrl(url: string): string | null {
  try {
    let actualUrl = url
    
    // 检查是否是JSON格式的URL
    if (url.startsWith('{"success":true,"url":"')) {
      try {
        const parsed = JSON.parse(url)
        if (parsed.success && parsed.url) {
          actualUrl = parsed.url
        } else {
          console.error('JSON格式URL解析失败:', url)
          return null
        }
      } catch (parseError) {
        console.error('解析JSON格式URL失败:', parseError)
        return null
      }
    }
    
    // Supabase存储URL格式: https://project.supabase.co/storage/v1/object/public/bucket-name/path
    const urlObj = new URL(actualUrl)
    const pathParts = urlObj.pathname.split('/')
    
    // 找到 'public' 后面的部分，跳过 bucket 名称
    const publicIndex = pathParts.indexOf('public')
    if (publicIndex !== -1 && pathParts.length > publicIndex + 2) {
      // 跳过 'public' 和 bucket 名称，返回实际的文件路径
      return pathParts.slice(publicIndex + 2).join('/')
    }
    
    return null
  } catch (error) {
    console.error('提取路径失败:', error)
    return null
  }
}