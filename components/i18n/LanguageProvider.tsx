'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, getCurrentLanguage, setLanguage, t } from '@/lib/i18n'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setCurrentLanguage] = useState<Language>('en')

  useEffect(() => {
    // 初始化语言（会自动检测浏览器语言）
    setCurrentLanguage(getCurrentLanguage())

    // 监听语言变化事件
    const handleLanguageChange = (event: CustomEvent<Language>) => {
      setCurrentLanguage(event.detail)
    }

    window.addEventListener('languageChange', handleLanguageChange as EventListener)

    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener)
    }
  }, [])

  const changeLanguage = (lang: Language) => {
    setLanguage(lang)
    setCurrentLanguage(lang)
  }

  const translate = (key: string, params?: Record<string, string | number>) => {
    return t(key, params, language)
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: changeLanguage,
        t: translate
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}