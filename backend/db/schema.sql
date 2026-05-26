CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee',
    grade TEXT NOT NULL,
    department TEXT,
    manager_id TEXT,
    hire_date TEXT
);

CREATE TABLE IF NOT EXISTS kpi_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT REFERENCES employees(id),
    period TEXT,
    score REAL,
    category TEXT,
    details TEXT
);

CREATE TABLE IF NOT EXISTS competencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT REFERENCES employees(id),
    skill_name TEXT,
    current_level INTEGER,
    target_level INTEGER,
    gap INTEGER
);

CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    duration_hours INTEGER,
    category TEXT,
    grade_target TEXT,
    url TEXT
);

CREATE TABLE IF NOT EXISTS learning_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT REFERENCES employees(id),
    course_id TEXT REFERENCES courses(id),
    status TEXT DEFAULT 'not_started',
    progress_pct INTEGER DEFAULT 0,
    started_at TEXT,
    completed_at TEXT
);

CREATE TABLE IF NOT EXISTS knowledge_documents (
    id TEXT PRIMARY KEY,
    title TEXT,
    category TEXT,
    content TEXT,
    created_at TEXT
);

CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_fts USING fts5(
    doc_id UNINDEXED,
    title,
    content,
    category UNINDEXED,
    tokenize='unicode61'
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT REFERENCES employees(id),
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);
