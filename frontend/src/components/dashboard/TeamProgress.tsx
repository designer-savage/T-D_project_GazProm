import { TeamMember } from "@/lib/types"

const GRADE_LABELS: Record<string, string> = {
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  lead: "Lead",
}

export default function TeamProgress({ members }: { members: TeamMember[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Прогресс команды</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <th className="px-6 py-3 text-left">Сотрудник</th>
            <th className="px-6 py-3 text-left">Грейд</th>
            <th className="px-6 py-3 text-left">Курсы</th>
            <th className="px-6 py-3 text-left">Прогресс</th>
            <th className="px-6 py-3 text-left">Риск</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {members.map((m) => (
            <tr key={m.id} className={m.risk_flag ? "bg-red-50" : ""}>
              <td className="px-6 py-3 font-medium text-gray-900">{m.name}</td>
              <td className="px-6 py-3 text-gray-600">{GRADE_LABELS[m.grade] || m.grade}</td>
              <td className="px-6 py-3 text-gray-600">
                {m.courses_completed} / {m.courses_total}
              </td>
              <td className="px-6 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${m.avg_progress_pct > 50 ? "bg-green-500" : "bg-yellow-400"}`}
                      style={{ width: `${m.avg_progress_pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{m.avg_progress_pct}%</span>
                </div>
              </td>
              <td className="px-6 py-3">
                {m.risk_flag && (
                  <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                    ⚠ Отстаёт
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
