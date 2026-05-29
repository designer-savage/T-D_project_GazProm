export type Role = "employee" | "manager" | "admin"
export type Grade = "junior" | "middle" | "senior" | "lead" | "principal"
export type AgentType = "career" | "learning" | "onboarding"

export interface Employee {
  id: string
  name: string
  role: Role
  grade: Grade
  department: string
  manager_id: string | null
  hire_date: string
  kpi_score: number
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  agent?: AgentType
  timestamp: Date
}

export interface Competency {
  skill_name: string
  current_level: number
  target_level: number
  gap: number
}

export interface CareerTrack {
  current_grade: Grade
  target_grade: Grade
  grade_path: Grade[]
  competencies: Competency[]
  estimated_months: number
}

export interface Course {
  id: string
  title: string
  description: string
  duration_hours: number
  category: string
  grade_target: Grade
}

export interface TeamMember {
  id: string
  name: string
  grade: Grade
  department: string
  courses_completed: number
  courses_in_progress: number
  courses_total: number
  avg_progress_pct: number
  kpi_score: number | null
  risk_flag: boolean
}

export interface SkillGap {
  skill_name: string
  total_gap: number
  affected: number
}

export interface CoursesStats {
  completed: number
  in_progress: number
  not_started: number
}

export interface DashboardData {
  team_size: number
  avg_progress: number
  avg_kpi: number
  members: TeamMember[]
  skill_gaps: SkillGap[]
  courses_stats: CoursesStats
}

export interface KnowledgeDoc {
  id: string
  title: string
  category: string
  created_at: string
}

export interface AdminCourse extends Course {
  url: string | null
}
