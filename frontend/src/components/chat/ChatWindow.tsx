"use client"
import { useEffect, useRef } from "react"
import { Message } from "@/lib/types"
import MessageBubble from "./MessageBubble"
import ChatInput from "./ChatInput"

function IconSparkle({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
    </svg>
  )
}

interface Props {
  messages: Message[]
  isStreaming: boolean
  onSend: (text: string) => void
}

export default function ChatWindow({ messages, isStreaming, onSend }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [messages, isStreaming])

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Messages */}
      <div ref={containerRef} style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
        {messages.length === 0 && !isStreaming && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, textAlign: "center", padding: 40 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: "var(--accent-soft)", border: "1px solid var(--accent-glow)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--accent)",
            }}>
              <IconSparkle size={24} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 6 }}>Чем могу помочь?</div>
              <div style={{ fontSize: 13, color: "var(--text-2)", maxWidth: 320, lineHeight: 1.5 }}>
                Задайте вопрос — например, «Хочу стать тимлидом» или «Какие курсы пройти в этом квартале?»
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
          />
        ))}

        {isStreaming && messages.length === 0 && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16, animation: "fadeIn 0.2s ease" }}>
            <div style={{
              background: "var(--glass-bg)",
              backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              border: "1px solid var(--glass-border)",
              boxShadow: "var(--glass-shadow), inset 0 1px 0 0 var(--glass-inset)",
              borderRadius: 18, borderBottomLeftRadius: 6,
              padding: "14px 18px", display: "flex", gap: 5, alignItems: "center",
            }}>
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

        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={onSend} disabled={isStreaming} />
    </div>
  )
}
