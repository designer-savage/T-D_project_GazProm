# Activation Guide — T&D AI Platform

Демо-прототип корпоративной T&D-экосистемы на базе AI-агентов (кейс HSCC, ИТ-кластер Газпром Нефти).

---

## Быстрый старт

Порядок запуска строго такой: **Ollama → бэкенд → фронтенд**

### 1. Ollama (локальная LLM)

```bash
ollama serve
```

Модель уже установлена — `mistral:latest` (4.4 GB). Проверить:

```bash
ollama list
```

### 2. Бэкенд

```bash
cd backend
python -m venv .venv                      # один раз
source .venv/bin/activate.fish            # активировать (fish shell)
pip install -r requirements.txt           # один раз
python main.py
```

При следующих запусках достаточно:

```bash
cd backend
source .venv/bin/activate.fish
python main.py
```

Поднимается FastAPI на `http://localhost:8000`. При каждом старте автоматически:
- создаётся SQLite (`db/td_demo.db`)
- заливаются seed-данные: 10 сотрудников, 20 курсов, 15 документов базы знаний

### 3. Фронтенд

```bash
cd frontend
npm install    # один раз
npm run dev
```

Открывается на `http://localhost:3000`.

---

## Переменные окружения

**`backend/.env`** — уже настроен:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral
DATABASE_URL=./db/td_demo.db
CORS_ORIGINS=http://localhost:3000
SEED_DB=true
```

**`frontend/.env.local`** — если хочешь гонять фронт без бэкенда:

```env
NEXT_PUBLIC_USE_MOCK=true
```

При `NEXT_PUBLIC_USE_MOCK=true` данные берутся из `src/mock/employee.ts`, Ollama не нужна.

---

## Архитектура

### Стек

| Слой | Технологии |
|---|---|
| LLM | Ollama (mistral 7B, локально) |
| Бэкенд | Python, FastAPI, LangChain, aiosqlite |
| База данных | SQLite + FTS5 (полнотекстовый поиск) |
| Фронтенд | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Стриминг | SSE (Server-Sent Events) |

---

### Бэкенд (`backend/`)

```
main.py               — точка входа, монтирует роутеры, инициализирует БД
core/
  config.py           — настройки из .env (pydantic-settings)
  database.py         — создание SQLite по схеме db/schema.sql
  seed_data.py        — начальные данные (сотрудники, курсы, документы)
routers/
  chat.py             — POST /chat/stream — главный эндпоинт, запускает оркестратор
  employees.py        — GET /employees/{id}
  career.py           — GET /career/{id}
  courses.py          — GET /courses
  dashboard.py        — GET /dashboard
agents/
  orchestrator.py     — классифицирует запрос, вызывает нужных агентов, генерирует SSE
  career_agent.py     — анализ карьерного трека, грейдов, компетенций
  learning_agent.py   — подбор курсов под запрос сотрудника
  onboarding_agent.py — ответы на вопросы по политикам и процессам
rag/
  retriever.py        — FTS5-поиск по knowledge_fts, возвращает топ-3 документа
```

### Поток запроса в чате

```
POST /chat/stream
  → orchestrator: классифицирует запрос по ключевым словам
      "карьер/грейд/рост"   → career_agent
      "курс/обучен/навык"   → learning_agent
      "онбординг/политик"   → onboarding_agent
      неоднозначно          → career + learning (оба)
  → агент: SQL-запрос за данными сотрудника + RAG по базе знаний
  → агент: формирует промпт → Ollama (mistral)
  → ответ чанками через SSE → фронтенд
```

SSE-события: `agent_switch` (смена агента), `token` (кусок текста), `separator`, `done`.

### RAG (поиск по базе знаний)

Без эмбеддингов и векторных БД. Работает через SQLite FTS5 (`knowledge_fts` — виртуальная таблица с `tokenize='unicode61'`). `retriever.py` делает `MATCH`-запрос, возвращает топ-3 документа, `format_context()` превращает их в строку для промпта.

### База данных (`db/schema.sql`)

```
employees          — сотрудники (id, name, role, grade, department)
competencies       — навыки сотрудника (skill_name, current_level, target_level, gap)
kpi_records        — KPI по периодам
courses            — каталог курсов (title, category, grade_target, duration_hours)
learning_progress  — прогресс прохождения курсов
knowledge_documents — корпус документов (политики, процессы, FAQ)
knowledge_fts      — FTS5-индекс поверх knowledge_documents
```

---

### Фронтенд (`frontend/src/`)

```
app/
  page.tsx           — редирект на /chat
  chat/page.tsx      — основная страница чата
  career/page.tsx    — карьерный трек
  onboarding/page.tsx — онбординг
  dashboard/page.tsx  — дашборд для менеджера
hooks/
  useStream.ts       — fetch → ReadableStream → парсинг SSE, хранит сообщения локально
lib/
  api.ts             — все запросы к бэкенду
  types.ts           — TypeScript-типы
mock/
  employee.ts        — фейковые данные для режима без бэкенда
components/
  layout/            — Sidebar, Header
  chat/              — ChatWindow, MessageBubble, ChatInput, AgentBadge
  career/            — CareerTrack, SkillGapCard
  dashboard/         — TeamProgress
```

---

## Хардкод, который надо знать

- `employee_id` передаётся в теле запроса вручную: `emp_001` (сотрудник) или `mgr_001` (менеджер) — авторизации нет
- `SEED_DB=true` в `.env` — seed-данные перезаписываются при каждом рестарте бэкенда (`INSERT OR IGNORE`)
- Модель и URL Ollama меняются только через `backend/.env`
