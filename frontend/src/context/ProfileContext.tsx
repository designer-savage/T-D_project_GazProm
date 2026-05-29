"use client"
import { createContext, useContext, useState } from "react"

type ProfileRole = "employee" | "manager" | "admin"

const DEMO_IDS: Record<ProfileRole, string> = {
  employee: process.env.NEXT_PUBLIC_DEMO_EMPLOYEE_ID || "emp_001",
  manager:  process.env.NEXT_PUBLIC_DEMO_MANAGER_ID  || "mgr_001",
  admin:    process.env.NEXT_PUBLIC_DEMO_ADMIN_ID     || "hr_001",
}

const ROLE_CYCLE: ProfileRole[] = ["employee", "manager", "admin"]

interface ProfileContextType {
  role: ProfileRole
  isManager: boolean
  isAdmin: boolean
  currentId: string
  toggleRole: () => void
}

const ProfileContext = createContext<ProfileContextType>({
  role: "employee",
  isManager: false,
  isAdmin: false,
  currentId: DEMO_IDS.employee,
  toggleRole: () => {},
})

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [roleIndex, setRoleIndex] = useState(0)
  const role = ROLE_CYCLE[roleIndex]
  const currentId = DEMO_IDS[role]

  return (
    <ProfileContext.Provider value={{
      role,
      isManager: role === "manager",
      isAdmin: role === "admin",
      currentId,
      toggleRole: () => setRoleIndex((i) => (i + 1) % ROLE_CYCLE.length),
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)
