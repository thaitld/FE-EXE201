import { useEffect, useState } from 'react';
import { getMyProfile, updateMyProfile } from '../api';
import CustomerLayout from '../components/CustomerLayout';
import { Loader2, AlertCircle, Lock, Save } from 'lucide-react';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await getMyProfile();
        setEmail(data.email);
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setPhone(data.phone ?? '');
        setCreatedAt(data.createdAt);
      } catch (err: any) {
        setError(err.message || 'Unable to load profile.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      showToast('First name and last name are required.', 'error');
      return;
    }
    try {
      setSaving(true);
      const updated = await updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
      });
      setFirstName(updated.firstName);
      setLastName(updated.lastName);
      setPhone(updated.phone ?? '');
      showToast('Profile updated successfully.');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <CustomerLayout pageTitle="My Account">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border shadow-xl bg-white text-slate-800 ${
            toast.type === 'error' ? 'border-rose-200' : 'border-emerald-200'
          }`}>
            <AlertCircle size={18} className={toast.type === 'error' ? 'text-rose-500' : 'text-emerald-500'} />
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white border border-slate-200 rounded-3xl">
            <Loader2 size={40} className="text-blue-600 animate-spin" />
            <p className="text-slate-500 font-medium">Loading profile...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <AlertCircle size={40} className="text-rose-500 mx-auto mb-4" />
            <p className="text-slate-800 font-semibold">{error}</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email
              </label>
              <div className="flex items-center gap-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500">
                <Lock size={14} />
                {email}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
                placeholder="Optional"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            {createdAt && (
              <p className="text-xs text-slate-400">
                Member since {new Date(createdAt).toLocaleDateString('en-US')}
              </p>
            )}

            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:from-blue-600 hover:to-blue-400 transition flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
