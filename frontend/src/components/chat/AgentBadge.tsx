import { AgentType } from "@/lib/types"

const AGENT_META: Record<AgentType, { label: string; color: string }> = {
  career:     { label: "Агент карьеры",    color: "bg-accent/10 text-accent border border-accent/20" },
  learning:   { label: "Агент обучения",   color: "bg-state-success/10 text-state-success border border-state-success/20" },
  onboarding: { label: "Агент онбординга", color: "bg-state-warn/10 text-state-warn border border-state-warn/20" },
}

export default function AgentBadge({ agent }: { agent: AgentType }) {
  const meta = AGENT_META[agent]
  return (
    <span className={`inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full ${meta.color}`}>
      {meta.label}
    </span>
  )
}
