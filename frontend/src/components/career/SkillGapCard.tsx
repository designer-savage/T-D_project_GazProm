import { Competency } from "@/lib/types"

export default function SkillGapCard({ competency }: { competency: Competency }) {
  const pct = Math.round((competency.current_level / competency.target_level) * 100)
  const gapColor = competency.gap === 0 ? "bg-green-500" : competency.gap === 1 ? "bg-yellow-500" : "bg-red-400"

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-gray-900">{competency.skill_name}</span>
        {competency.gap === 0 ? (
          <span className="text-xs text-green-600 font-medium">✓ Цель достигнута</span>
        ) : (
          <span className="text-xs text-gray-500">gap: {competency.gap}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${gapColor}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 w-16 text-right">
          {competency.current_level} / {competency.target_level}
        </span>
      </div>
    </div>
  )
}
