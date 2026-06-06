import type { ReactNode } from 'react'
import ManagerSidebar from './ManagerSidebar'

export interface ManagerTabItem {
  id: string
  label: string
  description: string
}

export default function ManagerLayout({
  title,
  subtitle,
  activeTab,
  onTabChange,
  children,
}: {
  title: string
  subtitle: string
  tabs?: ManagerTabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.92),_rgba(2,6,23,1))] text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <ManagerSidebar activeTab={activeTab} onTabChange={onTabChange} />

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-slate-950/40 backdrop-blur sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
