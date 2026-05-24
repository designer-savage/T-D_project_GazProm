"use client"
import { useState, useEffect } from "react"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import ChatWindow from "@/components/chat/ChatWindow"
import { useStream } from "@/hooks/useStream"
import { api } from "@/lib/api"
import { Employee } from "@/lib/types"
import { mockEmployee } from "@/mock/employee"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"
const DEMO_IDS = {
  employee: process.env.NEXT_PUBLIC_DEMO_EMPLOYEE_ID || "emp_001",
  manager: process.env.NEXT_PUBLIC_DEMO_MANAGER_ID || "mgr_001",
}

export default function ChatPage() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isManager, setIsManager] = useState(false)
  const { messages, isStreaming, sendMessage } = useStream()

  const currentId = isManager ? DEMO_IDS.manager : DEMO_IDS.employee

  useEffect(() => {
    if (USE_MOCK) {
      setEmployee(mockEmployee)
      return
    }
    api.getEmployee(currentId).then(setEmployee).catch(() => setEmployee(mockEmployee))
  }, [currentId])

  const handlePreset = (text: string) => {
    sendMessage(text, currentId)
  }

  const handleRoleSwitch = () => {
    setIsManager((v) => !v)
    setEmployee(null)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onPreset={handlePreset} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header employee={employee} onRoleSwitch={handleRoleSwitch} />
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
