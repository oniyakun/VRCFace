import { translations } from './translations'

export type Language = 'zh' | 'en' | 'ja'

// 检测浏览器语言并匹配支持的语言
function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  
  const browserLanguages = navigator.languages || [navigator.language]
  
  for (const lang of browserLanguages) {
    const langCode = lang.split('-')[0] as Language
    if (['zh', 'en', 'ja'].includes(langCode)) {
      return langCode
    }
  }
  
  return 'en'
}

export function getCurrentLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  
  const stored = localStorage.getItem('language')
  if (stored && ['zh', 'en', 'ja'].includes(stored as Language)) {
    return stored as Language
  }
  
  const detected = detectBrowserLanguage()
  localStorage.setItem('language', detected)
  return detected
}

// 设置语言
export const setLanguage = (lang: Language) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang)
    // 触发自定义事件通知组件更新
    window.dispatchEvent(new CustomEvent('languageChange', { detail: lang }))
  }
}

// 翻译函数
export const t = (key: string, params?: Record<string, string | number>, lang?: Language): string => {
  const currentLang = lang || getCurrentLanguage()
  const keys = key.split('.')
  let value: any = translations[currentLang]
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      // 如果找不到翻译，返回中文作为后备
      value = translations.zh
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey]
        } else {
          return key // 如果连中文都找不到，返回key本身
        }
      }
      break
    }
  }
  
  let result = typeof value === 'string' ? value : key
  
  // 处理占位符替换
  if (params && typeof result === 'string') {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue))
    })
  }
  
  return result
}

// 语言选项
export const languages = [
  { code: 'zh' as Language, name: '中文' },
  { code: 'en' as Language, name: 'English' },
  { code: 'ja' as Language, name: '日本語' }
]