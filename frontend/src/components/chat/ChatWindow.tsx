"use client"
import { useEffect, useRef } from "react"
import { Sparkles } from "lucide-react"
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
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-accent/20 flex items-center justify-center">
              <Sparkles size={22} className="text-accent" />
            </div>
            <div>
              <p className="text-ink font-medium mb-1">Чем могу помочь?</p>
              <p className="text-sm text-ink-muted max-w-xs">
                Задайте вопрос — например, «Хочу стать тимлидом» или «Что нужно для Senior?»
              </p>
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
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={onSend} disabled={isStreaming} />
    </div>
  )
}
