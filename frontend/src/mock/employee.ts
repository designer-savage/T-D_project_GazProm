import { Employee, CareerTrack, DashboardData } from "@/lib/types"

export const mockEmployee: Employee = {
  id: "emp_001",
  name: "Иван Петров",
  role: "employee",
  grade: "senior",
  department: "Разработка платформ",
  manager_id: "mgr_001",
  hire_date: "2022-03-15",
  kpi_score: 0.85,
}

export const mockCareer: CareerTrack = {
  current_grade: "senior",
  target_grade: "lead",
  grade_path: ["senior", "lead"],
  competencies: [
    { skill_name: "System Design", current_level: 3, target_level: 5, gap: 2 },
    { skill_name: "Team Leadership", current_level: 2, target_level: 4, gap: 2 },
    { skill_name: "Python", current_level: 5, target_level: 5, gap: 0 },
    { skill_name: "Architecture Patterns", current_level: 3, target_level: 5, gap: 2 },
  ],
  estimated_months: 8,
}

export const mockDashboard: DashboardData = {
  team_size: 7,
  avg_progress: 0.52,
  members: [
    { id: "emp_001", name: "Иван Петров", grade: "senior", courses_completed: 1, courses_total: 2, avg_progress_pct: 80, risk_flag: false },
    { id: "emp_002", name: "Анна Смирнова", grade: "middle", courses_completed: 1, courses_total: 2, avg_progress_pct: 70, risk_flag: false },
    { id: "emp_003", name: "Дмитрий Козлов", grade: "junior", courses_completed: 0, courses_total: 2, avg_progress_pct: 13, risk_flag: true },
    { id: "emp_007", name: "Алексей Фёдоров", grade: "junior", courses_completed: 0, courses_total: 0, avg_progress_pct: 0, risk_flag: false },
  ],
}
