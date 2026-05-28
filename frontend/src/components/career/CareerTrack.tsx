import { Grade } from "@/lib/types"

const GRADE_LABELS: Record<Grade, string> = {
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  lead:   "Lead",
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
    <div className="bg-surface rounded-xl border border-line p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-ink">Карьерный трек</h3>
        <span className="text-sm text-ink-muted">~{estimatedMonths} мес. до следующего грейда</span>
      </div>
      <div className="flex items-center gap-0 mt-5">
        {ALL_GRADES.map((grade, idx) => {
          const isPast    = idx < currentIdx
          const isCurrent = idx === currentIdx
          const isTarget  = idx === targetIdx && targetIdx !== currentIdx
          const isActive  = idx <= targetIdx

          return (
            <div key={grade} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    isCurrent
                      ? "bg-accent border-accent text-white scale-110 shadow-lg shadow-accent/30"
                      : isTarget
                      ? "bg-canvas-100 border-accent text-accent"
                      : isPast
                      ? "bg-accent/20 border-accent/40 text-accent"
                      : "bg-canvas-300 border-line text-ink-subtle"
                  }`}
                >
                  {isPast ? "✓" : grade[0].toUpperCase()}
                </div>
                <span
                  className={`mt-1.5 text-xs font-medium ${
                    isCurrent ? "text-accent" : isActive ? "text-ink-soft" : "text-ink-subtle"
                  }`}
                >
                  {GRADE_LABELS[grade]}
                </span>
              </div>
              {idx < ALL_GRADES.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 rounded-full ${
                    idx < currentIdx ? "bg-accent/60" : idx === currentIdx ? "bg-accent/25" : "bg-canvas-300"
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
