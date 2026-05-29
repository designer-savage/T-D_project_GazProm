import { Competency } from "@/lib/types"

function IconCheck({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
}

export default function SkillGapCard({ competency }: { competency: Competency }) {
  const pct = Math.round((competency.current_level / competency.target_level) * 100)
  const color = competency.gap === 0 ? "var(--green)" : competency.gap === 1 ? "var(--yellow)" : "var(--red)"

  return (
    <div
      className="glass-card glass-card-hover"
      style={{ padding: "14px 18px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-1)" }}>{competency.skill_name}</span>
        {competency.gap === 0 ? (
          <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
            <IconCheck size={14} /> Достигнуто
          </span>
        ) : (
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>gap: {competency.gap}</span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 5, borderRadius: 5, background: "var(--glass-border)", overflow: "hidden" }}>
          <div style={{
            width: `${Math.min(pct, 100)}%`, height: "100%",
            borderRadius: 5, background: color,
            transition: "width 0.6s ease",
          }} />
        </div>
        <span style={{ fontSize: 12, color: "var(--text-3)", fontVariantNumeric: "tabular-nums", minWidth: 40, textAlign: "right" }}>
          {competency.current_level} / {competency.target_level}
        </span>
      </div>
    </div>
  )
}
