"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import AppShell from "@/components/layout/AppShell"
import { useProfile } from "@/context/ProfileContext"

const STEPS_EMPLOYEE = [
  { title: "Получить доступы",      desc: "Заявка в ServiceDesk на рабочие системы",                  done: true  },
  { title: "Инструктаж ИБ",         desc: "Обязательный курс по информационной безопасности",          done: true  },
  { title: "Знакомство с командой", desc: "1-on-1 с руководителем и коллегами",                        done: false },
  { title: "Изучить архитектуру",   desc: "Confluence: раздел Architecture Overview",                  done: false },
  { title: "Первые задачи",         desc: "Взять задачи из бэклога под руководством ментора",           done: false },
]

const STEPS_MANAGER = [
  { title: "Настроить доступы",          desc: "Доступ к управленческим системам и дашбордам",         done: true  },
  { title: "Онбординг лида",             desc: "Roadmap лида в корпоративной базе знаний",              done: true  },
  { title: "1-on-1 с командой",          desc: "Индивидуальные встречи с каждым разработчиком",         done: false },
  { title: "План развития команды",      desc: "Сформировать IDP для каждого сотрудника",               done: false },
  { title: "Синхронизация со смежными",  desc: "Встречи с лидами соседних команд",                      done: false },
]

const AGENT_LABELS: Record<string, string> = {
  career: "Агент карьеры",
  learning: "Агент обучения",
  onboarding: "Агент онбординга",
}
const AGENT_COLORS: Record<string, string> = {
  career: "var(--accent)",
  learning: "var(--green)",
  onboarding: "var(--yellow)",
}

