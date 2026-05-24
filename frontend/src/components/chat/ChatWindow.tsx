"use client"
import { useEffect, useRef } from "react"
import { Message } from "@/lib/types"
import MessageBubble from "./MessageBubble"
import ChatInput from "./ChatInput"

interface Props {
  messages: Message[]
  isStreaming: boolean
  onSend: (text: string) => void
}

export default function ChatWindow({ messages, isStreaming, onSend }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-canvas-100">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-ink-subtle text-sm">
            Задайте вопрос агенту — например, «Хочу стать тимлидом»
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
          />
        ))}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={onSend} disabled={isStreaming} />
    </div>
  )
}
