'use client'

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { Toast, ToastType, ToastContainer } from './Toast'

interface ToastContextType {
  showToast: (options: {
    type: ToastType
    title?: string
    message: string
    duration?: number
    action?: {
      label: string
      onClick: () => void
    }
  }) => void
  showSuccess: (message: string, title?: string) => void
  showError: (message: string, title?: string) => void
  showWarning: (message: string, title?: string) => void
  showInfo: (message: string, title?: string) => void
  removeToast: (id: string) => void
  clearAllToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback((options: {
    type: ToastType
    title?: string
    message: string
    duration?: number
    action?: {
      label: string
      onClick: () => void
    }
  }) => {
    const toast: Toast = {
      id: generateId(),
      type: options.type,
      title: options.title,
      message: options.message,
      duration: options.duration,
      action: options.action
    }

    setToasts(prev => [...prev, toast])
  }, [])

  const showSuccess = useCallback((message: string, title?: string) => {
    showToast({
      type: 'success',
      title,
      message,
      duration: 4000
    })
  }, [showToast])

  const showError = useCallback((message: string, title?: string) => {
    showToast({
      type: 'error',
      title,
      message,
      duration: 6000
    })
  }, [showToast])

  const showWarning = useCallback((message: string, title?: string) => {
    showToast({
      type: 'warning',
      title,
      message,
      duration: 5000
    })
  }, [showToast])

  const showInfo = useCallback((message: string, title?: string) => {
    showToast({
      type: 'info',
      title,
      message,
      duration: 4000
    })
  }, [showToast])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAllToasts
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}