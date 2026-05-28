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
  avg_kpi: 0.74,
  members: [
    { id: "emp_001", name: "Иван Петров", grade: "senior", department: "Разработка платформ", courses_completed: 2, courses_in_progress: 2, courses_total: 5, avg_progress_pct: 58, kpi_score: 0.85, risk_flag: false },
    { id: "emp_002", name: "Анна Смирнова", grade: "middle", department: "Разработка платформ", courses_completed: 1, courses_in_progress: 2, courses_total: 4, avg_progress_pct: 40, kpi_score: 0.72, risk_flag: false },
    { id: "emp_003", name: "Дмитрий Козлов", grade: "junior", department: "Разработка платформ", courses_completed: 0, courses_in_progress: 1, courses_total: 3, avg_progress_pct: 8, kpi_score: 0.60, risk_flag: true },
    { id: "emp_006", name: "Мария Белова", grade: "lead", department: "Архитектура", courses_completed: 2, courses_in_progress: 1, courses_total: 3, avg_progress_pct: 83, kpi_score: 0.92, risk_flag: false },
    { id: "emp_007", name: "Алексей Фёдоров", grade: "junior", department: "Разработка платформ", courses_completed: 0, courses_in_progress: 1, courses_total: 2, avg_progress_pct: 8, kpi_score: 0.55, risk_flag: true },
  ],
  skill_gaps: [
    { skill_name: "System Design", total_gap: 4, affected: 2 },
    { skill_name: "Architecture Patterns", total_gap: 4, affected: 2 },
    { skill_name: "Team Leadership", total_gap: 2, affected: 1 },
    { skill_name: "Python", total_gap: 2, affected: 1 },
  ],
  courses_stats: {
    completed: 5,
    in_progress: 7,
    not_started: 5,
  },
}
