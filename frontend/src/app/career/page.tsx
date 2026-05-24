"use client"
import { useState, useEffect } from "react"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import CareerTrack from "@/components/career/CareerTrack"
import SkillGapCard from "@/components/career/SkillGapCard"
import { api } from "@/lib/api"
import { Employee, CareerTrack as CareerTrackType } from "@/lib/types"
import { mockEmployee, mockCareer } from "@/mock/employee"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"
const EMPLOYEE_ID = process.env.NEXT_PUBLIC_DEMO_EMPLOYEE_ID || "emp_001"

export default function CareerPage() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [track, setTrack] = useState<CareerTrackType | null>(null)

  useEffect(() => {
    if (USE_MOCK) {
      setEmployee(mockEmployee)
      setTrack(mockCareer)
      return
    }
    Promise.all([
      api.getEmployee(EMPLOYEE_ID),
      api.getCareerTrack(EMPLOYEE_ID),
    ])
      .then(([emp, t]) => { setEmployee(emp); setTrack(t) })
      .catch(() => { setEmployee(mockEmployee); setTrack(mockCareer) })
  }, [])

  const gaps = track?.competencies.filter((c) => c.gap > 0) ?? []
  const done = track?.competencies.filter((c) => c.gap === 0) ?? []

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header employee={employee} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {track ? (
            <>
              <CareerTrack
                currentGrade={track.current_grade}
                targetGrade={track.target_grade}
                estimatedMonths={track.estimated_months}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="text-2xl font-bold text-blue-600">{employee?.kpi_score ? `${Math.round(employee.kpi_score * 100)}%` : "—"}</div>
                  <div className="text-sm text-gray-500 mt-1">Средний KPI</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="text-2xl font-bold text-green-600">{done.length} / {track.competencies.length}</div>
                  <div className="text-sm text-gray-500 mt-1">Целевых компетенций достигнуто</div>
                </div>
              </div>

              {gaps.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Разрывы в компетенциях</h3>
                  <div className="grid gap-3">
                    {gaps.map((c) => <SkillGapCard key={c.skill_name} competency={c} />)}
                  </div>
                </div>
              )}

              {done.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Достигнутые компетенции</h3>
                  <div className="grid gap-3">
                    {done.map((c) => <SkillGapCard key={c.skill_name} competency={c} />)}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-400 py-20">Загрузка...</div>
          )}
        </main>
      </div>
    </div>
  )
}
