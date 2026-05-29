"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Plus, BookOpen, GraduationCap, Target, CheckCircle, AlertCircle } from "lucide-react"
import AppShell from "@/components/layout/AppShell"
import { api } from "@/lib/api"
import { useProfile } from "@/context/ProfileContext"
import { KnowledgeDoc, AdminCourse, Competency } from "@/lib/types"

type Tab = "knowledge" | "courses" | "goals"

const GRADES = ["junior", "middle", "senior", "lead", "principal"] as const
const CATEGORIES = ["career", "learning", "onboarding"] as const
const CATEGORY_LABELS: Record<string, string> = {
  career: "Карьера",
  learning: "Обучение",
  onboarding: "Онбординг",
}

const inputStyle: React.CSSProperties = {
  background: "var(--glass-bg-input)",
  border: "1px solid var(--glass-border)",
  borderRadius: 10,
  padding: "8px 12px",
  fontSize: 14,
  color: "var(--text-1)",
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s",
}

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 16px", borderRadius: 14,
      background: "var(--glass-bg-elevated)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      border: `1px solid ${type === "success" ? "var(--green)" : "var(--red)"}`,
      boxShadow: "var(--glass-shadow-lg)",
      color: type === "success" ? "var(--green)" : "var(--red)",
    }}>
      {type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      <span style={{ fontSize: 14, color: "var(--text-1)" }}>{message}</span>
    </div>
  )
}

// ─── Knowledge Tab ──────────────────────────────────────────────────────────

function KnowledgeTab({ onToast }: { onToast: (msg: string, type: "success" | "error") => void }) {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: "", category: "learning", content: "" })
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    try { const res = await api.getAdminKnowledge(); setDocs(res.docs) }
    catch { onToast("Не удалось загрузить документы", "error") }
    finally { setLoading(false) }
  }, [onToast])

  useEffect(() => { load() }, [load])

  const handleAdd = async () => {
    if (!form.title.trim() || !form.content.trim()) { onToast("Заполните название и содержание", "error"); return }
    setSubmitting(true)
    try {
      await api.createKnowledgeDoc(form)
      setForm({ title: "", category: "learning", content: "" })
      onToast("Документ добавлен — AI уже использует его в ответах", "success")
      await load()
    } catch { onToast("Ошибка при добавлении документа", "error") }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Удалить документ «${title}»?`)) return
    try { await api.deleteKnowledgeDoc(id); onToast("Документ удалён", "success"); await load() }
    catch { onToast("Ошибка при удалении", "error") }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="glass-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 8 }}>
          <Plus size={16} color="var(--accent)" /> Добавить документ в базу знаний
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input style={{ ...inputStyle, gridColumn: "1/-1" }} placeholder="Название документа" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <select style={inputStyle} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
        <textarea style={{ ...inputStyle, resize: "none" }} rows={5} placeholder="Содержание документа" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
        <button
          onClick={handleAdd} disabled={submitting}
          style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 14, fontWeight: 500, cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.6 : 1, transition: "all 0.2s", alignSelf: "flex-start" }}
        >
          {submitting ? "Добавление..." : "Добавить"}
        </button>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--glass-border)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)" }}>Документы в базе знаний</h3>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Эти документы AI использует при ответах в чате</p>
        </div>
        {loading ? (
          <div style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: "var(--text-3)" }}>Загрузка...</div>
        ) : docs.length === 0 ? (
          <div style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: "var(--text-3)" }}>Документов нет</div>
        ) : (
          <div>
            {docs.map((doc) => (
              <div key={doc.id} style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--glass-border)" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-1)" }}>{doc.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                    <span style={{ fontSize: 11, background: "var(--accent-soft)", color: "var(--accent)", padding: "1px 8px", borderRadius: 6 }}>{CATEGORY_LABELS[doc.category] ?? doc.category}</span>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>{doc.created_at.slice(0, 10)}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(doc.id, doc.title)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 4, transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--red)"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-3)"}>
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

// ─── Courses Tab ────────────────────────────────────────────────────────────

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
    } catch { onToast("Не удалось загрузить курсы", "error") }
    finally { setLoading(false) }
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
    } catch { onToast("Ошибка при добавлении курса", "error") }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Удалить курс «${title}»?`)) return
    try { await api.deleteCourse(id); onToast("Курс удалён", "success"); await load() }
    catch { onToast("Ошибка при удалении", "error") }
  }

  const handleAssign = async () => {
    if (!assignCourse) { onToast("Выберите курс", "error"); return }
    try { await api.assignCourse(assignEmp, assignCourse); onToast("Курс назначен сотруднику", "success") }
    catch { onToast("Ошибка при назначении", "error") }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="glass-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 8 }}><Plus size={16} color="var(--accent)" /> Добавить курс</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input style={{ ...inputStyle, gridColumn: "1/-1" }} placeholder="Название курса" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <input style={{ ...inputStyle, gridColumn: "1/-1" }} placeholder="Описание" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <input type="number" min={1} style={inputStyle} value={form.duration_hours} onChange={(e) => setForm((f) => ({ ...f, duration_hours: Number(e.target.value) }))} />
          <select style={inputStyle} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>{CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}</select>
          <select style={inputStyle} value={form.grade_target} onChange={(e) => setForm((f) => ({ ...f, grade_target: e.target.value }))}>{GRADES.map((g) => <option key={g} value={g}>{g}</option>)}</select>
          <input style={inputStyle} placeholder="URL (необязательно)" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />
        </div>
        <button onClick={handleAdd} disabled={submitting} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 14, fontWeight: 500, cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.6 : 1, transition: "all 0.2s", alignSelf: "flex-start" }}>
          {submitting ? "Добавление..." : "Добавить курс"}
        </button>
      </div>

      <div className="glass-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)" }}>Назначить курс сотруднику</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select style={{ ...inputStyle, width: "auto" }} value={assignEmp} onChange={(e) => setAssignEmp(e.target.value)}>
            <option value="emp_001">Иван Петров (emp_001)</option>
            <option value="mgr_001">Павел Соколов (mgr_001)</option>
          </select>
          <select style={{ ...inputStyle, flex: 1, minWidth: 0 }} value={assignCourse} onChange={(e) => setAssignCourseId(e.target.value)}>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <button onClick={handleAssign} style={{ background: "var(--glass-bg-elevated)", color: "var(--text-1)", border: "1px solid var(--glass-border)", borderRadius: 10, padding: "8px 16px", fontSize: 14, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--glass-bg-hover)"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--glass-bg-elevated)"}>
            Назначить
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--glass-border)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)" }}>Все курсы</h3>
        </div>
        {loading ? (
          <div style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: "var(--text-3)" }}>Загрузка...</div>
        ) : (
          <div>
            {courses.map((c) => (
              <div key={c.id} style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--glass-border)" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-1)" }}>{c.title}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                    <span style={{ fontSize: 11, background: "var(--accent-soft)", color: "var(--accent)", padding: "1px 8px", borderRadius: 6 }}>{c.grade_target}</span>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>{c.duration_hours} ч · {CATEGORY_LABELS[c.category] ?? c.category}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(c.id, c.title)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 4, transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--red)"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-3)"}>
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

