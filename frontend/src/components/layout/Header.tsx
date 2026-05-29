"use client"
import { useTheme } from "@/context/ThemeContext"
import { useProfile } from "@/context/ProfileContext"

const GRADE_LABELS: Record<string, string> = {
  junior:    "Junior",
  middle:    "Middle",
  senior:    "Senior",
  lead:      "Lead",
  principal: "Principal",
}

const GRADE_BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  junior:    { bg: "var(--yellow-soft)",           color: "var(--yellow)" },
  middle:    { bg: "var(--accent-soft)",            color: "var(--accent)" },
  senior:    { bg: "var(--green-soft)",             color: "var(--green)" },
  lead:      { bg: "var(--green-soft)",             color: "var(--green)" },
  principal: { bg: "rgba(139,92,246,0.12)",         color: "#A78BFA" },
}

function IconSparkle({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
    </svg>
  )
}

function IconMenu({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <rect x="3" y="5" width="18" height="2.5" rx="1.25" />
      <rect x="3" y="10.75" width="18" height="2.5" rx="1.25" />
      <rect x="3" y="16.5" width="18" height="2.5" rx="1.25" />
    </svg>
  )
}

function IconSun({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="5" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </g>
    </svg>
  )
}

function IconMoon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M21.64 13A9 9 0 0111 2.36 9 9 0 1021.64 13z" />
    </svg>
  )
}

function IconSwitch({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M12 4V1L8 5l4 4V6a6 6 0 016 6 5.87 5.87 0 01-.68 2.74l1.46 1.46A7.97 7.97 0 0020 12a8 8 0 00-8-8zm0 14a6 6 0 01-6-6c0-.93.22-1.81.6-2.59L5.14 7.95A7.97 7.97 0 004 12a8 8 0 008 8v3l4-4-4-4v3z" />
    </svg>
  )
}

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggle: toggleTheme } = useTheme()
  const { profile, toggleRole } = useProfile()
  const isDark = theme === "dark"

  const gradeColors = GRADE_BADGE_COLORS[profile?.grade ?? "junior"] ?? GRADE_BADGE_COLORS.junior
  const roleLabel = profile?.role === "manager" ? "Руководитель" : profile?.role === "admin" ? "HR BP" : "Сотрудник"

  const btnStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer",
    background: "transparent", color: "var(--text-2)",
    transition: "all 0.2s",
  }

  return (
    <header style={{
      height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", gap: 12, flexShrink: 0, position: "sticky", top: 0, zIndex: 50,
      background: "var(--glass-bg-elevated)",
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      borderBottom: "1px solid var(--glass-border)",
    }}>
      {/* Left: hamburger + logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          style={btnStyle}
          onClick={onMenuClick}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--glass-bg-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--text-1)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; }}
        >
          <IconMenu size={20} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff",
          }}>
            <IconSparkle size={14} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", lineHeight: 1.2 }}>T&D Platform</div>
            <div style={{ fontSize: 10, color: "var(--text-3)", lineHeight: 1.2 }}>Газпром Нефть ИТ</div>
          </div>
        </div>
      </div>

      {/* Right: theme toggle + profile + role switch */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          style={{ ...btnStyle, width: 34, height: 34, borderRadius: 10 }}
          onClick={toggleTheme}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--glass-bg-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--text-1)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; }}
          title={isDark ? "Светлая тема" : "Тёмная тема"}
        >
          {isDark ? <IconSun size={17} /> : <IconMoon size={17} />}
        </button>

        {profile && (
          <>
            <div style={{ textAlign: "right", marginLeft: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>{profile.name}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, marginTop: 1 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "1px 7px", borderRadius: 6,
                  fontSize: 10, fontWeight: 600,
                  background: gradeColors.bg, color: gradeColors.color,
                }}>
                  {GRADE_LABELS[profile.grade] ?? profile.grade}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-3)" }}>{roleLabel}</span>
              </div>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "var(--accent-soft)", border: "1px solid var(--accent-glow)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 600, color: "var(--accent)",
            }}>
              {profile.name[0]}
            </div>
            <button
              style={{
                ...btnStyle, width: "auto", padding: "0 10px", gap: 5,
                fontSize: 11, color: "var(--text-3)", borderRadius: 8,
                border: "1px solid var(--glass-border)",
              }}
              onClick={toggleRole}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = "var(--glass-bg-hover)"
                el.style.borderColor = "var(--glass-border-hover)"
                el.style.color = "var(--text-1)"
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = "transparent"
                el.style.borderColor = "var(--glass-border)"
                el.style.color = "var(--text-3)"
              }}
            >
              <IconSwitch size={13} />
              <span>Роль</span>
            </button>
          </>
        )}
      </div>
    </header>
  )
}
