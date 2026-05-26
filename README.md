# T&D AI Platform — Корпоративная экосистема обучения и развития

Демо-прототип системы на базе AI-агентов для ИТ-кластера Газпром Нефти (кейс-чемпионат HSCC). Сотрудник задаёт вопрос в чате — оркестратор определяет намерение, подключает нужных агентов, ответ стримится в реальном времени.

---

## Как это работает

Сотрудник пишет что-то вроде:
> «Хочу стать тимлидом через год, что мне нужно прокачать?»

Система делает следующее:

1. **Оркестратор** классифицирует запрос через LLM и понимает, что нужны два агента — карьеры и обучения
2. **Агент карьеры** смотрит текущий грейд, KPI, компетенции сотрудника
3. **Агент обучения** подбирает конкретные курсы из каталога под выявленные пробелы
4. Оба ответа стримятся в чат через SSE, история диалога сохраняется между сессиями

---

## Агенты

| Агент | Задача | Источники данных |
|---|---|---|
| **Оркестратор** | Классифицирует запрос через LLM, роутит к агентам | — |
| **Агент карьеры** | Анализирует грейд, KPI, строит карьерный трек | `employees`, `kpi_records`, `competencies` |
| **Агент обучения** | Подбирает курсы, строит траекторию | `courses`, `learning_progress` |
| **Агент онбординга** | Отвечает на вопросы по политикам и процессам | `knowledge_documents` (FTS5 RAG) |

Классификация запроса — один быстрый LLM-вызов (~200 мс), определяет одно из четырёх намерений: `career`, `learning`, `onboarding`, `mixed`. При `mixed` запускаются агент карьеры и агент обучения последовательно.

---

## Стек

| Слой | Технологии |
|---|---|
| LLM | Groq API (`llama-3.3-70b-versatile`) |
| Бэкенд | Python 3.11+, FastAPI, LangChain, aiosqlite |
| RAG | SQLite FTS5 (без эмбеддингов, полнотекстовый поиск) |
| Фронтенд | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Стриминг | SSE (Server-Sent Events) |
| БД | SQLite |
| Контейнеризация | Docker, Docker Compose |

---

## Запуск через Docker (рекомендуется)

Работает одинаково на Linux, macOS и Windows. Docker берёт на себя все зависимости.

### Требования

- [Docker Desktop](https://docs.docker.com/get-docker/) 24+ (включает Docker Compose v2)

Проверить установку:
```bash
docker --version
docker compose version
```

### 1. Получить исходники

**Через git:**
```bash
git clone https://github.com/designer-savage/T-D_project_GazProm.git
cd T-D_project_GazProm
```

**Или скачать архив** с [последнего релиза](https://github.com/designer-savage/T-D_project_GazProm/releases/latest) и распаковать.

### 2. Настроить окружение

**Linux / macOS:**
```bash
cp backend/.env.example backend/.env
```

**Windows (PowerShell):**
```powershell
Copy-Item backend\.env.example backend\.env
```

**Windows (cmd):**
```cmd
copy backend\.env.example backend\.env
```

Открыть `backend/.env` и вписать ключ Groq API:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Ключ можно получить бесплатно на [console.groq.com](https://console.groq.com).

### 3. Запустить

```bash
docker compose up --build
```

Первая сборка занимает 3–5 минут. Последующие запуски без `--build` стартуют за секунды.

### 4. Открыть

| | URL |
|---|---|
| Приложение | http://localhost:3000 |
| API / Swagger | http://localhost:8000/docs |

---

## Запуск локально (без Docker)

### Требования

- Python **3.11+** → [python.org](https://www.python.org/downloads/)
- Node.js **18+** → [nodejs.org](https://nodejs.org/)

### Linux / macOS / Windows — одной командой

```bash
python start.py
```

Скрипт определяет платформу автоматически, создаёт venv, устанавливает зависимости и поднимает бэкенд с фронтендом параллельно. Логи обоих процессов выводятся с цветными префиксами `[backend]` / `[frontend]`. Остановка — Ctrl+C.

При первом запуске, если `backend/.env` не существует, скрипт создаст его из `.env.example` и попросит вписать ключ. После этого запустить повторно.

FastAPI поднимается на `http://localhost:8000`, Next.js — на `http://localhost:3000`. При старте бэкенда автоматически создаётся SQLite и заливаются seed-данные: 10 сотрудников, 20 курсов, 15 документов базы знаний.

### Переменные окружения

**`backend/.env`** (создать из `.env.example`):

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
DATABASE_URL=./db/td_demo.db
CORS_ORIGINS=http://localhost:3000
SEED_DB=true
DEBUG=false
```

**`frontend/.env.local`** (опционально):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK=false   # true — работает без бэкенда, данные из mock/employee.ts
```

---

## Управление контейнерами

```bash
docker compose up --build -d      # запустить в фоне
docker compose logs -f            # логи всех сервисов
docker compose logs -f backend    # логи бэкенда
docker compose down               # остановить
docker compose down -v            # остановить + сбросить БД
```

---

## Частые проблемы

**Порт 3000 или 8000 уже занят** — поменять маппинг в `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"
```

**Фронтенд не достучаться до бэкенда** — `NEXT_PUBLIC_API_URL` вшивается при сборке образа. Если бэкенд на другом адресе:
```bash
docker compose build --build-arg NEXT_PUBLIC_API_URL=http://your-host:8000 frontend
docker compose up
```

**Сбросить базу данных:**
```bash
docker compose down -v
docker compose up
```

---

## Структура проекта

```
├── backend/
│   ├── agents/          # orchestrator, career_agent, learning_agent, onboarding_agent, reviewer
│   ├── core/            # config (pydantic-settings), database, seed_data
│   ├── db/              # schema.sql, td_demo.db (создаётся при старте)
│   ├── rag/             # retriever.py — FTS5 поиск по knowledge_fts
│   ├── routers/         # chat, employees, career, courses, dashboard
│   └── main.py
├── frontend/
│   └── src/
│       ├── app/         # /chat, /career, /onboarding, /dashboard
│       ├── components/  # layout, chat, career, dashboard
│       ├── hooks/       # useStream.ts — SSE-клиент
│       ├── lib/         # api.ts, types.ts
│       └── mock/        # employee.ts — данные для режима без бэкенда
└── docker-compose.yml
```
