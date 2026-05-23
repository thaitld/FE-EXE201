import React from 'react'
import { Shield, Bell, Edit3 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ProfileEditModal from '@/components/ProfileEditModal'
import ChangePasswordModal from '@/components/ChangePasswordModal'
import { apiClient, type ApiResponse } from '@/lib/api'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()

  const profileName = React.useMemo(() => {
    if (user?.firstName || user?.lastName) return `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
    if (user?.email) {
      const localPart = user.email.split('@')[0] ?? ''
      return localPart
        .split(/[._-]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    }
    return 'MANTO User'
  }, [user])

  const userInitials = React.useMemo(() => {
    if (user?.firstName || user?.lastName) {
      const parts = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim().split(' ').filter(Boolean)
      const initials = (parts[0]?.charAt(0) ?? '') + (parts[1]?.charAt(0) ?? '')
      return initials.toUpperCase() || 'MU'
    }
    return (user?.email?.charAt(0) ?? 'M').toUpperCase()
  }, [user])

  const profileRole = user?.roleName ?? 'Admin'
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const triggerInput = () => inputRef.current?.click()

  const handleHeaderFile = async (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) return

    const form = new FormData()
    form.append('file', file)
    try {
      const resp = await apiClient.patch<ApiResponse<string>>('/users/me/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (resp.data.succeeded && resp.data.data) {
        const url = resp.data.data
        setPreviewUrl(url)
        await refreshUser()
      }
    } catch {
      // ignore - refresh will happen later
    }
  }

  // Keep preview in sync with `user.avatarUrl` so other components' updates reflect here
  React.useEffect(() => {
    if (user?.avatarUrl) {
      setPreviewUrl(user.avatarUrl);
    }
  }, [user?.avatarUrl]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <AvatarBadge
                src={previewUrl ?? user?.avatarUrl ?? null}
                initials={userInitials}
                onClick={triggerInput}
              />
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; handleHeaderFile(f); e.currentTarget.value = '' }} />
              <button
                type="button"
                onClick={async () => {
                  if (!confirm('Delete avatar and revert to default?')) return
                  try {
                    await apiClient.delete('/users/me/avatar')
                    setPreviewUrl(null)
                    await refreshUser()
                  } catch {
                    // ignore errors for now; could show toast
                  }
                }}
                className="mt-2 text-sm text-rose-600 hover:underline"
              >
                Delete avatar
              </button>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{profileName}</h1>
              <p className="text-sm text-slate-600">{user?.email ?? 'unknown@manto.local'}</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                <Shield size={14} />
                Current Role: {profileRole}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ProfileEditModalHolder />
            <ChangePasswordHolder />
          </div>
          
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
            <div className="flex items-center gap-3">
              <Bell size={18} />
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-slate-500">Manage your notification settings.</p>
              </div>
            </div>
            <button className="text-sm text-slate-600">Manage</button>
          </div>

          <div className="rounded-lg border border-slate-100 p-4">
            <p className="font-medium">Account</p>
            <p className="text-sm text-slate-500 mt-2">Update your profile details and change password.</p>
            <div className="mt-4 text-sm text-slate-500">Click the avatar above to upload a new image.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileEditModalHolder() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md border px-3 py-2">
        <Edit3 size={16} />
        <span className="hidden sm:inline">Edit profile</span>
      </button>
      <ProfileEditModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

function ChangePasswordHolder() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 bg-white">
        Change password
      </button>
      <ChangePasswordModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

function AvatarBadge({
  src,
  initials,
  onClick,
}: {
  src: string | null
  initials: string
  onClick: () => void
}) {
  const [imageFailed, setImageFailed] = React.useState(false)

  React.useEffect(() => {
    setImageFailed(false)
  }, [src])

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-20 w-20 items-center justify-center rounded-full overflow-hidden cursor-pointer bg-blue-600 text-2xl font-bold text-white"
      title="Click to change avatar"
    >
      {src && !imageFailed ? (
        <img
          src={src}
          alt="avatar"
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </button>
  )
}
