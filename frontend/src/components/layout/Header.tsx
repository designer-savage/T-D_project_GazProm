"use client"
import { Employee } from "@/lib/types"

const GRADE_LABELS: Record<string, string> = {
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  lead: "Lead",
}

interface HeaderProps {
  employee: Employee | null
  onRoleSwitch?: () => void
}

export default function Header({ employee, onRoleSwitch }: HeaderProps) {
  return (
    <header className="h-14 bg-canvas-100 border-b border-line px-6 flex items-center justify-between">
      <div className="text-sm text-ink-muted">
        {employee ? (
          <span>
            <span className="font-medium text-ink">{employee.department}</span>
          </span>
        ) : (
          "Загрузка..."
        )}
      </div>

      {employee && (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-ink">{employee.name}</div>
            <div className="text-xs text-ink-muted">
              {GRADE_LABELS[employee.grade]} · {employee.role === "manager" ? "Руководитель" : "Сотрудник"}
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-accent text-accent-ink flex items-center justify-center text-sm font-medium">
            {employee.name[0]}
          </div>
          {onRoleSwitch && (
            <button
              onClick={onRoleSwitch}
              className="text-xs text-ink-muted hover:text-ink border border-line px-2 py-1 rounded hover:bg-surface-muted"
            >
              Сменить роль
            </button>
          )}
        </div>
      )}
    </header>
  )
}
