import { Employee, CareerTrack, Course, DashboardData } from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`)
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
}
