import React, { useState } from 'react'
import { apiClient, type ApiResponse, type UpdateProfileDto, type UserDto } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfileEditModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, refreshUser } = useAuth()
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setFirstName(user?.firstName ?? '')
      setLastName(user?.lastName ?? '')
      setError(null)
    }
  }, [open, user])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    const payload: UpdateProfileDto = {}
    if (firstName.trim()) payload.firstName = firstName.trim()
    if (lastName.trim()) payload.lastName = lastName.trim()

    try {
      const resp = await apiClient.patch<ApiResponse<UserDto>>('/users/me', payload)
      if (resp.data.succeeded) {
        await refreshUser()
        onClose()
      } else {
        setError(resp.data.message || 'Failed to update profile')
      }
    } catch (e) {
      setError('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6">
        <h3 className="text-lg font-semibold">Edit profile</h3>
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm text-slate-600">First name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Last name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
          {error ? <div className="text-sm text-rose-600">{error}</div> : null}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 rounded-md" onClick={onClose} disabled={isSaving}>Cancel</button>
          <button className="px-4 py-2 rounded-md bg-blue-600 text-white" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
