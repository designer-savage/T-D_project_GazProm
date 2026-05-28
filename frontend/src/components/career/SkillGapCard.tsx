import { Competency } from "@/lib/types"

export default function SkillGapCard({ competency }: { competency: Competency }) {
  const pct = Math.round((competency.current_level / competency.target_level) * 100)
  const gapColor =
    competency.gap === 0 ? "bg-state-success" :
    competency.gap === 1 ? "bg-state-warn" :
    "bg-state-danger"

  return (
    <div className="bg-surface rounded-xl border border-line p-4">
      <div className="flex justify-between items-start mb-2.5">
        <span className="text-sm font-medium text-ink">{competency.skill_name}</span>
        {competency.gap === 0 ? (
          <span className="text-xs text-state-success font-medium">✓ Цель достигнута</span>
        ) : (
          <span className="text-xs text-ink-muted">gap: {competency.gap}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-canvas-300 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${gapColor}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <span className="text-xs text-ink-muted w-16 text-right tabular-nums">
          {competency.current_level} / {competency.target_level}
        </span>
      </div>
    </div>
  )
}
