"use client"
import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useProfile } from "@/context/ProfileContext"

const NAV = [
  { id: "/chat",       label: "Чат с агентом",   icon: IconChat },
  { id: "/career",     label: "Карьерный трек",   icon: IconCareer },
  { id: "/onboarding", label: "Онбординг",        icon: IconRocket },
  { id: "/dashboard",  label: "Дашборд команды",  icon: IconDashboard },
  { id: "/admin",      label: "Управление",        icon: IconSettings, adminOnly: true },
]

const PRESETS_EMP = [
  "Что нужно для перехода на Lead?",
  "Какие курсы пройти в этом квартале?",
  "Как прокачать System Design?",
  "Оцени мой карьерный прогресс",
]

const PRESETS_MGR = [
  "Как развить навыки управления командой?",
  "Какие компетенции нужны Principal-инженеру?",
  "Как выстроить систему 1-on-1?",
  "Что почитать по архитектурным решениям?",
]

function IconSparkle({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" /></svg>
}
function IconClose({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M18.3 5.71a1 1 0 00-1.42 0L12 10.59 7.12 5.71A1 1 0 105.7 7.12L10.59 12l-4.88 4.88a1 1 0 101.42 1.42L12 13.41l4.88 4.88a1 1 0 001.42-1.42L13.41 12l4.88-4.88a1 1 0 000-1.41z" /></svg>
}
function IconChevron({ size = 12 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M9.29 6.71a1 1 0 000 1.41L13.17 12l-3.88 3.88a1 1 0 101.42 1.42l4.59-4.59a1 1 0 000-1.42L10.71 6.7a1 1 0 00-1.42.01z" /></svg>
}
function IconChat({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M20 2H4a2 2 0 00-2 2v12a2 2 0 002 2h14l4 4V4a2 2 0 00-2-2z" /></svg>
}
function IconCareer({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><rect x="4" y="13" width="4" height="8" rx="1" /><rect x="10" y="9" width="4" height="12" rx="1" /><rect x="16" y="4" width="4" height="17" rx="1" /></svg>
}
function IconRocket({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M12 2C8.5 5.5 7 9.5 7 13a5 5 0 0010 0c0-3.5-1.5-7.5-5-11z" /><circle cx="12" cy="13" r="2" fill="var(--bg, #070B15)" /><path d="M7.5 16.5c-1.2.8-2.5 1-2.5 1s.2-1.3 1-2.5l1.5 1.5zM16.5 16.5c1.2.8 2.5 1 2.5 1s-.2-1.3-1-2.5l-1.5 1.5z" /></svg>
}
function IconDashboard({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="4" rx="1.5" /><rect x="13" y="9" width="8" height="12" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /></svg>
}
function IconSettings({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M19.14 12.94a7.07 7.07 0 000-1.88l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.04 7.04 0 00-1.62-.94l-.36-2.54A.48.48 0 0013.93 2h-3.86a.48.48 0 00-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.71 8.47a.49.49 0 00.12.61l2.03 1.58a7.07 7.07 0 000 1.88l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.49.37 1.03.7 1.62.94l.36 2.54c.05.24.26.41.48.41h3.86c.22 0 .43-.17.48-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 00-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1115.6 12 3.6 3.6 0 0112 15.6z" /></svg>
}

interface SidebarProps {
  open: boolean
  onClose: () => void
  onPreset?: (text: string) => void
}

export default function Sidebar({ open, onClose, onPreset }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin, isManager } = useProfile()
  const presets = isManager ? PRESETS_MGR : PRESETS_EMP
  const navItems = NAV.filter((n) => !n.adminOnly || isAdmin)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "var(--overlay-bg)",
          backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Panel */}
      <aside style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: 280, zIndex: 101,
        background: "var(--sidebar-bg)",
        backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
        borderRight: "1px solid var(--sidebar-border)",
        boxShadow: open ? "20px 0 60px rgba(0,0,0,0.25)" : "none",
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex", flexDirection: "column",
        overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 16px 16px 20px",
          borderBottom: "1px solid var(--glass-border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9, background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            }}>
              <IconSparkle size={15} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>T&D Platform</div>
              <div style={{ fontSize: 10, color: "var(--text-3)" }}>Газпром Нефть ИТ</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
              background: "transparent", color: "var(--text-3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--glass-bg-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--text-1)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
          >
            <IconClose size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {navItems.map((n) => {
            const Icon = n.icon
            const active = pathname === n.id
            return (
              <button
                key={n.id}
                onClick={() => { router.push(n.id); onClose() }}
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%",
                  padding: "10px 14px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: active ? "var(--accent-soft)" : "transparent",
                  color: active ? "var(--accent)" : "var(--text-2)",
                  fontSize: 14, fontWeight: active ? 600 : 400,
                  transition: "all 0.2s", textAlign: "left",
                  marginBottom: 2,
                }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "var(--glass-bg-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--text-1)"; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; } }}
              >
                <Icon size={18} /> {n.label}
              </button>
            )
          })}
        </nav>

        {/* Quick presets */}
        {onPreset && (
          <div style={{ padding: "12px 14px 16px", borderTop: "1px solid var(--glass-border)" }}>
            <div style={{
              fontSize: 10, color: "var(--text-3)",
              textTransform: "uppercase", letterSpacing: "0.08em",
              fontWeight: 600, marginBottom: 8, paddingLeft: 4,
            }}>
              Быстрые запросы
            </div>
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => { onPreset(p); onClose() }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 8,
                  border: "none", cursor: "pointer", background: "transparent",
                  color: "var(--text-2)", fontSize: 12, lineHeight: 1.4,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--glass-bg-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--text-1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; }}
              >
                <span>{p}</span>
                <IconChevron size={12} />
              </button>
            ))}
          </div>
        )}
      </aside>
    </>
  )
}
