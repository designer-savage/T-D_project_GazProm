import { Grade } from "@/lib/types"

const GRADE_LABELS: Record<Grade, string> = {
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  lead: "Lead",
}

const ALL_GRADES: Grade[] = ["junior", "middle", "senior", "lead"]

interface Props {
  currentGrade: Grade
  targetGrade: Grade
  estimatedMonths: number
}

export default function CareerTrack({ currentGrade, targetGrade, estimatedMonths }: Props) {
  const currentIdx = ALL_GRADES.indexOf(currentGrade)
  const targetIdx = ALL_GRADES.indexOf(targetGrade)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">Карьерный трек</h3>
        <span className="text-sm text-gray-500">~{estimatedMonths} мес. до следующего грейда</span>
      </div>
      <div className="flex items-center gap-0 mt-4">
        {ALL_GRADES.map((grade, idx) => {
          const isPast = idx < currentIdx
          const isCurrent = idx === currentIdx
          const isTarget = idx === targetIdx && targetIdx !== currentIdx
          const isActive = idx <= targetIdx

          return (
            <div key={grade} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    isCurrent
                      ? "bg-blue-600 border-blue-600 text-white scale-110"
                      : isTarget
                      ? "bg-white border-blue-600 text-blue-600"
                      : isPast
                      ? "bg-blue-100 border-blue-300 text-blue-600"
                      : "bg-gray-100 border-gray-300 text-gray-400"
                  }`}
                >
                  {isPast ? "✓" : grade[0].toUpperCase()}
                </div>
                <span
                  className={`mt-1.5 text-xs font-medium ${
                    isCurrent ? "text-blue-600" : isActive ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  {GRADE_LABELS[grade]}
                </span>
              </div>
              {idx < ALL_GRADES.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 ${
                    idx < currentIdx ? "bg-blue-400" : idx === currentIdx ? "bg-blue-200" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
