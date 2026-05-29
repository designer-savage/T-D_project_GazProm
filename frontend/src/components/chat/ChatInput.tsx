"use client"
import { useState, useRef, KeyboardEvent } from "react"

function IconSend({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4l-1.41 1.41L15.17 10H4v2h11.17l-4.58 4.59L12 18l8-8z" transform="rotate(-90 12 12)" />
    </svg>
  )
}

interface Props {
  onSend: (text: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState("")
  const [focused, setFocused] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)
  const canSend = !!text.trim() && !disabled

  const handleSend = () => {
    if (!canSend) return
    onSend(text.trim())
    setText("")
    if (ref.current) ref.current.style.height = "auto"
  }

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 140) + "px"
  }

  return (
    <div style={{ padding: "8px 20px 16px", flexShrink: 0 }}>
      <div style={{
        position: "relative",
        background: "var(--glass-bg)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${focused && canSend ? "var(--glass-border-focus)" : "var(--glass-border)"}`,
        borderRadius: 18,
        boxShadow: "var(--glass-shadow-lg)",
        transition: "all 0.25s",
      }}>
        <textarea
          ref={ref}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          rows={1}
          placeholder="Задайте вопрос агенту..."
          style={{
            width: "100%", resize: "none", background: "transparent",
            border: "none", outline: "none",
            padding: "13px 52px 13px 18px",
            fontSize: 14, color: "var(--text-1)",
            lineHeight: 1.5, maxHeight: 140,
          }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            position: "absolute", right: 10, bottom: 10,
            width: 34, height: 34, borderRadius: 11,
            border: "none", cursor: canSend ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: canSend ? "var(--accent)" : "var(--glass-bg-elevated)",
            color: canSend ? "#fff" : "var(--text-3)",
            transition: "all 0.2s",
            boxShadow: canSend ? "0 4px 12px var(--accent-glow)" : "none",
          }}
          onMouseEnter={e => { if (canSend) (e.currentTarget as HTMLElement).style.background = "var(--accent-hover)" }}
          onMouseLeave={e => { if (canSend) (e.currentTarget as HTMLElement).style.background = "var(--accent)" }}
        >
          <IconSend size={16} />
        </button>
      </div>
      <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-3)", marginTop: 8 }}>
        Enter — отправить · Shift+Enter — перенос строки
      </p>
    </div>
  )
}
