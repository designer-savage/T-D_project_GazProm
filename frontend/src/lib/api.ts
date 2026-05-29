import { Employee, CareerTrack, Course, DashboardData, KnowledgeDoc, AdminCourse, Competency } from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

async function del<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { method: "DELETE" })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const api = {
  getEmployee: (id: string) => get<Employee>(`/employees/${id}`),
  getCareerTrack: (id: string) => get<CareerTrack>(`/career/${id}`),
  getCourses: (grade?: string, limit = 10) =>
    get<{ courses: Course[]; total: number }>(`/courses${grade ? `?grade=${grade}&limit=${limit}` : `?limit=${limit}`}`),
  getDashboard: (managerId: string) =>
    get<DashboardData>(`/dashboard/team?manager_id=${managerId}`),

  // Admin: knowledge base
  getAdminKnowledge: () => get<{ docs: KnowledgeDoc[] }>("/admin/knowledge"),
  createKnowledgeDoc: (data: { title: string; category: string; content: string }) =>
    post<KnowledgeDoc>("/admin/knowledge", data),
  deleteKnowledgeDoc: (id: string) => del<{ deleted: string }>(`/admin/knowledge/${id}`),

  // Admin: courses
  getAdminCourses: () => get<{ courses: AdminCourse[] }>("/admin/courses"),
  createCourse: (data: { title: string; description: string; duration_hours: number; category: string; grade_target: string; url: string }) =>
    post<AdminCourse>("/admin/courses", data),
  deleteCourse: (id: string) => del<{ deleted: string }>(`/admin/courses/${id}`),
  assignCourse: (employee_id: string, course_id: string) =>
    post<{ assigned: boolean }>("/admin/assign-course", { employee_id, course_id }),

  // Admin: competency goals
  getEmployeeCompetencies: (id: string) =>
    get<{ competencies: Competency[] }>(`/admin/competencies/${id}`),
  updateCompetencyGoal: (data: { employee_id: string; skill_name: string; target_level: number }) =>
    put<{ skill_name: string; target_level: number; gap: number }>("/admin/competencies", data),
}
