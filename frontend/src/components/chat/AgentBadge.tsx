import { AgentType } from "@/lib/types"

const AGENT_META: Record<AgentType, { label: string; color: string }> = {
  career: { label: "Агент карьеры", color: "bg-purple-100 text-purple-700" },
  learning: { label: "Агент обучения", color: "bg-green-100 text-green-700" },
  onboarding: { label: "Агент онбординга", color: "bg-blue-100 text-blue-700" },
}

export default function AgentBadge({ agent }: { agent: AgentType }) {
  const meta = AGENT_META[agent]
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${meta.color}`}>
      {meta.label}
    </span>
  )
}
