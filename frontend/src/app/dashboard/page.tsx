"use client"
import { useState, useEffect } from "react"
import AppShell from "@/components/layout/AppShell"
import TeamProgress from "@/components/dashboard/TeamProgress"
import { api } from "@/lib/api"
import { DashboardData, SkillGap } from "@/lib/types"
import { mockDashboard } from "@/mock/employee"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"
const MANAGER_ID = process.env.NEXT_PUBLIC_DEMO_MANAGER_ID || "mgr_001"

function StatCard({
  value,
  label,
  sub,
  color = "var(--text-1)",
  delay = 0,
}: {
  value: string
  label: string
  sub?: string
  color?: string
  delay?: number
}) {
  return (
    <div className="glass-card anim-fade-up" style={{ padding: "20px 24px", animationDelay: `${delay}s` }}>
      <div style={{ fontSize: 28, fontWeight: 700, color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function SkillGapsPanel({ gaps }: { gaps: SkillGap[] }) {
  const maxGap = Math.max(...gaps.map((g) => g.total_gap), 1)
  return (
    <div className="glass-card anim-fade-up" style={{ padding: 0, overflow: "hidden", animationDelay: "0.25s" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--glass-border)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>Топ пробелов в навыках</h3>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>По всей команде</div>
      </div>
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {gaps.map((g) => (
          <div key={g.skill_name}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>{g.skill_name}</span>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>{g.affected} чел.</span>
            </div>
            <div style={{ width: "100%", height: 5, borderRadius: 5, background: "var(--glass-border)", overflow: "hidden" }}>
              <div style={{ width: `${(g.total_gap / maxGap) * 100}%`, height: "100%", background: "var(--red)", opacity: 0.7, borderRadius: 5, transition: "width 0.6s ease" }} />
            </div>
          </div>
        ))}
        {gaps.length === 0 && <p style={{ fontSize: 13, color: "var(--text-3)", textAlign: "center", padding: "16px 0" }}>Пробелов нет</p>}
      </div>
    </div>
  )
}

function CoursesStatsPanel({ stats }: { stats: DashboardData["courses_stats"] }) {
  const total = stats.completed + stats.in_progress + stats.not_started || 1
  const items = [
    { label: "Завершено",  val: stats.completed,   color: "var(--green)" },
    { label: "В процессе", val: stats.in_progress,  color: "var(--accent)" },
    { label: "Не начато",  val: stats.not_started,  color: "var(--text-3)" },
  ]
  return (
    <div className="glass-card anim-fade-up" style={{ padding: 0, overflow: "hidden", animationDelay: "0.2s" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--glass-border)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>Статус курсов</h3>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>По всей команде</div>
      </div>
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((it) => (
          <div key={it.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: it.color, display: "inline-block" }} />
              <span style={{ fontSize: 13, color: "var(--text-1)" }}>{it.label}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", fontVariantNumeric: "tabular-nums" }}>{it.val}</span>
          </div>
        ))}
        {/* Stacked bar */}
        <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "var(--glass-border)", marginTop: 4, gap: 2 }}>
          <div style={{ width: `${(stats.completed / total) * 100}%`, background: "var(--green)", borderRadius: "4px 0 0 4px" }} />
          <div style={{ width: `${(stats.in_progress / total) * 100}%`, background: "var(--accent)" }} />
          <div style={{ flex: 1, borderRadius: "0 4px 4px 0" }} />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    if (USE_MOCK) { setData(mockDashboard); return }
    api.getDashboard(MANAGER_ID).then(setData).catch(() => setData(mockDashboard))
  }, [])

  const riskCount = data?.members.filter((m) => m.risk_flag).length ?? 0
  const kpiPct = data ? Math.round(data.avg_kpi * 100) : 0
  const progressPct = data ? Math.round(data.avg_progress * 100) : 0

  return (
    <AppShell>
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
          {data ? (
            <>
              {/* Stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                <StatCard value={String(data.team_size)} label="Сотрудников" sub="в команде" delay={0} />
                <StatCard
                  value={`${kpiPct}%`} label="Средний KPI" sub="за последний квартал"
                  color={kpiPct >= 80 ? "var(--green)" : kpiPct >= 65 ? "var(--yellow)" : "var(--red)"}
                  delay={0.05}
                />
                <StatCard
                  value={`${progressPct}%`} label="Средний прогресс" sub="по всем курсам"
                  color={progressPct >= 60 ? "var(--green)" : "var(--yellow)"}
                  delay={0.1}
                />
                <StatCard
                  value={String(riskCount)} label="В зоне риска" sub="отстают от плана"
                  color={riskCount > 0 ? "var(--red)" : "var(--text-1)"}
                  delay={0.15}
                />
              </div>

              {/* Main grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
                <TeamProgress members={data.members} />
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <CoursesStatsPanel stats={data.courses_stats} />
                  <SkillGapsPanel gaps={data.skill_gaps} />
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 192 }}>
              <div style={{ fontSize: 13, color: "var(--text-3)" }}>Загрузка данных...</div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
