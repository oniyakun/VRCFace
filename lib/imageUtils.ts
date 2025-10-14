/**
 * 图片处理工具函数
 */

export interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'webp' | 'png'
}

/**
 * 压缩图片文件
 * @param file 原始图片文件
 * @param options 压缩选项
 * @returns 压缩后的文件
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    // 在服务器端，直接返回原文件
    return file
  }

  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    format = 'jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // 计算新的尺寸
      let { width, height } = img
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }

      // 设置画布尺寸
      canvas.width = width
      canvas.height = height

      // 绘制图片
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
        
        // 转换为Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // 创建新的File对象
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, `.${format === 'jpeg' ? 'jpg' : format}`),
                {
                  type: `image/${format}`,
                  lastModified: Date.now()
                }
              )
              resolve(compressedFile)
            } else {
              reject(new Error('图片压缩失败'))
            }
          },
          `image/${format}`,
          quality
        )
      } else {
        reject(new Error('无法获取Canvas上下文'))
      }
    }

    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }

    // 加载图片
    img.src = URL.createObjectURL(file)
  })
}

/**
 * 生成缩略图
 * @param file 原始图片文件
 * @param size 缩略图尺寸
 * @returns 缩略图文件
 */
export async function generateThumbnail(
  file: File,
  size: number = 300
): Promise<File> {
  return compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'jpeg'
  })
}

/**
 * 验证图片文件
 * @param file 文件对象
 * @returns 验证结果
 */
export function validateImageFile(file: File): {
  valid: boolean
  error?: string
} {
  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: '请选择图片文件'
    }
  }

  // 检查支持的格式
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!supportedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '不支持的图片格式，请选择 JPG、PNG 或 WebP 格式'
    }
  }

  // 检查文件大小 (10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      valid: false,
      error: '图片文件不能超过10MB'
    }
  }

  return { valid: true }
}

/**
 * 获取图片尺寸
 * @param file 图片文件
 * @returns 图片尺寸信息
 */
export async function getImageDimensions(file: File): Promise<{
  width: number
  height: number
}> {
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined' || typeof Image === 'undefined') {
    // 在服务器端，返回默认尺寸
    return { width: 800, height: 600 }
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    
    img.onerror = () => {
      reject(new Error('无法获取图片尺寸'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

/**
 * 创建图片预览URL
 * @param file 图片文件
 * @returns 预览URL
 */
export function createImagePreview(file: File): string {
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined' || typeof URL === 'undefined') {
    // 在服务器端，返回空字符串
    return ''
  }
  
  return URL.createObjectURL(file)
}

/**
 * 释放图片预览URL
 * @param url 预览URL
 */
export function revokeImagePreview(url: string): void {
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined' || typeof URL === 'undefined') {
    return
  }
  
  URL.revokeObjectURL(url)
}