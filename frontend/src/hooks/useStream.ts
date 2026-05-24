"use client"
import { useState, useCallback } from "react"
import { Message, AgentType } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export function useStream() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [activeAgent, setActiveAgent] = useState<AgentType | null>(null)

  const sendMessage = useCallback(async (query: string, employeeId: string) => {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: query,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsStreaming(true)

    const assistantId = crypto.randomUUID()
    let currentAgent: AgentType = "onboarding"
    let accText = ""

    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", agent: currentAgent, timestamp: new Date() },
    ])

    try {
      const res = await fetch(`${API_URL}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, employee_id: employeeId }),
      })

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        let eventType = ""
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim()
          } else if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6))
            if (eventType === "agent_switch") {
              currentAgent = data.agent as AgentType
              setActiveAgent(currentAgent)
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, agent: currentAgent } : m))
              )
            } else if (eventType === "token") {
              accText += data.text
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: accText } : m))
              )
            } else if (eventType === "separator") {
              accText += data.text
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: accText } : m))
              )
            }
          }
        }
      }
    } finally {
      setIsStreaming(false)
      setActiveAgent(null)
    }
  }, [])

  return { messages, isStreaming, activeAgent, sendMessage }
}
