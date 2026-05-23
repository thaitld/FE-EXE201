import React, { useState } from 'react'
import { apiClient, type ApiResponse } from '@/lib/api'

export default function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setOldPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setError(null)
      setSuccess(null)
    }
  }, [open])

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)
    if (!oldPassword || !newPassword) {
      setError('Please provide current and new password')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setError('New password and confirmation do not match')
      return
    }
    setIsSaving(true)
    try {
      const payload = { oldPassword, newPassword, confirmNewPassword }
      const resp = await apiClient.post<ApiResponse<null>>('/auth/change-password', payload)
      if (resp.data.succeeded) {
        setSuccess('Password changed successfully')
      } else {
        setError(resp.data.message || 'Failed to change password')
      }
    } catch (e) {
      setError('Failed to change password')
    } finally {
      setIsSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6">
        <h3 className="text-lg font-semibold">Change password</h3>
        <p className="text-sm text-slate-500 mt-1">Provide your current password and a new password.</p>
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm text-slate-600">Current password</label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-slate-600">New password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Confirm new password</label>
            <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
          {error ? <div className="text-sm text-rose-600">{error}</div> : null}
          {success ? <div className="text-sm text-emerald-600">{success}</div> : null}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 rounded-md" onClick={onClose} disabled={isSaving}>Close</button>
          <button className="px-4 py-2 rounded-md bg-blue-600 text-white" onClick={handleSubmit} disabled={isSaving}>{isSaving ? 'Changing...' : 'Change password'}</button>
        </div>
      </div>
    </div>
  )
}
