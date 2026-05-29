"use client"
import { useState, useCallback } from "react"
import { usePathname } from "next/navigation"
import Header from "./Header"
import Sidebar from "./Sidebar"

interface AppShellProps {
  children: React.ReactNode
  onPreset?: (text: string) => void
}

export default function AppShell({ children, onPreset }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", position: "relative", zIndex: 1 }}>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar
        open={sidebarOpen}
        onClose={closeSidebar}
        onPreset={pathname === "/chat" ? onPreset : undefined}
      />
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  )
}