function IconCheck({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
}

function IconSend({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L15.17 10H4v2h11.17l-4.58 4.59L12 18l8-8z" transform="rotate(-90 12 12)" /></svg>
}

function IconRocket({ size = 22 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.5 5.5 7 9.5 7 13a5 5 0 0010 0c0-3.5-1.5-7.5-5-11z" /><circle cx="12" cy="13" r="2" fill="var(--bg, #070B15)" /><path d="M7.5 16.5c-1.2.8-2.5 1-2.5 1s.2-1.3 1-2.5l1.5 1.5zM16.5 16.5c1.2.8 2.5 1 2.5 1s-.2-1.3-1-2.5l-1.5 1.5z" /></svg>
}

interface Msg {
  id: number
  role: "user" | "assistant"
  content: string
  agent?: string
}

const glassBase: React.CSSProperties = {
  background: "var(--glass-bg)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid var(--glass-border)",
  boxShadow: "var(--glass-shadow), inset 0 1px 0 0 var(--glass-inset)",
  transition: "all 0.25s ease",
}

export default function OnboardingPage() {
  const { isManager, currentId } = useProfile()
  const STEPS = isManager ? STEPS_MANAGER : STEPS_EMPLOYEE
  const [activeStep, setActiveStep] = useState(2)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [typing, setTyping] = useState(false)
  const [val, setVal] = useState("")
  const idRef = useRef(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollTop = bottomRef.current.scrollHeight
  }, [msgs, typing])

  const sendMsg = useCallback((text: string) => {
    if (!text.trim() || typing) return
    setMsgs((prev) => [...prev, { id: ++idRef.current, role: "user", content: text.trim() }])
    setTyping(true)
    setVal("")
    setTimeout(() => {
      setMsgs((prev) => [...prev, {
        id: ++idRef.current,
        role: "assistant",
        content: "Для получения доступа к нужным системам подайте заявку в ServiceDesk → категория «Доступ к системам». Укажите ваш отдел и руководителя. Доступ будет предоставлен в течение 24 часов.",
        agent: "onboarding",
      }])
      setTyping(false)
    }, 1000 + Math.random() * 600)
  }, [typing])

  const canSend = val.trim() && !typing

  return (
    <AppShell>
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 2fr) minmax(320px, 3fr)",
          gap: 20, height: "calc(100vh - 56px - 48px)",
          maxWidth: 1200, margin: "0 auto",
        }}>

          {/* Left: Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, overflow: "auto" }}>
            <div className="glass-card anim-fade-up" style={{ padding: "20px 20px 16px", flex: 1, overflow: "auto" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 16 }}>Шаги адаптации</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {STEPS.map((step, i) => {
                  const active = i === activeStep
                  return (
                    <div
                      key={i}
                      onClick={() => setActiveStep(i)}
                      style={{
                        display: "flex", gap: 12, padding: "12px 14px", borderRadius: 14, cursor: "pointer",
                        background: active ? "var(--accent-soft)" : "transparent",
                        border: `1px solid ${active ? "var(--accent-glow)" : "transparent"}`,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--glass-bg-hover)" }}
                      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent" }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700,
                        ...(step.done
                          ? { background: "var(--green-soft)", color: "var(--green)" }
                          : active
                          ? { background: "var(--accent)", color: "#fff" }
                          : { background: "var(--glass-bg-elevated)", color: "var(--text-3)" }),
                      }}>
                        {step.done ? <IconCheck size={14} /> : i + 1}
                      </div>
                      <div>
                        <div style={{
                          fontSize: 13, fontWeight: 500,
                          color: step.done ? "var(--text-3)" : "var(--text-1)",
                          textDecoration: step.done ? "line-through" : "none",
                        }}>
                          {step.title}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2, lineHeight: 1.4 }}>
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Mentor card */}
            <div className="glass-card anim-fade-up" style={{
              padding: "14px 18px", flexShrink: 0,
              background: "var(--accent-soft)", borderColor: "var(--accent-glow)",
              animationDelay: "0.15s",
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 4 }}>
                {isManager ? "Product Owner" : "Ваш ментор"}
              </div>
              <div style={{ fontSize: 14, color: "var(--text-1)", fontWeight: 500 }}>
                {isManager ? "Алексей Громов" : "Павел Соколов (Lead)"}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 4 }}>
                {isManager ? "Sync: каждый понедельник 10:00" : "Встречи: каждый вторник 11:00"}
              </div>
            </div>
          </div>

          {/* Right: Chat */}
          <div className="glass-card anim-fade-up" style={{
            display: "flex", flexDirection: "column", overflow: "hidden", padding: 0,
            animationDelay: "0.1s",
          }}>
            {/* Chat header */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--glass-border)", flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-1)" }}>Задайте вопрос по онбордингу</div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 3 }}>
                {isManager ? "Например: «Как выстроить первые 1-on-1 с командой?»" : "Например: «Как получить доступ к GitLab?»"}
              </div>
            </div>

            {/* Messages */}
            <div ref={bottomRef} style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
              {msgs.length === 0 && !typing && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, textAlign: "center", padding: 40 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 18,
                    background: "var(--accent-soft)", border: "1px solid var(--accent-glow)",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)",
                  }}>
                    <IconRocket size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 6 }}>Чем помочь?</div>
                    <div style={{ fontSize: 13, color: "var(--text-2)", maxWidth: 280, lineHeight: 1.5 }}>
                      {isManager ? "Спросите про процессы адаптации в роли лида" : "Спросите про доступы, процессы или инструменты"}
                    </div>
                  </div>
                </div>
              )}

              {msgs.map((msg) => {
                const isUser = msg.role === "user"
                const agentColor = msg.agent ? AGENT_COLORS[msg.agent] : "var(--text-2)"
                return (
                  <div key={msg.id} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 12 }}>
                    <div style={{ maxWidth: "80%" }}>
                      {!isUser && msg.agent && (
                        <div style={{ marginBottom: 5, marginLeft: 2, display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: agentColor, display: "inline-block", opacity: 0.8 }} />
                          <span style={{ fontSize: 11, fontWeight: 600, color: agentColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {AGENT_LABELS[msg.agent] ?? msg.agent}
                          </span>
                        </div>
                      )}
                      <div style={{
                        padding: "10px 14px", fontSize: 13, lineHeight: 1.6, color: "var(--text-1)",
                        borderRadius: 16,
                        ...(isUser
                          ? { borderBottomRightRadius: 6, background: "var(--user-bubble)", border: "1px solid var(--user-border)" }
                          : { ...glassBase, borderRadius: 16, borderBottomLeftRadius: 6 }),
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                )
              })}

              {typing && (
                <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
                  <div style={{ ...glassBase, borderRadius: 16, borderBottomLeftRadius: 6, padding: "14px 18px", display: "flex", gap: 5, alignItems: "center" }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: "var(--text-3)",
                        animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ padding: "8px 14px 14px", flexShrink: 0 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--glass-bg)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                border: "1px solid var(--glass-border)", borderRadius: 14, padding: "4px 6px 4px 14px",
              }}>
                <input
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendMsg(val) }}
                  disabled={typing}
                  placeholder="Задайте вопрос..."
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    fontSize: 13, color: "var(--text-1)", padding: "8px 0",
                  }}
                />
                <button
                  onClick={() => sendMsg(val)}
                  disabled={!canSend}
                  style={{
                    width: 30, height: 30, borderRadius: 9, border: "none",
                    cursor: canSend ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: canSend ? "var(--accent)" : "var(--glass-bg-elevated)",
                    color: canSend ? "#fff" : "var(--text-3)", transition: "all 0.2s",
                  }}
                >
                  <IconSend size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
