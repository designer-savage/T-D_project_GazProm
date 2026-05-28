import { TeamMember } from "@/lib/types"

const GRADE_LABELS: Record<string, string> = {
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  lead: "Lead",
}

const GRADE_COLORS: Record<string, string> = {
  junior: "bg-state-warn/15 text-amber-700",
  middle: "bg-accent/15 text-accent",
  senior: "bg-state-success/15 text-state-success",
  lead: "bg-state-success/15 text-state-success",
}

function KpiBar({ score }: { score: number | null }) {
  if (score === null) return <span className="text-ink-subtle text-xs">—</span>
  const pct = Math.round(score * 100)
  const color = pct >= 80 ? "bg-state-success" : pct >= 65 ? "bg-state-warn" : "bg-state-danger"
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-line rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-ink-muted tabular-nums">{pct}%</span>
    </div>
  )
}

function ProgressBar({ pct }: { pct: number }) {
  const color = pct >= 70 ? "bg-state-success" : pct >= 40 ? "bg-accent" : "bg-state-warn"
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-line rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-ink-muted tabular-nums">{pct}%</span>
    </div>
  )
}

export default function TeamProgress({ members }: { members: TeamMember[] }) {
  return (
    <div className="bg-surface rounded-xl border border-line overflow-hidden">
      <div className="px-6 py-4 border-b border-line-soft">
        <h3 className="font-semibold text-ink">Прогресс команды</h3>
        <p className="text-xs text-ink-subtle mt-0.5">{members.length} сотрудников</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-canvas-100 text-xs text-ink-subtle uppercase tracking-wider">
              <th className="px-6 py-3 text-left font-medium">Сотрудник</th>
              <th className="px-6 py-3 text-left font-medium">Грейд</th>
              <th className="px-6 py-3 text-left font-medium">KPI</th>
              <th className="px-6 py-3 text-left font-medium">Курсы</th>
              <th className="px-6 py-3 text-left font-medium">Прогресс</th>
              <th className="px-6 py-3 text-left font-medium">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {members.map((m) => (
              <tr key={m.id} className={`hover:bg-canvas-100/50 transition-colors ${m.risk_flag ? "bg-state-danger/5" : ""}`}>
                <td className="px-6 py-3.5">
                  <div className="font-medium text-ink">{m.name}</div>
                  <div className="text-xs text-ink-subtle">{m.department}</div>
                </td>
                <td className="px-6 py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${GRADE_COLORS[m.grade] || "bg-line text-ink-muted"}`}>
                    {GRADE_LABELS[m.grade] || m.grade}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  <KpiBar score={m.kpi_score} />
                </td>
                <td className="px-6 py-3.5">
                  <div className="text-ink-muted tabular-nums">
                    <span className="text-state-success font-medium">{m.courses_completed}</span>
                    <span className="text-ink-subtle"> / {m.courses_total}</span>
                  </div>
                  {m.courses_in_progress > 0 && (
                    <div className="text-xs text-ink-subtle">{m.courses_in_progress} в работе</div>
                  )}
                </td>
                <td className="px-6 py-3.5">
                  <ProgressBar pct={m.avg_progress_pct} />
                </td>
                <td className="px-6 py-3.5">
                  {m.risk_flag ? (
                    <span className="inline-flex items-center gap-1 text-xs text-state-danger font-medium bg-state-danger/10 px-2 py-0.5 rounded">
                      ⚠ Отстаёт
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-state-success font-medium">
                      ✓ В норме
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
