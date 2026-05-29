import { AgentType } from "@/lib/types"

const AGENT_META: Record<AgentType, { label: string; color: string }> = {
  career:     { label: "Агент карьеры",    color: "var(--accent)" },
  learning:   { label: "Агент обучения",   color: "var(--green)" },
  onboarding: { label: "Агент онбординга", color: "var(--yellow)" },
}

export default function AgentBadge({ agent }: { agent: AgentType }) {
  const meta = AGENT_META[agent]
  if (!meta) return null
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 600, color: meta.color,
      textTransform: "uppercase", letterSpacing: "0.05em",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color, opacity: 0.8, display: "inline-block" }} />
      {meta.label}
    </span>
  )
}
