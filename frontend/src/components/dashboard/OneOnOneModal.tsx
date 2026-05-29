"use client"
import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { streamOneOnOnePrep } from "@/lib/api"
import { useProfile } from "@/context/ProfileContext"

function IconX({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 5.71a1 1 0 00-1.42 0L12 10.59 7.12 5.71A1 1 0 105.7 7.12L10.59 12l-4.88 4.88a1 1 0 101.42 1.42L12 13.41l4.88 4.88a1 1 0 001.42-1.42L13.41 12l4.88-4.88a1 1 0 000-1.41z" /></svg>
}

function IconCopy({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4C3 1 2 2 2 3v14h2V3h12V1zm3 4H8C7 5 6 6 6 7v14c0 1 1 2 2 2h11c1 0 2-1 2-2V7c0-1-1-2-2-2zm0 16H8V7h11v14z" /></svg>
}

function IconCheck({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
}

interface Props {
  employeeId: string
  employeeName: string
  onClose: () => void
}

export default function OneOnOneModal({ employeeId, employeeName, onClose }: Props) {
  const { currentId } = useProfile()
  const [content, setContent] = useState("")
  const [isStreaming, setIsStreaming] = useState(true)
  const [copied, setCopied] = useState(false)
  const accRef = useRef("")

  useEffect(() => {
    let cancelled = false

    async function fetchBrief() {
      try {
        const res = await streamOneOnOnePrep(currentId, employeeId)
        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done || cancelled) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""
          let eventType = ""
          for (const line of lines) {
            if (line.startsWith("event: ")) eventType = line.slice(7).trim()
            else if (line.startsWith("data: ") && eventType === "token") {
              const data = JSON.parse(line.slice(6))
              accRef.current += data.text
              if (!cancelled) setContent(accRef.current)
            }
          }
        }
      } finally {
        if (!cancelled) setIsStreaming(false)
      }
    }

    fetchBrief()
    return () => { cancelled = true }
  }, [currentId, employeeId])

  async function handleCopy() {
    await navigator.clipboard.writeText(accRef.current)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--overlay-bg)",
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="glass-card anim-scale" style={{
        position: "relative", width: "100%", maxWidth: 640,
        margin: "0 16px", padding: 0,
        display: "flex", flexDirection: "column",
        maxHeight: "85vh", borderRadius: 20,
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid var(--glass-border)", flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)" }}>Подготовка к 1-on-1</h2>
            <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{employeeName}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={handleCopy}
              disabled={isStreaming || !content}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 8, border: "none", cursor: (!isStreaming && content) ? "pointer" : "default",
                background: "transparent", color: copied ? "var(--green)" : "var(--text-2)",
                fontSize: 12, fontWeight: 500, transition: "all 0.2s",
                opacity: (isStreaming || !content) ? 0.4 : 1,
              }}
              onMouseEnter={e => { if (!isStreaming && content) (e.currentTarget as HTMLElement).style.color = "var(--text-1)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = copied ? "var(--green)" : "var(--text-2)" }}
            >
              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              {copied ? "Скопировано" : "Скопировать"}
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
                background: "transparent", color: "var(--text-3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--glass-bg-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--text-1)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-3)" }}
            >
              <IconX size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
          {isStreaming && !content && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-2)", fontSize: 14 }}>
              <div style={{ display: "flex", gap: 5 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "var(--text-3)",
                    animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
                  }} />
                ))}
              </div>
              Генерирую бриф...
            </div>
          )}
          {content && (
            <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-1)" }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p:      ({ children }) => <p style={{ marginBottom: 10, color: "var(--text-2)" }}>{children}</p>,
                  strong: ({ children }) => <strong style={{ fontWeight: 600, color: "var(--text-1)" }}>{children}</strong>,
                  h1:     ({ children }) => <h1 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)", marginBottom: 8, marginTop: 16 }}>{children}</h1>,
                  h2:     ({ children }) => <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 6, marginTop: 12 }}>{children}</h2>,
                  h3:     ({ children }) => <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 4, marginTop: 10 }}>{children}</h3>,
                  ul:     ({ children }) => <ul style={{ paddingLeft: 16, marginBottom: 8, color: "var(--text-2)" }}>{children}</ul>,
                  ol:     ({ children }) => <ol style={{ paddingLeft: 16, marginBottom: 8, color: "var(--text-2)" }}>{children}</ol>,
                  li:     ({ children }) => <li style={{ marginBottom: 4, lineHeight: 1.6 }}>{children}</li>,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
          {isStreaming && content && (
            <span style={{ display: "inline-block", width: 2, height: 16, background: "var(--accent)", marginLeft: 2, verticalAlign: "middle", borderRadius: 1, animation: "pulse-opacity 1s ease-in-out infinite" }} />
          )}
        </div>
      </div>
    </div>
  )
}
