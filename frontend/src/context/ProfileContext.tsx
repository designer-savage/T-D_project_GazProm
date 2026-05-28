"use client"
import { createContext, useContext, useState } from "react"

const DEMO_IDS = {
  employee: process.env.NEXT_PUBLIC_DEMO_EMPLOYEE_ID || "emp_001",
  manager: process.env.NEXT_PUBLIC_DEMO_MANAGER_ID || "mgr_001",
}

interface ProfileContextType {
  isManager: boolean
  currentId: string
  toggleRole: () => void
}

const ProfileContext = createContext<ProfileContextType>({
  isManager: false,
  currentId: DEMO_IDS.employee,
  toggleRole: () => {},
})

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [isManager, setIsManager] = useState(false)
  const currentId = isManager ? DEMO_IDS.manager : DEMO_IDS.employee

  return (
    <ProfileContext.Provider value={{ isManager, currentId, toggleRole: () => setIsManager((v) => !v) }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)
