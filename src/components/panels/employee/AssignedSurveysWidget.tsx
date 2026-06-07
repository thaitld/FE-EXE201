import React, { useEffect, useState } from 'react'
import { getAssignedCustomSurveys } from '@/lib/api'
import type { CustomSurveyDto } from '@/types/employee'
import { ClipboardList, Calendar, CheckCircle, Clock, ArrowRight, Sparkles, User } from 'lucide-react'
import { CustomSurveyAnswerModal } from './CustomSurveyAnswerModal'

export const AssignedSurveysWidget = () => {
  const [assigned, setAssigned] = useState<CustomSurveyDto[]>([])
  const [loading, setLoading] = useState(false)
  const [activeSurveyId, setActiveSurveyId] = useState<number | null>(null)
  const [successToast, setSuccessToast] = useState(false)

  const loadAssigned = async () => {
    setLoading(true)
    try {
      const res = await getAssignedCustomSurveys()
      if (res.data?.succeeded) {
        setAssigned(res.data.data ?? [])
      }
    } catch (err) {
      console.error('Failed to load assigned custom surveys', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssigned()
  }, [])

  const handleSuccess = () => {
    setActiveSurveyId(null)
    setSuccessToast(true)
    setTimeout(() => setSuccessToast(false), 3000)
    void loadAssigned()
  }

  if (loading && assigned.length === 0) return null
  if (assigned.length === 0 && !successToast) return null

  return (
    <div className="space-y-4 font-sans mb-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-sm font-semibold text-emerald-800 shadow-lg transition-all animate-in fade-in slide-in-from-top-3">
          <CheckCircle size={18} className="text-emerald-600" />
          Cảm ơn bạn đã hoàn thành khảo sát!
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <ClipboardList size={14} className="text-indigo-500" />
          Khảo sát đang chờ phản hồi
          <span className="inline-flex items-center justify-center bg-indigo-600 text-white text-[10px] font-black h-5 w-5 rounded-full shadow-sm animate-pulse">
            {assigned.length}
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {assigned.map((survey) => {
          const deadline = new Date(survey.endDate)
          const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          const isUrgent = daysLeft > 0 && daysLeft <= 3
          
          let timeLeftText = ''
          let timeBadgeClass = ''
          if (daysLeft > 0) {
            timeLeftText = `Còn ${daysLeft} ngày`
            timeBadgeClass = isUrgent
              ? 'bg-rose-50 text-rose-600 border border-rose-100'
              : 'bg-amber-50 text-amber-700 border border-amber-100'
          } else {
            timeLeftText = 'Hết hạn hôm nay'
            timeBadgeClass = 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
          }

          return (
            <div
              key={survey.id}
              className="relative p-[1.5px] rounded-2xl bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 hover:from-violet-600 hover:via-indigo-600 hover:to-blue-600 shadow-md shadow-indigo-100/30 hover:shadow-xl hover:shadow-indigo-200/40 transition duration-300 group cursor-pointer"
              onClick={() => setActiveSurveyId(survey.id)}
            >
              <div className="bg-white p-5 rounded-[15px] flex flex-col justify-between h-full transition duration-350 hover:bg-slate-50/50">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 uppercase tracking-wider">
                        <Sparkles size={10} className="animate-spin duration-[4000ms]" />
                        Khảo sát mới
                      </span>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    </div>
                    <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${timeBadgeClass}`}>
                      <Clock size={11} />
                      {timeLeftText}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition duration-200 mt-4">
                    {survey.title}
                  </h4>
                  {survey.description && (
                    <p className="text-xs text-slate-500 line-clamp-3 mt-2 leading-relaxed">
                      {survey.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <User size={13} className="text-slate-400" />
                    <span>Người tạo: <strong>{survey.createdByName}</strong></span>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 group-hover:from-indigo-700 group-hover:to-violet-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200/50 transition duration-300 group-hover:translate-x-0.5 active:scale-95"
                  >
                    Bắt đầu làm
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {activeSurveyId !== null && (
        <CustomSurveyAnswerModal
          surveyId={activeSurveyId}
          onClose={() => setActiveSurveyId(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
