"use client"
import { useState, useEffect } from "react"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import ChatWindow from "@/components/chat/ChatWindow"
import { useStream } from "@/hooks/useStream"
import { useProfile } from "@/context/ProfileContext"
import { api } from "@/lib/api"
import { Employee } from "@/lib/types"
import { mockEmployee } from "@/mock/employee"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"

export default function ChatPage() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const { currentId, toggleRole } = useProfile()
  const { messages, isStreaming, sendMessage, loadHistory } = useStream()

  useEffect(() => {
    setEmployee(null)
    if (USE_MOCK) {
      setEmployee(mockEmployee)
      return
    }
    api.getEmployee(currentId).then(setEmployee).catch(() => setEmployee(mockEmployee))
    loadHistory(currentId)
  }, [currentId, loadHistory])

  const handlePreset = (text: string) => {
    sendMessage(text, currentId)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onPreset={handlePreset} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header employee={employee} onRoleSwitch={toggleRole} />
        <main className="flex-1 overflow-hidden">
          <ChatWindow
            messages={messages}
            isStreaming={isStreaming}
            onSend={(text) => sendMessage(text, currentId)}
          />
        </main>
      </div>
    </div>
  )
}
