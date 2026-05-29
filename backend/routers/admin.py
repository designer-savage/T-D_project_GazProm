import time
import aiosqlite
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.config import settings

router = APIRouter(prefix="/admin", tags=["admin"])


class KnowledgeDocCreate(BaseModel):
    title: str
    category: str
    content: str


class CourseCreate(BaseModel):
    title: str
    description: str
    duration_hours: int
    category: str
    grade_target: str
    url: str = ""


class AssignCourse(BaseModel):
    employee_id: str
    course_id: str


class CompetencyGoal(BaseModel):
    employee_id: str
    skill_name: str
    target_level: int


# --- Knowledge base ---

@router.get("/knowledge")
async def list_knowledge():
    async with aiosqlite.connect(settings.database_url) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, title, category, created_at FROM knowledge_documents ORDER BY created_at DESC"
        )
        rows = [dict(r) for r in await cursor.fetchall()]
        return {"docs": rows}


@router.post("/knowledge")
async def create_knowledge(doc: KnowledgeDocCreate):
    doc_id = "kb_" + str(int(time.time()))
    async with aiosqlite.connect(settings.database_url) as db:
        await db.execute(
            "INSERT INTO knowledge_documents (id, title, category, content, created_at) VALUES (?,?,?,?,datetime('now'))",
            (doc_id, doc.title, doc.category, doc.content),
        )
        await db.execute(
            "INSERT INTO knowledge_fts (doc_id, title, content, category) VALUES (?,?,?,?)",
            (doc_id, doc.title, doc.content, doc.category),
        )
        await db.commit()
    return {"id": doc_id, "title": doc.title, "category": doc.category}


@router.delete("/knowledge/{doc_id}")
async def delete_knowledge(doc_id: str):
    async with aiosqlite.connect(settings.database_url) as db:
        cursor = await db.execute("SELECT id FROM knowledge_documents WHERE id = ?", (doc_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Document not found")
        await db.execute("DELETE FROM knowledge_documents WHERE id = ?", (doc_id,))
        await db.execute("DELETE FROM knowledge_fts WHERE doc_id = ?", (doc_id,))
        await db.commit()
    return {"deleted": doc_id}


# --- Courses ---

@router.get("/courses")
async def list_courses():
    async with aiosqlite.connect(settings.database_url) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, title, description, duration_hours, category, grade_target, url FROM courses ORDER BY title"
        )
        rows = [dict(r) for r in await cursor.fetchall()]
        return {"courses": rows}


@router.post("/courses")
async def create_course(course: CourseCreate):
    course_id = "crs_" + str(int(time.time()))
    async with aiosqlite.connect(settings.database_url) as db:
        await db.execute(
            "INSERT INTO courses (id, title, description, duration_hours, category, grade_target, url) VALUES (?,?,?,?,?,?,?)",
            (course_id, course.title, course.description, course.duration_hours, course.category, course.grade_target, course.url),
        )
        await db.commit()
    return {"id": course_id, **course.model_dump()}


@router.delete("/courses/{course_id}")
async def delete_course(course_id: str):
    async with aiosqlite.connect(settings.database_url) as db:
        cursor = await db.execute("SELECT id FROM courses WHERE id = ?", (course_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="Course not found")
        await db.execute("DELETE FROM learning_progress WHERE course_id = ?", (course_id,))
        await db.execute("DELETE FROM courses WHERE id = ?", (course_id,))
        await db.commit()
    return {"deleted": course_id}


@router.post("/assign-course")
async def assign_course(body: AssignCourse):
    async with aiosqlite.connect(settings.database_url) as db:
        await db.execute(
            "INSERT OR IGNORE INTO learning_progress (employee_id, course_id, status, progress_pct) VALUES (?,?,'not_started',0)",
            (body.employee_id, body.course_id),
        )
        await db.commit()
    return {"assigned": True}


# --- Competency goals ---

@router.get("/competencies/{employee_id}")
async def get_competencies(employee_id: str):
    async with aiosqlite.connect(settings.database_url) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT skill_name, current_level, target_level, gap FROM competencies WHERE employee_id = ?",
            (employee_id,),
        )
        rows = [dict(r) for r in await cursor.fetchall()]
        return {"competencies": rows}


@router.put("/competencies")
async def update_competency_goal(body: CompetencyGoal):
    async with aiosqlite.connect(settings.database_url) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT current_level FROM competencies WHERE employee_id = ? AND skill_name = ?",
            (body.employee_id, body.skill_name),
        )
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Competency not found")
        current_level = row["current_level"]
        new_gap = max(0, body.target_level - current_level)
        await db.execute(
            "UPDATE competencies SET target_level = ?, gap = ? WHERE employee_id = ? AND skill_name = ?",
            (body.target_level, new_gap, body.employee_id, body.skill_name),
        )
        await db.commit()
    return {"skill_name": body.skill_name, "target_level": body.target_level, "gap": new_gap}