// ─── Goals Tab ──────────────────────────────────────────────────────────────

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
    } catch { onToast("Не удалось загрузить компетенции", "error") }
    finally { setLoading(false) }
  }, [onToast])

  useEffect(() => { loadCompetencies(selectedEmp) }, [selectedEmp, loadCompetencies])

  const handleSave = async () => {
    setSaving(true)
    let errorCount = 0
    for (const c of competencies) {
      const newTarget = goals[c.skill_name] ?? c.target_level
      if (newTarget !== c.target_level) {
        try { await api.updateCompetencyGoal({ employee_id: selectedEmp, skill_name: c.skill_name, target_level: newTarget }) }
        catch { errorCount++ }
      }
    }
    setSaving(false)
    if (errorCount > 0) onToast(`${errorCount} целей не удалось сохранить`, "error")
    else { onToast("Цели сохранены — карьерный трек обновлён", "success"); await loadCompetencies(selectedEmp) }
  }

  return (
    <div className="glass-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)" }}>Цели по компетенциям</h3>
        <select style={{ ...inputStyle, width: "auto" }} value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)}>
          {DEMO_EMPLOYEES.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: "var(--text-3)" }}>Загрузка...</div>
      ) : competencies.length === 0 ? (
        <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: "var(--text-3)" }}>Компетенции не найдены</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: 8, fontSize: 11, color: "var(--text-3)", padding: "0 4px 8px", borderBottom: "1px solid var(--glass-border)" }}>
            <span style={{ gridColumn: "span 2" }}>Навык</span>
            <span style={{ textAlign: "center" }}>Текущий</span>
            <span style={{ textAlign: "center" }}>Цель</span>
          </div>
          {competencies.map((c) => {
            const target = goals[c.skill_name] ?? c.target_level
            const changed = target !== c.target_level
            return (
              <div key={c.skill_name} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: 8, alignItems: "center", padding: "8px 4px", borderRadius: 8, background: changed ? "var(--accent-soft)" : "transparent", transition: "background 0.2s" }}>
                <span style={{ gridColumn: "span 2", fontSize: 14, color: "var(--text-1)", fontWeight: 500 }}>{c.skill_name}</span>
                <span style={{ fontSize: 13, color: "var(--text-2)", textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{c.current_level}/5</span>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <input
                    type="number" min={1} max={5}
                    style={{ ...inputStyle, width: 56, textAlign: "center", padding: "4px 8px" }}
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
        <button onClick={handleSave} disabled={saving} style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 14, fontWeight: 500, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1, transition: "all 0.2s", alignSelf: "flex-start" }}>
          {saving ? "Сохранение..." : "Сохранить цели"}
        </button>
      )}
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "knowledge", label: "База знаний", icon: BookOpen },
  { id: "courses",   label: "Курсы",       icon: GraduationCap },
  { id: "goals",     label: "Цели команды", icon: Target },
]

export default function AdminPage() {
  const { isAdmin } = useProfile()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("knowledge")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    if (!isAdmin) { router.replace("/dashboard"); return }
  }, [isAdmin, router])

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type })
  }, [])

  if (!isAdmin) return null

  return (
    <AppShell>
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)" }}>Управление платформой</h1>
            <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4 }}>Курсы, база знаний, цели команды</p>
          </div>

          {/* Tab bar */}
          <div className="glass-card" style={{ padding: 4, display: "flex", gap: 4, borderRadius: 14 }}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "8px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14,
                  fontWeight: tab === id ? 600 : 400,
                  background: tab === id ? "var(--accent-soft)" : "transparent",
                  color: tab === id ? "var(--accent)" : "var(--text-2)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { if (tab !== id) (e.currentTarget as HTMLElement).style.color = "var(--text-1)" }}
                onMouseLeave={e => { if (tab !== id) (e.currentTarget as HTMLElement).style.color = "var(--text-2)" }}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {tab === "knowledge" && <KnowledgeTab onToast={showToast} />}
          {tab === "courses"   && <CoursesTab   onToast={showToast} />}
          {tab === "goals"     && <GoalsTab      onToast={showToast} />}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AppShell>
  )
}
