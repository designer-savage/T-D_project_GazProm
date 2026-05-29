"use client"
import { useState, useEffect } from "react"
import AppShell from "@/components/layout/AppShell"
import ChatWindow from "@/components/chat/ChatWindow"
import { useStream } from "@/hooks/useStream"
import { useProfile } from "@/context/ProfileContext"

export default function ChatPage() {
  const { currentId } = useProfile()
  const { messages, isStreaming, sendMessage, loadHistory } = useStream()

  useEffect(() => {
    loadHistory(currentId)
  }, [currentId, loadHistory])

  const handlePreset = (text: string) => {
    sendMessage(text, currentId)
  }

  return (
    <AppShell onPreset={handlePreset}>
      <ChatWindow
        messages={messages}
        isStreaming={isStreaming}
        onSend={(text) => sendMessage(text, currentId)}
      />
    </AppShell>
  )
}
