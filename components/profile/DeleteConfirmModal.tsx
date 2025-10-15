'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, X } from 'lucide-react'
import { useLanguage } from '@/components/i18n/LanguageProvider'

interface DeleteConfirmModalProps {
  isOpen: boolean
  modelTitle: string
  onClose: () => void
  onConfirm: () => void
  isDeleting?: boolean
}

export default function DeleteConfirmModal({ 
  isOpen, 
  modelTitle, 
  onClose, 
  onConfirm, 
  isDeleting = false 
}: DeleteConfirmModalProps) {
  const { t } = useLanguage();
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          {/* 图标和标题 */}
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                {t('deleteConfirm.title')}
              </h3>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="ml-auto p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 内容 */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">
              {t('deleteConfirm.aboutToDelete')}
            </p>
            <p className="font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              "{modelTitle}"
            </p>
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>{t('deleteConfirm.warning')}</strong>{t('deleteConfirm.warningText')}
              </p>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                <li>{t('deleteConfirm.dataLoss.images')}</li>
                <li>{t('deleteConfirm.dataLoss.likes')}</li>
                <li>{t('deleteConfirm.dataLoss.comments')}</li>
                <li>{t('deleteConfirm.dataLoss.stats')}</li>
              </ul>
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
            >
              {t('deleteConfirm.cancel')}
            </Button>
            <Button
              variant="default"
              onClick={onConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('deleteConfirm.deleting')}
                </>
              ) : (
                t('deleteConfirm.confirmDelete')
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}