"use client"
import { Employee } from "@/lib/types"

const GRADE_LABELS: Record<string, string> = {
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  lead:   "Lead",
}

interface HeaderProps {
  employee: Employee | null
  onRoleSwitch?: () => void
}

export default function Header({ employee, onRoleSwitch }: HeaderProps) {
  return (
    <header className="h-14 bg-canvas-100 border-b border-line px-6 flex items-center justify-between flex-shrink-0">
      <div className="text-sm text-ink-muted">
        {employee ? (
          <span className="font-medium text-ink">{employee.department}</span>
        ) : (
          <span className="w-32 h-4 bg-surface rounded animate-pulse inline-block" />
        )}
      </div>

      {employee && (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-ink">{employee.name}</div>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className="text-xs bg-accent/15 text-accent px-1.5 py-0.5 rounded-full font-medium">
                {GRADE_LABELS[employee.grade]}
              </span>
              <span className="text-xs text-ink-muted">
                {employee.role === "manager" ? "Руководитель" : "Сотрудник"}
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 text-accent
                          flex items-center justify-center text-sm font-semibold ring-2 ring-accent/10">
            {employee.name[0]}
          </div>
          {onRoleSwitch && (
            <button
              onClick={onRoleSwitch}
              className="text-xs text-ink-muted hover:text-ink bg-surface border border-line
                         hover:bg-canvas-300 px-3 py-1.5 rounded-lg transition-all duration-150"
            >
              Сменить роль
            </button>
          )}
        </div>
      )}
    </header>
  )
}
