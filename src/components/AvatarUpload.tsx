import React, { useRef, useState } from 'react'
import { apiClient, type ApiResponse } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export default function AvatarUpload({ onUploaded }: { onUploaded?: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { refreshUser } = useAuth()
  const { user } = useAuth()
  const [, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => null)

  const MAX_SIZE = 5 * 1024 * 1024 // 5MB

  const trigger = () => inputRef.current?.click()

  const handleFile = async (file?: File) => {
    if (!file) return
    setError(null)
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('File is too large (max 5MB)')
      return
    }

    const form = new FormData()
    form.append('file', file)

    setIsUploading(true)
    try {
      const resp = await apiClient.patch<ApiResponse<string>>('/users/me/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (resp.data.succeeded && resp.data.data) {
        // server returns avatar URL
        const url = resp.data.data
        setPreviewUrl(url ?? null)
        await refreshUser()
        onUploaded?.(url)
      } else {
        setError(resp.data.message || 'Upload failed')
      }
    } catch (e) {
      setError('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    handleFile(file)
    e.currentTarget.value = ''
  }

    return (
    <div className="mt-4">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
      <div className="flex items-center gap-4">
        <div
          role="button"
          tabIndex={0}
          onClick={trigger}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') trigger() }}
          className="h-14 w-14 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer relative"
          title="Click to upload avatar"
        >
          <img src={previewUrl ?? user?.avatarUrl ?? ''} alt="avatar" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
          {!previewUrl && !user?.avatarUrl ? <span className="text-slate-700 font-bold">{(user?.email?.charAt(0) ?? 'M').toUpperCase()}</span> : null}
          <div className="absolute -bottom-1 -right-1 rounded-full bg-white/90 p-0.5 text-xs text-slate-700 shadow-sm text-center">✎</div>
        </div>
      </div>
      {error ? <div className="text-sm text-rose-600 mt-2">{error}</div> : null}
    </div>
  )
}

