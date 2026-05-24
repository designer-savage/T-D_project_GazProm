"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV = [
  { href: "/chat", label: "Чат с агентом", icon: "💬" },
  { href: "/career", label: "Карьерный трек", icon: "📈" },
  { href: "/onboarding", label: "Онбординг", icon: "🚀" },
  { href: "/dashboard", label: "Дашборд команды", icon: "📊" },
]

const PRESETS = [
  "Хочу стать тимлидом через год",
  "Что пройти за квартал?",
  "Как оформить командировку?",
  "Что нужно для перехода на Senior?",
]

interface SidebarProps {
  onPreset?: (text: string) => void
}

export default function Sidebar({ onPreset }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-text flex flex-col">
      <div className="px-6 py-5 border-b border-sidebar-line">
        <span className="text-lg font-semibold tracking-tight text-white">T&D Platform</span>
        <span className="block text-xs text-sidebar-muted mt-0.5">Газпром Нефть ИТ</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === item.href
                ? "bg-accent text-accent-ink"
                : "text-sidebar-text hover:bg-sidebar-elev"
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {onPreset && (
        <div className="px-4 py-4 border-t border-sidebar-line">
          <p className="text-xs text-sidebar-muted mb-2 uppercase tracking-wider">Быстрые запросы</p>
          <div className="space-y-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => onPreset(p)}
                className="w-full text-left text-xs text-sidebar-text hover:text-white hover:bg-sidebar-elev px-2 py-1.5 rounded transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
