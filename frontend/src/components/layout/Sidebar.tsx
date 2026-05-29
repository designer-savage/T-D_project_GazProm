"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageSquare, TrendingUp, Rocket, BarChart2, Sparkles, ChevronRight, Settings } from "lucide-react"
import { useProfile } from "@/context/ProfileContext"

const NAV = [
  { href: "/chat",       label: "Чат с агентом",    icon: MessageSquare, adminOnly: false },
  { href: "/career",     label: "Карьерный трек",    icon: TrendingUp,    adminOnly: false },
  { href: "/onboarding", label: "Онбординг",         icon: Rocket,        adminOnly: false },
  { href: "/dashboard",  label: "Дашборд команды",   icon: BarChart2,     adminOnly: false },
  { href: "/admin",      label: "Управление",        icon: Settings,      adminOnly: true  },
]

const PRESETS_EMPLOYEE = [
  "Что нужно для перехода на Lead?",
  "Какие курсы пройти в этом квартале?",
  "Как прокачать System Design?",
  "Оцени мой карьерный прогресс",
]

const PRESETS_MANAGER = [
  "Как развить навыки управления командой?",
  "Какие компетенции нужны Principal-инженеру?",
  "Как выстроить систему 1-on-1?",
  "Что почитать по архитектурным решениям?",
]

interface SidebarProps {
  onPreset?: (text: string) => void
}

export default function Sidebar({ onPreset }: SidebarProps) {
  const pathname = usePathname()
  const { isManager, isAdmin } = useProfile()
  const PRESETS = isManager ? PRESETS_MANAGER : PRESETS_EMPLOYEE

  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-text flex flex-col border-r border-sidebar-line">
      <div className="px-5 py-5 border-b border-sidebar-line">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight text-white">T&D Platform</span>
            <span className="block text-[11px] text-sidebar-muted leading-tight">Газпром Нефть ИТ</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.filter((item) => !item.adminOnly || isAdmin).map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                active
                  ? "bg-accent/15 text-accent font-medium"
                  : "text-sidebar-text hover:bg-sidebar-elev hover:text-white"
              }`}
            >
              <Icon size={16} className="flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {onPreset && (
        <div className="px-3 py-4 border-t border-sidebar-line">
          <p className="text-[10px] text-sidebar-muted mb-2.5 uppercase tracking-widest px-1">Быстрые запросы</p>
          <div className="space-y-1">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => onPreset(p)}
                className="w-full text-left text-xs text-sidebar-text hover:text-white hover:bg-sidebar-elev
                           px-3 py-2 rounded-lg transition-all duration-150 flex items-center justify-between group"
              >
                <span className="leading-snug">{p}</span>
                <ChevronRight size={12} className="flex-shrink-0 opacity-0 group-hover:opacity-40 transition-opacity ml-1" />
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
