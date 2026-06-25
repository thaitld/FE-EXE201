import { useEffect, useState } from 'react';
import { AlertTriangle, Sparkles, X } from 'lucide-react';

export default function UpgradeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string }>;
      setMessage(customEvent.detail?.message || 'Tính năng này yêu cầu nâng cấp gói dịch vụ.');
      setIsOpen(true);
    };

    window.addEventListener('manto:show-upgrade-modal', handleOpen);
    return () => {
      window.removeEventListener('manto:show-upgrade-modal', handleOpen);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all animate-in fade-in zoom-in duration-200">
        
        {/* Neon Gradient Header Block */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center text-white relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 rounded-full bg-white/20 p-1.5 text-white/90 hover:bg-white/30 hover:text-white transition"
          >
            <X size={18} />
          </button>
          
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur">
            <Sparkles size={28} className="animate-pulse" />
          </div>
          <h3 className="text-xl font-bold tracking-wide">Yêu Cầu Nâng Cấp Gói</h3>
          <p className="mt-1 text-sm text-blue-100">Mở khóa sức mạnh tối đa của MANTO</p>
        </div>

        {/* Content Block */}
        <div className="p-6">
          <div className="flex gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm">
            <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
            <p className="leading-relaxed font-medium">{message}</p>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-700 to-blue-500 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-600 hover:to-blue-400 transition"
            >
              Liên Hệ Admin Nâng Cấp
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Để Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
