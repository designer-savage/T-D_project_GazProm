"use client"
import { useState } from "react"
import { TeamMember } from "@/lib/types"
import OneOnOneModal from "./OneOnOneModal"

const GRADE_LABELS: Record<string, string> = {
  junior: "Junior", middle: "Middle", senior: "Senior", lead: "Lead", principal: "Principal",
}

const GRADE_BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  junior:    { bg: "var(--yellow-soft)", color: "var(--yellow)" },
  middle:    { bg: "var(--accent-soft)", color: "var(--accent)" },
  senior:    { bg: "var(--green-soft)",  color: "var(--green)" },
  lead:      { bg: "var(--green-soft)",  color: "var(--green)" },
  principal: { bg: "rgba(139,92,246,0.12)", color: "#A78BFA" },
}

function IconCheck({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
}

function IconAlert({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" /></svg>
}

function IconCalendar({ size = 12 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" /></svg>
}

function KpiBar({ score }: { score: number | null }) {
  if (score === null) return <span style={{ color: "var(--text-3)", fontSize: 12 }}>—</span>
  const pct = Math.round(score * 100)
  const color = pct >= 80 ? "var(--green)" : pct >= 65 ? "var(--yellow)" : "var(--red)"
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 52, height: 5, borderRadius: 5, background: "var(--glass-border)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 5, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontSize: 12, color: "var(--text-2)", fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
    </div>
  )
}

function ProgressBar({ pct }: { pct: number }) {
  const color = pct >= 70 ? "var(--green)" : pct >= 40 ? "var(--accent)" : "var(--yellow)"
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 56, height: 5, borderRadius: 5, background: "var(--glass-border)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 5, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontSize: 12, color: "var(--text-3)", fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
    </div>
  )
}

export default function TeamProgress({ members }: { members: TeamMember[] }) {
  const [oneOnOne, setOneOnOne] = useState<TeamMember | null>(null)

  return (
    <>
      <div className="glass-card anim-fade-up" style={{ padding: 0, overflow: "hidden", animationDelay: "0.15s" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--glass-border)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)" }}>Прогресс команды</h3>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 3 }}>{members.length} сотрудников</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Сотрудник", "Грейд", "KPI", "Курсы", "Прогресс", "Статус", "1-on-1"].map((h) => (
                  <th key={h} style={{
                    padding: "10px 18px", textAlign: "left", fontSize: 11,
                    fontWeight: 600, color: "var(--text-3)",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    borderBottom: "1px solid var(--glass-border)",
                    background: "var(--glass-bg)",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const gradeColors = GRADE_BADGE_COLORS[m.grade] ?? GRADE_BADGE_COLORS.junior
                return (
                  <tr
                    key={m.id}
                    style={{
                      borderBottom: "1px solid var(--glass-border)",
                      background: m.risk_flag ? "var(--red-soft)" : "transparent",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={e => { if (!m.risk_flag) (e.currentTarget as HTMLElement).style.background = "var(--glass-bg-hover)" }}
                    onMouseLeave={e => { if (!m.risk_flag) (e.currentTarget as HTMLElement).style.background = "transparent" }}
                  >
                    <td style={{ padding: "12px 18px" }}>
                      <div style={{ fontWeight: 500, color: "var(--text-1)" }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{m.department}</div>
                    </td>
                    <td style={{ padding: "12px 18px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center",
                        padding: "2px 10px", borderRadius: 6,
                        fontSize: 12, fontWeight: 600,
                        background: gradeColors.bg, color: gradeColors.color,
                      }}>
                        {GRADE_LABELS[m.grade] ?? m.grade}
                      </span>
                    </td>
                    <td style={{ padding: "12px 18px" }}>
                      <KpiBar score={m.kpi_score} />
                    </td>
                    <td style={{ padding: "12px 18px" }}>
                      <div style={{ fontVariantNumeric: "tabular-nums" }}>
                        <span style={{ color: "var(--green)", fontWeight: 600 }}>{m.courses_completed}</span>
                        <span style={{ color: "var(--text-3)" }}> / {m.courses_total}</span>
                      </div>
                      {m.courses_in_progress > 0 && (
                        <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{m.courses_in_progress} в работе</div>
                      )}
                    </td>
                    <td style={{ padding: "12px 18px" }}>
                      <ProgressBar pct={m.avg_progress_pct} />
                    </td>
                    <td style={{ padding: "12px 18px" }}>
                      {m.risk_flag ? (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 12, fontWeight: 500, color: "var(--red)",
                          background: "var(--red-soft)", padding: "3px 10px", borderRadius: 6,
                        }}>
                          <IconAlert size={13} /> Отстаёт
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 500, color: "var(--green)" }}>
                          <IconCheck size={14} /> В норме
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 18px" }}>
                      <button
                        onClick={() => setOneOnOne(m)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "4px 10px", borderRadius: 8,
                          border: "1px solid var(--accent-glow)", cursor: "pointer",
                          background: "var(--accent-soft)", color: "var(--accent)",
                          fontSize: 12, fontWeight: 500, transition: "all 0.2s",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "#fff" }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--accent-soft)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)" }}
                      >
                        <IconCalendar size={12} /> Подготовиться
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {oneOnOne && (
        <OneOnOneModal
          employeeId={oneOnOne.id}
          employeeName={oneOnOne.name}
          onClose={() => setOneOnOne(null)}
        />
      )}
    </>
  )
}
