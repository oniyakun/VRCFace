'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, X } from 'lucide-react'

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
                确认删除作品
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
              您即将删除作品：
            </p>
            <p className="font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              "{modelTitle}"
            </p>
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>警告：</strong>此操作不可撤销！删除后将永久失去以下数据：
              </p>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                <li>作品的所有图片和数据</li>
                <li>所有点赞和收藏记录</li>
                <li>所有评论和互动数据</li>
                <li>作品的浏览统计信息</li>
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
              取消
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
                  删除中...
                </>
              ) : (
                '确认删除'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}