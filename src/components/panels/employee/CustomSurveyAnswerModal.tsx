import React, { useEffect, useState } from 'react'
import { getCustomSurveyDetail, submitCustomSurveyAnswers } from '@/lib/api'
import type { CustomSurveyDto, SubmitCustomSurveyAnswersDto, SurveyAnswerItemDto } from '@/types/employee'
import { RefreshCw, Star, AlertTriangle, CheckCircle } from 'lucide-react'

interface AnswerModalProps {
  surveyId: number
  onClose: () => void
  onSuccess: () => void
}

export const CustomSurveyAnswerModal = ({ surveyId, onClose, onSuccess }: AnswerModalProps) => {
  const [survey, setSurvey] = useState<CustomSurveyDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Answers state: questionId -> value (number for Rating, string for Text)
  const [answers, setAnswers] = useState<Record<number, { ratingValue?: number; textValue?: string }>>({})

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setErrorMsg(null)
    ;(async () => {
      try {
        const res = await getCustomSurveyDetail(surveyId)
        if (mounted) {
          if (res.data?.succeeded && res.data.data) {
            setSurvey(res.data.data)
            
            // Initialize empty answers state
            const initial: typeof answers = {}
            res.data.data.questions.forEach((q) => {
              initial[q.id] = q.questionType === 'Rating' ? { ratingValue: undefined } : { textValue: '' }
            })
            setAnswers(initial)
          } else {
            setErrorMsg(res.data?.message ?? 'Không thể tải thông tin khảo sát')
          }
        }
      } catch (err: any) {
        if (mounted) setErrorMsg(err?.message ?? 'Đã xảy ra lỗi khi tải chi tiết khảo sát')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [surveyId])

  const setRatingAnswer = (qId: number, rating: number) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ratingValue: rating },
    }))
  }

  const setTextAnswer = (qId: number, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { textValue: text },
    }))
  }

  // Validate form
  const isFormValid = () => {
    if (!survey) return false
    for (const q of survey.questions) {
      if (q.isRequired) {
        const ans = answers[q.id]
        if (q.questionType === 'Rating') {
          if (!ans?.ratingValue) return false
        } else {
          if (!ans?.textValue || !ans.textValue.trim()) return false
        }
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid()) return

    setSaving(true)
    setErrorMsg(null)
    try {
      const answersPayload: SurveyAnswerItemDto[] = Object.entries(answers).map(([key, val]) => ({
        questionId: Number(key),
        ratingValue: val.ratingValue,
        textValue: val.textValue?.trim() || undefined,
      }))

      const payload: SubmitCustomSurveyAnswersDto = {
        answers: answersPayload,
      }

      const res = await submitCustomSurveyAnswers(surveyId, payload)
      if (res.data?.succeeded) {
        onSuccess()
      } else {
        setErrorMsg(res.data?.message ?? 'Không thể gửi phản hồi khảo sát.')
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message ?? err?.message ?? 'Lỗi kết nối khi nộp khảo sát.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl flex flex-col border border-slate-100 font-sans">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wider">
              Khảo sát tùy chỉnh
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">{survey?.title ?? 'Đang tải khảo sát...'}</h3>
            {survey?.description && (
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{survey.description}</p>
            )}
            {survey?.createdByName && (
              <p className="text-[10px] text-slate-400 mt-1">Khảo sát từ: <strong>{survey.createdByName}</strong></p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
          >
            Đóng
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400 mb-2" />
            <p className="text-sm text-slate-400">Đang tải nội dung khảo sát...</p>
          </div>
        ) : errorMsg && !survey ? (
          <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 mt-4">
            <AlertTriangle size={14} className="shrink-0" /> {errorMsg}
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 space-y-6 flex-1">
            {survey?.questions.map((q, idx) => {
              const isRating = q.questionType === 'Rating'
              const ansVal = answers[q.id]
              
              return (
                <div key={q.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-slate-400 mt-0.5">{idx + 1}.</span>
                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                      {q.questionText} {q.isRequired && <span className="text-rose-500 font-bold">*</span>}
                    </p>
                  </div>

                  {isRating ? (
                    <div className="flex items-center gap-3 pl-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingAnswer(q.id, star)}
                          className="p-1 rounded-lg transition active:scale-90"
                        >
                          <Star
                            size={28}
                            className={`transition-all duration-150 ${
                              star <= (ansVal?.ratingValue ?? 0)
                                ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow-sm'
                                : 'text-slate-300 hover:text-amber-300'
                            }`}
                          />
                        </button>
                      ))}
                      {ansVal?.ratingValue && (
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md ml-2">
                          {ansVal.ratingValue} / 5
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="pl-4">
                      <textarea
                        required={q.isRequired}
                        maxLength={2000}
                        rows={3}
                        value={ansVal?.textValue ?? ''}
                        onChange={(e) => setTextAnswer(q.id, e.target.value)}
                        placeholder="Nhập câu trả lời của bạn..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition resize-none"
                      />
                    </div>
                  )}
                </div>
              )
            })}

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertTriangle size={14} className="shrink-0" /> {errorMsg}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving || !isFormValid()}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                {saving ? 'Đang nộp...' : 'Nộp Phản Hồi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
