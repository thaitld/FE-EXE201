import { ArrowLeft, Lock } from 'lucide-react'

export default function NotAuthorized() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-red-400">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">Access Denied</h1>
        <p className="mt-2 text-sm text-slate-300">
          You don't have permission to access this page.
        </p>
        <button
          onClick={() => {
            window.location.hash = '#/'
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back Home
        </button>
      </div>
    </main>
  )
}
