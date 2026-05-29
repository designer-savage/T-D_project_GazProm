"use client"
import { createContext, useContext, useState } from "react"

type ProfileRole = "employee" | "manager" | "admin"

const DEMO_IDS: Record<ProfileRole, string> = {
  employee: process.env.NEXT_PUBLIC_DEMO_EMPLOYEE_ID || "emp_001",
  manager:  process.env.NEXT_PUBLIC_DEMO_MANAGER_ID  || "mgr_001",
  admin:    process.env.NEXT_PUBLIC_DEMO_ADMIN_ID     || "hr_001",
}

const ROLE_CYCLE: ProfileRole[] = ["employee", "manager", "admin"]

interface ProfileInfo {
  name: string
  grade: string
  dept: string
}

const PROFILE_INFO: Record<ProfileRole, ProfileInfo> = {
  employee: { name: "Иван Петров",      grade: "senior",    dept: "Разработка платформ" },
  manager:  { name: "Павел Соколов",    grade: "lead",      dept: "Разработка платформ" },
  admin:    { name: "Светлана Орлова",  grade: "principal", dept: "HR BP" },
}

interface ProfileContextType {
  role: ProfileRole
  isManager: boolean
  isAdmin: boolean
  currentId: string
  toggleRole: () => void
  profile: ProfileInfo & { role: ProfileRole }
}

const ProfileContext = createContext<ProfileContextType>({
  role: "employee",
  isManager: false,
  isAdmin: false,
  currentId: DEMO_IDS.employee,
  toggleRole: () => {},
  profile: { ...PROFILE_INFO.employee, role: "employee" },
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
      profile: { ...PROFILE_INFO[role], role },
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)
