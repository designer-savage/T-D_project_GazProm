"use client"
import { useState, useEffect } from "react"
import AppShell from "@/components/layout/AppShell"
import CareerTrack from "@/components/career/CareerTrack"
import SkillGapCard from "@/components/career/SkillGapCard"
import { api } from "@/lib/api"
import { CareerTrack as CareerTrackType } from "@/lib/types"
import { useProfile } from "@/context/ProfileContext"
import { mockCareer } from "@/mock/employee"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

export default function CareerPage() {
  const [track, setTrack] = useState<CareerTrackType | null>(null)
  const { currentId } = useProfile()

  useEffect(() => {
    setTrack(null)
    if (USE_MOCK) { setTrack(mockCareer); return }
    api.getCareerTrack(currentId).then(setTrack).catch(() => setTrack(mockCareer))
  }, [currentId])

  const gaps = track?.competencies.filter((c) => c.gap > 0) ?? []
  const done = track?.competencies.filter((c) => c.gap === 0) ?? []
  const kpiPct = 85

  return (
    <AppShell>
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

          {track ? (
            <>
              <CareerTrack
                currentGrade={track.current_grade}
                targetGrade={track.target_grade}
                estimatedMonths={track.estimated_months}
              />

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="glass-card anim-fade-up" style={{ padding: "20px 24px", animationDelay: "0.1s" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: kpiPct >= 80 ? "var(--green)" : kpiPct >= 65 ? "var(--yellow)" : "var(--red)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{kpiPct}%</div>
                  <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 6 }}>Средний KPI</div>
                </div>
                <div className="glass-card anim-fade-up" style={{ padding: "20px 24px", animationDelay: "0.15s" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "var(--green)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{done.length} / {track.competencies.length}</div>
                  <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 6 }}>Целевых компетенций достигнуто</div>
                </div>
              </div>

              {gaps.length > 0 && (
                <div className="anim-fade-up" style={{ animationDelay: "0.2s" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 12 }}>Разрывы в компетенциях</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {gaps.map((c) => <SkillGapCard key={c.skill_name} competency={c} />)}
                  </div>
                </div>
              )}

              {done.length > 0 && (
                <div className="anim-fade-up" style={{ animationDelay: "0.3s" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 12 }}>Достигнутые компетенции</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {done.map((c) => <SkillGapCard key={c.skill_name} competency={c} />)}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", color: "var(--text-3)", padding: "80px 0" }}>Загрузка...</div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
