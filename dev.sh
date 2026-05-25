#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

# Цвета для логов
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_backend() { echo -e "${BLUE}[backend]${NC} $*"; }
log_frontend() { echo -e "${RED}[frontend]${NC} $*"; }

# Проверяем .env
if [ ! -f "$BACKEND/.env" ]; then
  if [ -f "$BACKEND/.env.example" ]; then
    cp "$BACKEND/.env.example" "$BACKEND/.env"
    echo "Создан backend/.env из .env.example — впиши GROQ_API_KEY"
    exit 1
  else
    echo "Нет backend/.env — создай его с GROQ_API_KEY"
    exit 1
  fi
fi

# Проверяем/создаём venv
if [ ! -d "$BACKEND/.venv" ]; then
  log_backend "Создаю виртуальное окружение..."
  python -m venv "$BACKEND/.venv"
fi

log_backend "Устанавливаю зависимости..."
"$BACKEND/.venv/bin/pip" install -q -r "$BACKEND/requirements.txt"

# Устанавливаем node_modules если нужно
if [ ! -d "$FRONTEND/node_modules" ]; then
  log_frontend "Устанавливаю node_modules..."
  npm install --prefix "$FRONTEND" --silent
fi

# Убиваем дочерние процессы при выходе
cleanup() {
  echo ""
  echo "Останавливаю процессы..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  exit 0
}
trap cleanup INT TERM

# Запускаем бэкенд
log_backend "Запускаю FastAPI на :8000..."
cd "$BACKEND"
.venv/bin/python main.py 2>&1 | sed "s/^/$(echo -e "${BLUE}[backend]${NC}") /" &
BACKEND_PID=$!

# Запускаем фронтенд
log_frontend "Запускаю Next.js на :3000..."
npm run dev --prefix "$FRONTEND" 2>&1 | sed "s/^/$(echo -e "${RED}[frontend]${NC}") /" &
FRONTEND_PID=$!

echo ""
echo "  backend  → http://localhost:8000"
echo "  frontend → http://localhost:3000"
echo ""
echo "Ctrl+C для остановки"

wait "$BACKEND_PID" "$FRONTEND_PID"
