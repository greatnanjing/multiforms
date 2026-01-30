/* ============================================
   MultiForms File Upload Question Component

   文件上传组件：
   - 编辑状态：配置文件类型和大小限制
   - 填写状态：拖拽上传/点击选择
   - 支持多文件上传和进度显示
============================================ */

'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, File, Image as ImageIcon, FileText, Film, Music } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FileUploadQuestionProps, UploadedFile, QuestionMode } from './types'
import type { AnswerValue } from '@/types'

// ============================================
// Types
// ============================================

interface FileUploadProps extends FileUploadQuestionProps {
  mode?: QuestionMode
}

// ============================================
// Helpers
// ============================================

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function getFileIcon(fileName: string): React.ReactNode {
  const ext = fileName.split('.').pop()?.toLowerCase()

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
    return <ImageIcon className="w-5 h-5" />
  }
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) {
    return <FileText className="w-5 h-5" />
  }
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) {
    return <Film className="w-5 h-5" />
  }
  if (['mp3', 'wav', 'ogg'].includes(ext || '')) {
    return <Music className="w-5 h-5" />
  }

  return <File className="w-5 h-5" />
}

function isFileAllowed(fileName: string, allowedTypes?: string[]): boolean {
  if (!allowedTypes || allowedTypes.length === 0) return true
  const ext = '.' + fileName.split('.').pop()?.toLowerCase()
  return allowedTypes.some(type => type === ext || type === '*')
}

// ============================================
// Main Component
// ============================================

export function FileUpload({
  mode = 'fill',
  questionId,
  questionText,
  required = false,
  value,
  onChange,
  error,
  disabled = false,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = [],
  maxFiles = 1,
  files = [],
  uploading = false,
  className
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [internalFiles, setInternalFiles] = useState<UploadedFile[]>(files || [])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentFiles = files || internalFiles
  const currentValue = value !== undefined ? value : currentFiles

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)

    if (disabled) return

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [disabled])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    handleFiles(selectedFiles)
    // 重置 input 以允许再次选择同一文件
    e.target.value = ''
  }, [])

  const handleFiles = (newFiles: File[]) => {
    const validFiles: UploadedFile[] = []
    const errors: string[] = []

    for (const file of newFiles) {
      // 检查文件类型
      if (!isFileAllowed(file.name, allowedTypes)) {
        errors.push(`${file.name}: 文件类型不允许`)
        continue
      }

      // 检查文件大小
      if (maxFileSize && file.size > maxFileSize) {
        errors.push(`${file.name}: 文件过大 (最大 ${formatFileSize(maxFileSize)})`)
        continue
      }

      // 创建文件对象
      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      }

      validFiles.push(uploadedFile)
    }

    // 显示错误
    if (errors.length > 0) {
      alert(errors.join('\n'))
    }

    // 合并文件列表
    if (validFiles.length > 0) {
      const updatedFiles = [...currentFiles]
      const remainingSlots = maxFiles - updatedFiles.length

      for (const file of validFiles.slice(0, remainingSlots)) {
        updatedFiles.push(file)
      }

      setInternalFiles(updatedFiles)
      onChange?.(updatedFiles as unknown as AnswerValue)
    }
  }

  const handleRemoveFile = (fileId: string) => {
    const updatedFiles = currentFiles.filter(f => f.id !== fileId)
    setInternalFiles(updatedFiles)
    onChange?.(updatedFiles as unknown as AnswerValue)
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  // 编辑模式
  if (mode === 'edit') {
    return (
      <div className={cn('question-wrapper', className)}>
        <div className="mb-4">
          <span className="text-base font-medium text-[var(--text-primary)]">
            {questionText || '未命名题目'}
          </span>
          {required && (
            <span className="ml-1 text-red-400">*</span>
          )}
        </div>

        <div className="space-y-4">
          {/* 文件类型限制 */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              文件类型限制
            </span>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">允许的文件类型</span>
              <span className="text-sm text-[var(--text-primary)]">
                {allowedTypes.length > 0 ? allowedTypes.join(', ') : '所有类型'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">最大文件大小</span>
              <span className="text-sm text-[var(--text-primary)]">
                {formatFileSize(maxFileSize)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">最大文件数量</span>
              <span className="text-sm text-[var(--text-primary)]">
                {maxFiles}
              </span>
            </div>
          </div>

          {/* 预览 */}
          <div className="p-4 rounded-xl border border-dashed border-white/20">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-3 block">
              预览
            </span>
            <div
              className={cn(
                'border-2 border-dashed rounded-xl p-6 text-center',
                'border-white/20 bg-white/5'
              )}
            >
              <Upload className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">
                拖拽文件到此处或点击选择
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('question-wrapper', className)}>
      {/* 题目标题 */}
      <div className="mb-4">
        <span className="text-base font-medium text-[var(--text-primary)]">
          {questionText || '未命名题目'}
        </span>
        {required && (
          <span className="ml-1 text-red-400">*</span>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-3 text-sm text-red-400 flex items-center gap-1.5">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* 上传区域 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200',
          dragOver
            ? 'border-indigo-500 bg-indigo-500/5'
            : 'border-white/20 bg-white/5 hover:border-indigo-500/30 hover:bg-white/10',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          disabled={disabled}
          multiple={maxFiles > 1}
          accept={allowedTypes.join(',')}
          className="hidden"
        />
        {uploading ? (
          <div className="py-4">
            <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-[var(--text-secondary)]">上传中...</p>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-sm text-[var(--text-primary)] mb-1">
              拖拽文件到此处或点击选择
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {allowedTypes.length > 0 && `支持 ${allowedTypes.join(', ')} · `}
              最大 {formatFileSize(maxFileSize)}
              {maxFiles > 1 && ` · 最多 ${maxFiles} 个文件`}
            </p>
          </>
        )}
      </div>

      {/* 已上传文件列表 */}
      {currentFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
            已上传 ({currentFiles.length}/{maxFiles})
          </span>
          {currentFiles.map((file) => (
            <div
              key={file.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border',
                'glass-card',
                'border-white/10'
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-muted)] flex-shrink-0">
                {getFileIcon(file.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)] truncate">
                  {file.name}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {formatFileSize(file.size)}
                </p>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveFile(file.id)
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// Skeleton Component
// ============================================

export function FileUploadSkeleton() {
  return (
    <div className="question-wrapper">
      <div className="h-5 w-48 bg-white/5 rounded-full mb-4 animate-pulse" />
      <div className="h-32 border-2 border-dashed border-white/20 rounded-xl animate-pulse" />
    </div>
  )
}
