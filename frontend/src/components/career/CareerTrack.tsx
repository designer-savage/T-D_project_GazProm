import { Grade } from "@/lib/types"

const GRADE_LABELS: Record<Grade, string> = {
  junior:    "Junior",
  middle:    "Middle",
  senior:    "Senior",
  lead:      "Lead",
  principal: "Principal",
}

const ALL_GRADES: Grade[] = ["junior", "middle", "senior", "lead", "principal"]

function IconCheck({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
}

interface Props {
  currentGrade: Grade
  targetGrade: Grade
  estimatedMonths: number
}

export default function CareerTrack({ currentGrade, targetGrade, estimatedMonths }: Props) {
  const currentIdx = ALL_GRADES.indexOf(currentGrade)
  const targetIdx = ALL_GRADES.indexOf(targetGrade)

  return (
    <div className="glass-card anim-fade-up" style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)" }}>Карьерный трек</h3>
        <span style={{ fontSize: 13, color: "var(--text-2)" }}>~{estimatedMonths} мес. до следующего грейда</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {ALL_GRADES.map((grade, idx) => {
          const isPast    = idx < currentIdx
          const isCurrent = idx === currentIdx
          const isTarget  = idx === targetIdx && targetIdx !== currentIdx
          const isActive  = idx <= targetIdx

          return (
            <div key={grade} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: isCurrent ? 48 : 40,
                  height: isCurrent ? 48 : 40,
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                  transition: "all 0.3s",
                  ...(isCurrent ? {
                    background: "var(--accent)", border: "2px solid var(--accent)",
                    color: "#fff", boxShadow: "0 0 20px var(--accent-glow)",
                  } : isTarget ? {
                    background: "transparent", border: "2px solid var(--accent)",
                    color: "var(--accent)",
                  } : isPast ? {
                    background: "var(--accent-soft)", border: "2px solid transparent",
                    color: "var(--accent)",
                  } : {
                    background: "var(--glass-bg-elevated)", border: "2px solid var(--glass-border)",
                    color: "var(--text-3)",
                  }),
                }}>
                  {isPast ? <IconCheck size={16} /> : grade[0].toUpperCase()}
                </div>
                <span style={{
                  marginTop: 8, fontSize: 12, fontWeight: 500,
                  color: isCurrent ? "var(--accent)" : isActive ? "var(--text-2)" : "var(--text-3)",
                }}>
                  {GRADE_LABELS[grade]}
                </span>
              </div>

              {idx < ALL_GRADES.length - 1 && (
                <div style={{
                  flex: 1, height: 2, marginLeft: 6, marginRight: 6, borderRadius: 1,
                  background: idx < currentIdx ? "var(--accent)" : idx === currentIdx ? "var(--accent-glow)" : "var(--glass-border)",
                  transition: "background 0.3s",
                  opacity: idx < currentIdx ? 0.6 : 1,
                }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
