"use client"
import { useState, useEffect } from "react"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import TeamProgress from "@/components/dashboard/TeamProgress"
import { api } from "@/lib/api"
import { Employee, DashboardData } from "@/lib/types"
import { mockEmployee, mockDashboard } from "@/mock/employee"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"
const MANAGER_ID = process.env.NEXT_PUBLIC_DEMO_MANAGER_ID || "mgr_001"

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

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header employee={manager} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {data ? (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="text-2xl font-bold text-gray-900">{data.team_size}</div>
                  <div className="text-sm text-gray-500 mt-1">Сотрудников в команде</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="text-2xl font-bold text-blue-600">{Math.round(data.avg_progress * 100)}%</div>
                  <div className="text-sm text-gray-500 mt-1">Средний прогресс обучения</div>
                </div>
                <div className={`rounded-xl border p-5 ${riskCount > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
                  <div className={`text-2xl font-bold ${riskCount > 0 ? "text-red-600" : "text-gray-900"}`}>{riskCount}</div>
                  <div className="text-sm text-gray-500 mt-1">Сотрудников в зоне риска</div>
                </div>
              </div>

              <TeamProgress members={data.members} />
            </>
          ) : (
            <div className="text-center text-gray-400 py-20">Загрузка...</div>
          )}
        </main>
      </div>
    </div>
  )
}
