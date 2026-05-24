# Запуск проекта через Docker

## Требования

- [Docker](https://docs.docker.com/get-docker/) 24+
- [Docker Compose](https://docs.docker.com/compose/install/) v2 (обычно идёт в комплекте с Docker Desktop)

Проверить установку:
```bash
docker --version
docker compose version
```

---

## Быстрый старт

### 1. Клонировать репозиторий

```bash
git clone <repo-url>
cd multiagent-system
```

### 2. Настроить переменные окружения

```bash
cp backend/.env.example backend/.env
```

Открыть `backend/.env` и вписать ключ Groq:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Получить ключ можно бесплатно на [console.groq.com](https://console.groq.com).

### 3. Собрать и запустить

```bash
docker compose up --build
```

Первая сборка занимает 3-5 минут (установка Python и Node зависимостей). Последующие запуски без `--build` стартуют за несколько секунд.

### 4. Открыть приложение

| Сервис | URL |
|--------|-----|
| Фронтенд | http://localhost:3000 |
| API (Swagger) | http://localhost:8000/docs |

---

## Управление контейнерами

```bash
# Запустить в фоне
docker compose up --build -d

# Посмотреть логи
docker compose logs -f

# Логи конкретного сервиса
docker compose logs -f backend
docker compose logs -f frontend

# Остановить
docker compose down

# Остановить и удалить данные БД
docker compose down -v
```

---

## Структура Docker-конфигурации

```
multiagent-system/
├── docker-compose.yml       # оркестрация сервисов
├── backend/
│   ├── Dockerfile           # python:3.11-slim
│   ├── .env                 # секреты (не коммитить!)
│   └── .env.example         # шаблон переменных
└── frontend/
    └── Dockerfile           # node:20-alpine, multi-stage сборка
```

**Бэкенд** — образ на базе `python:3.11-slim`. Зависимости устанавливаются из `requirements.txt`, сервер стартует через `python main.py` на порту 8000.

**Фронтенд** — двухэтапная сборка: на первом этапе `npm run build` компилирует Next.js приложение, на втором — минимальный образ запускает готовый `server.js`. `NEXT_PUBLIC_API_URL` вшивается на этапе сборки.

**База данных** — SQLite, хранится в Docker volume `db_data`. Данные сохраняются между перезапусками контейнера. При первом запуске с `SEED_DB=true` автоматически засевается тестовыми данными (10 сотрудников, 20 курсов).

---

## Перенос на другую машину

1. Скопировать папку проекта
2. Создать `backend/.env` с ключом (см. шаг 2 выше)
3. Запустить `docker compose up --build`

Никаких дополнительных зависимостей устанавливать не нужно — всё внутри контейнеров.

---

## Частые проблемы

**Порт уже занят**

Если порт 3000 или 8000 занят другим процессом, поменяйте маппинг в `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"   # внешний:внутренний
```

**Фронтенд не может достучаться до бэкенда**

`NEXT_PUBLIC_API_URL` вшивается при сборке образа. Если бэкенд доступен не на `localhost:8000`, пересобери с нужным адресом:

```bash
docker compose build --build-arg NEXT_PUBLIC_API_URL=http://your-host:8000 frontend
docker compose up
```

**Сброс базы данных**

```bash
docker compose down -v   # удаляет volume с БД
docker compose up        # пересоздаёт БД и засевает данные заново
```
