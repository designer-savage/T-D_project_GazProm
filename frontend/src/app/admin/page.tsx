"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Plus, BookOpen, GraduationCap, Target, CheckCircle, AlertCircle } from "lucide-react"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import { api } from "@/lib/api"
import { useProfile } from "@/context/ProfileContext"
import { Employee, KnowledgeDoc, AdminCourse, Competency } from "@/lib/types"

type Tab = "knowledge" | "courses" | "goals"

const GRADES = ["junior", "middle", "senior", "lead", "principal"] as const
const CATEGORIES = ["career", "learning", "onboarding"] as const
const CATEGORY_LABELS: Record<string, string> = {
  career: "Карьера",
  learning: "Обучение",
  onboarding: "Онбординг",
}

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border
      ${type === "success" ? "bg-surface border-state-success/30 text-state-success" : "bg-surface border-state-danger/30 text-state-danger"}`}>
      {type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      <span className="text-sm text-ink">{message}</span>
    </div>
  )
}

// ─── Knowledge Tab ───────────────────────────────────────────────────────────

function KnowledgeTab({ onToast }: { onToast: (msg: string, type: "success" | "error") => void }) {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: "", category: "learning", content: "" })
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await api.getAdminKnowledge()
      setDocs(res.docs)
    } catch {
      onToast("Не удалось загрузить документы", "error")
    } finally {
      setLoading(false)
    }
  }, [onToast])

  useEffect(() => { load() }, [load])

  const handleAdd = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      onToast("Заполните название и содержание", "error")
      return
    }
    setSubmitting(true)
    try {
      await api.createKnowledgeDoc(form)
      setForm({ title: "", category: "learning", content: "" })
      onToast("Документ добавлен — AI уже использует его в ответах", "success")
      await load()
    } catch {
      onToast("Ошибка при добавлении документа", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Удалить документ «${title}»?`)) return
    try {
      await api.deleteKnowledgeDoc(id)
      onToast("Документ удалён", "success")
      await load()
    } catch {
      onToast("Ошибка при удалении", "error")
    }
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="bg-surface border border-line rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-ink flex items-center gap-2">
          <Plus size={16} className="text-accent" />
          Добавить документ в базу знаний
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            className="col-span-2 sm:col-span-1 bg-canvas-100 border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-accent/50"
            placeholder="Название документа"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <select
            className="bg-canvas-100 border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent/50"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <textarea
          className="w-full bg-canvas-100 border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-accent/50 resize-none"
          rows={5}
          placeholder="Содержание документа — этот текст будет использоваться AI при ответах на вопросы сотрудников"
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
        />
        <button
          onClick={handleAdd}
          disabled={submitting}
          className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {submitting ? "Добавление..." : "Добавить"}
        </button>
      </div>

      {/* List */}
      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-line-soft">
          <h3 className="font-semibold text-ink">Документы в базе знаний</h3>
          <p className="text-xs text-ink-subtle mt-0.5">Эти документы AI использует при ответах в чате</p>
        </div>
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-ink-subtle">Загрузка...</div>
        ) : docs.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-ink-subtle">Документов нет</div>
        ) : (
          <div className="divide-y divide-line-soft">
            {docs.map((doc) => (
              <div key={doc.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-ink">{doc.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">
                      {CATEGORY_LABELS[doc.category] ?? doc.category}
                    </span>
                    <span className="text-xs text-ink-subtle">{doc.created_at.slice(0, 10)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id, doc.title)}
                  className="text-ink-subtle hover:text-state-danger transition-colors p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Courses Tab ─────────────────────────────────────────────────────────────

function CoursesTab({ onToast }: { onToast: (msg: string, type: "success" | "error") => void }) {
  const [courses, setCourses] = useState<AdminCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: "", description: "", duration_hours: 8, category: "learning", grade_target: "middle", url: "" })
  const [assignEmp, setAssignEmp] = useState("emp_001")
  const [assignCourse, setAssignCourseId] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await api.getAdminCourses()
      setCourses(res.courses)
      if (res.courses.length > 0 && !assignCourse) setAssignCourseId(res.courses[0].id)
    } catch {
      onToast("Не удалось загрузить курсы", "error")
    } finally {
      setLoading(false)
    }
  }, [onToast, assignCourse])

  useEffect(() => { load() }, [load])

  const handleAdd = async () => {
    if (!form.title.trim()) { onToast("Введите название курса", "error"); return }
    setSubmitting(true)
    try {
      await api.createCourse(form)
      setForm({ title: "", description: "", duration_hours: 8, category: "learning", grade_target: "middle", url: "" })
      onToast("Курс добавлен", "success")
      await load()
    } catch {
      onToast("Ошибка при добавлении курса", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Удалить курс «${title}»?`)) return
    try {
      await api.deleteCourse(id)
      onToast("Курс удалён", "success")
      await load()
    } catch {
      onToast("Ошибка при удалении", "error")
    }
  }

  const handleAssign = async () => {
    if (!assignCourse) { onToast("Выберите курс", "error"); return }
    try {
      await api.assignCourse(assignEmp, assignCourse)
      onToast("Курс назначен сотруднику", "success")
    } catch {
      onToast("Ошибка при назначении", "error")
    }
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="bg-surface border border-line rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-ink flex items-center gap-2">
          <Plus size={16} className="text-accent" />
          Добавить курс
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            className="col-span-2 bg-canvas-100 border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-accent/50"
            placeholder="Название курса"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <input
            className="col-span-2 bg-canvas-100 border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-accent/50"
            placeholder="Описание"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="flex gap-2 items-center bg-canvas-100 border border-line rounded-lg px-3 py-2">
            <input
              type="number"
              min={1}
              className="w-full text-sm text-ink bg-transparent focus:outline-none"
              value={form.duration_hours}
              onChange={(e) => setForm((f) => ({ ...f, duration_hours: Number(e.target.value) }))}
            />
            <span className="text-xs text-ink-subtle whitespace-nowrap">часов</span>
          </div>
          <select
            className="bg-canvas-100 border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent/50"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
          <select
            className="bg-canvas-100 border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent/50"
            value={form.grade_target}
            onChange={(e) => setForm((f) => ({ ...f, grade_target: e.target.value }))}
          >
            {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <input
            className="bg-canvas-100 border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:border-accent/50"
            placeholder="URL (необязательно)"
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={submitting}
          className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {submitting ? "Добавление..." : "Добавить курс"}
        </button>
      </div>

      {/* Assign */}
      <div className="bg-surface border border-line rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-ink">Назначить курс сотруднику</h3>
        <div className="flex gap-3 flex-wrap">
          <select
            className="bg-canvas-100 border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none"
            value={assignEmp}
            onChange={(e) => setAssignEmp(e.target.value)}
          >
            <option value="emp_001">Иван Петров (emp_001)</option>
            <option value="mgr_001">Павел Соколов (mgr_001)</option>
          </select>
          <select
            className="flex-1 min-w-0 bg-canvas-100 border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none"
            value={assignCourse}
            onChange={(e) => setAssignCourseId(e.target.value)}
          >
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <button
            onClick={handleAssign}
            className="bg-surface border border-line hover:bg-canvas-100 text-sm text-ink font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Назначить
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-line-soft">
          <h3 className="font-semibold text-ink">Все курсы</h3>
        </div>
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-ink-subtle">Загрузка...</div>
        ) : (
          <div className="divide-y divide-line-soft">
            {courses.map((c) => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-ink">{c.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">{c.grade_target}</span>
                    <span className="text-xs text-ink-subtle">{c.duration_hours} ч · {CATEGORY_LABELS[c.category] ?? c.category}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(c.id, c.title)}
                  className="text-ink-subtle hover:text-state-danger transition-colors p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Goals Tab ───────────────────────────────────────────────────────────────

const DEMO_EMPLOYEES = [
  { id: "emp_001", name: "Иван Петров" },
  { id: "mgr_001", name: "Павел Соколов" },
]

function GoalsTab({ onToast }: { onToast: (msg: string, type: "success" | "error") => void }) {
  const [selectedEmp, setSelectedEmp] = useState("emp_001")
  const [competencies, setCompetencies] = useState<Competency[]>([])
  const [goals, setGoals] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadCompetencies = useCallback(async (empId: string) => {
    setLoading(true)
    try {
      const res = await api.getEmployeeCompetencies(empId)
      setCompetencies(res.competencies)
      const initial: Record<string, number> = {}
      res.competencies.forEach((c) => { initial[c.skill_name] = c.target_level })
      setGoals(initial)
    } catch {
      onToast("Не удалось загрузить компетенции", "error")
    } finally {
      setLoading(false)
    }
  }, [onToast])

  useEffect(() => { loadCompetencies(selectedEmp) }, [selectedEmp, loadCompetencies])

  const handleSave = async () => {
    setSaving(true)
    let errorCount = 0
    for (const c of competencies) {
      const newTarget = goals[c.skill_name] ?? c.target_level
      if (newTarget !== c.target_level) {
        try {
          await api.updateCompetencyGoal({ employee_id: selectedEmp, skill_name: c.skill_name, target_level: newTarget })
        } catch {
          errorCount++
        }
      }
    }
    setSaving(false)
    if (errorCount > 0) {
      onToast(`${errorCount} целей не удалось сохранить`, "error")
    } else {
      onToast("Цели сохранены — карьерный трек обновлён", "success")
      await loadCompetencies(selectedEmp)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-line rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-semibold text-ink">Цели по компетенциям</h3>
          <select
            className="bg-canvas-100 border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-none"
            value={selectedEmp}
            onChange={(e) => setSelectedEmp(e.target.value)}
          >
            {DEMO_EMPLOYEES.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-ink-subtle">Загрузка...</div>
        ) : competencies.length === 0 ? (
          <div className="py-8 text-center text-sm text-ink-subtle">Компетенции не найдены</div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-4 text-xs text-ink-subtle px-1 pb-1 border-b border-line-soft">
              <span className="col-span-2">Навык</span>
              <span className="text-center">Текущий</span>
              <span className="text-center">Цель</span>
            </div>
            {competencies.map((c) => {
              const target = goals[c.skill_name] ?? c.target_level
              const changed = target !== c.target_level
              return (
                <div key={c.skill_name} className={`grid grid-cols-4 items-center py-2 px-1 rounded-lg ${changed ? "bg-accent/5" : ""}`}>
                  <span className="col-span-2 text-sm text-ink font-medium">{c.skill_name}</span>
                  <div className="flex justify-center">
                    <span className="text-sm text-ink-muted tabular-nums">{c.current_level}/5</span>
                  </div>
                  <div className="flex justify-center">
                    <input
                      type="number"
                      min={1}
                      max={5}
                      className="w-14 text-center bg-canvas-100 border border-line rounded-lg px-2 py-1 text-sm text-ink focus:outline-none focus:border-accent/50"
                      value={target}
                      onChange={(e) => {
                        const v = Math.min(5, Math.max(1, Number(e.target.value)))
                        setGoals((g) => ({ ...g, [c.skill_name]: v }))
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {competencies.length > 0 && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {saving ? "Сохранение..." : "Сохранить цели"}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "knowledge", label: "База знаний", icon: BookOpen },
  { id: "courses",   label: "Курсы",       icon: GraduationCap },
  { id: "goals",     label: "Цели команды", icon: Target },
]

export default function AdminPage() {
  const { isAdmin, currentId } = useProfile()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("knowledge")
  const [manager, setManager] = useState<Employee | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    if (!isAdmin) { router.replace("/dashboard"); return }
    api.getEmployee(currentId).then(setManager).catch(() => {})
  }, [isAdmin, currentId, router])

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type })
  }, [])

  if (!isAdmin) return null

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header employee={manager} />
        <main className="flex-1 overflow-y-auto p-6 bg-canvas-100">
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h1 className="text-xl font-bold text-ink">Управление платформой</h1>
              <p className="text-sm text-ink-muted mt-1">Курсы, база знаний, цели команды</p>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 bg-surface border border-line rounded-xl p-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                    ${tab === id ? "bg-accent/15 text-accent" : "text-ink-muted hover:text-ink hover:bg-canvas-100"}`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === "knowledge" && <KnowledgeTab onToast={showToast} />}
            {tab === "courses"   && <CoursesTab   onToast={showToast} />}
            {tab === "goals"     && <GoalsTab      onToast={showToast} />}
          </div>
        </main>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
