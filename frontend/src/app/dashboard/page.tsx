"use client"
import { useState, useEffect } from "react"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import TeamProgress from "@/components/dashboard/TeamProgress"
import { api } from "@/lib/api"
import { Employee, DashboardData, SkillGap } from "@/lib/types"
import { mockEmployee, mockDashboard } from "@/mock/employee"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"
const MANAGER_ID = process.env.NEXT_PUBLIC_DEMO_MANAGER_ID || "mgr_001"

function StatCard({
  value,
  label,
  sub,
  variant = "default",
}: {
  value: string
  label: string
  sub?: string
  variant?: "default" | "success" | "warning" | "danger"
}) {
  const colors = {
    default: "text-ink",
    success: "text-state-success",
    warning: "text-state-warn",
    danger: "text-state-danger",
  }
  return (
    <div className="bg-surface rounded-xl border border-line p-5">
      <div className={`text-2xl font-bold tabular-nums ${colors[variant]}`}>{value}</div>
      <div className="text-sm text-ink-muted mt-1">{label}</div>
      {sub && <div className="text-xs text-ink-subtle mt-0.5">{sub}</div>}
    </div>
  )
}

function SkillGapsPanel({ gaps }: { gaps: SkillGap[] }) {
  const maxGap = Math.max(...gaps.map((g) => g.total_gap), 1)
  return (
    <div className="bg-surface rounded-xl border border-line overflow-hidden">
      <div className="px-5 py-4 border-b border-line-soft">
        <h3 className="font-semibold text-ink">Топ пробелов в навыках</h3>
        <p className="text-xs text-ink-subtle mt-0.5">По всей команде</p>
      </div>
      <div className="px-5 py-4 space-y-3">
        {gaps.map((g) => (
          <div key={g.skill_name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-ink font-medium">{g.skill_name}</span>
              <span className="text-xs text-ink-subtle">{g.affected} чел.</span>
            </div>
            <div className="w-full bg-line rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-state-danger/70"
                style={{ width: `${(g.total_gap / maxGap) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {gaps.length === 0 && (
          <p className="text-sm text-ink-subtle text-center py-4">Пробелов нет</p>
        )}
      </div>
    </div>
  )
}

function CoursesStatsPanel({ stats }: { stats: DashboardData["courses_stats"] }) {
  const total = stats.completed + stats.in_progress + stats.not_started || 1
  return (
    <div className="bg-surface rounded-xl border border-line overflow-hidden">
      <div className="px-5 py-4 border-b border-line-soft">
        <h3 className="font-semibold text-ink">Статус курсов</h3>
        <p className="text-xs text-ink-subtle mt-0.5">По всей команде</p>
      </div>
      <div className="px-5 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-state-success inline-block" />
            <span className="text-sm text-ink">Завершено</span>
          </div>
          <span className="text-sm font-semibold text-ink tabular-nums">{stats.completed}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent inline-block" />
            <span className="text-sm text-ink">В процессе</span>
          </div>
          <span className="text-sm font-semibold text-ink tabular-nums">{stats.in_progress}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-line inline-block" />
            <span className="text-sm text-ink">Не начато</span>
          </div>
          <span className="text-sm font-semibold text-ink tabular-nums">{stats.not_started}</span>
        </div>
        <div className="pt-2">
          <div className="w-full h-2 rounded-full bg-line flex overflow-hidden gap-0.5">
            <div
              className="h-full bg-state-success rounded-l-full"
              style={{ width: `${(stats.completed / total) * 100}%` }}
            />
            <div
              className="h-full bg-accent"
              style={{ width: `${(stats.in_progress / total) * 100}%` }}
            />
            <div
              className="h-full bg-line-soft rounded-r-full flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [manager, setManager] = useState<Employee | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    if (USE_MOCK) {
      setManager({ ...mockEmployee, role: "manager", name: "Павел Соколов", grade: "lead" })
      setData(mockDashboard)
      return
    }
    Promise.all([api.getEmployee(MANAGER_ID), api.getDashboard(MANAGER_ID)])
      .then(([emp, dash]) => { setManager(emp); setData(dash) })
      .catch(() => {
        setManager({ ...mockEmployee, role: "manager", name: "Павел Соколов", grade: "lead" })
        setData(mockDashboard)
      })
  }, [])

  const riskCount = data?.members.filter((m) => m.risk_flag).length ?? 0
  const kpiPct = data ? Math.round(data.avg_kpi * 100) : 0
  const progressPct = data ? Math.round(data.avg_progress * 100) : 0

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header employee={manager} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-canvas-100">
          {data ? (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  value={String(data.team_size)}
                  label="Сотрудников"
                  sub="в команде"
                />
                <StatCard
                  value={`${kpiPct}%`}
                  label="Средний KPI"
                  sub="за последний квартал"
                  variant={kpiPct >= 80 ? "success" : kpiPct >= 65 ? "warning" : "danger"}
                />
                <StatCard
                  value={`${progressPct}%`}
                  label="Средний прогресс"
                  sub="по всем курсам"
                  variant={progressPct >= 60 ? "success" : "warning"}
                />
                <StatCard
                  value={String(riskCount)}
                  label="В зоне риска"
                  sub="отстают от плана"
                  variant={riskCount > 0 ? "danger" : "default"}
                />
              </div>

              {/* Main content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <TeamProgress members={data.members} />
                </div>
                <div className="space-y-4">
                  <CoursesStatsPanel stats={data.courses_stats} />
                  <SkillGapsPanel gaps={data.skill_gaps} />
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48">
              <div className="text-ink-subtle text-sm">Загрузка данных...</div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
