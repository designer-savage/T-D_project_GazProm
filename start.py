#!/usr/bin/env python3
"""Cross-platform dev launcher: Linux, macOS, Windows."""
import os
import signal
import sys
import platform
import shutil
import subprocess
import threading
import time
import urllib.request
import urllib.error
from pathlib import Path

ROOT = Path(__file__).parent
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend"

IS_WINDOWS = platform.system() == "Windows"

if IS_WINDOWS:
    try:
        import ctypes
        ctypes.windll.kernel32.SetConsoleOutputCP(65001)
        ctypes.windll.kernel32.SetConsoleCP(65001)
        handle = ctypes.windll.kernel32.GetStdHandle(-11)
        if handle and handle != -1:
            ctypes.windll.kernel32.SetConsoleMode(handle, 7)
    except Exception:
        pass
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
BLUE   = "\033[94m"
GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
RESET  = "\033[0m"


def print_backend(msg: str):
    print(f"{BLUE}[backend]{RESET}  {msg}", flush=True)

def print_frontend(msg: str):
    print(f"{GREEN}[frontend]{RESET} {msg}", flush=True)

def print_ollama(msg: str):
    print(f"{YELLOW}[ollama]{RESET}   {msg}", flush=True)

def print_error(msg: str):
    print(f"{RED}[error]{RESET}    {msg}", flush=True)


def stream(proc: subprocess.Popen, label_fn):
    for raw in iter(proc.stdout.readline, b""):
        line = raw.decode("utf-8", errors="replace").rstrip()
        if line:
            label_fn(line)


def check_python():
    if sys.version_info < (3, 11):
        print_error(f"Нужен Python 3.11+, обнаружен {sys.version.split()[0]}")
        sys.exit(1)


def check_node():
    if not shutil.which("node"):
        print_error("Node.js не найден. Установи с https://nodejs.org/ (версия 18+)")
        sys.exit(1)
    if not shutil.which("npm"):
        print_error("npm не найден.")
        sys.exit(1)


def _set_env_var(key: str, value: str):
    """Обновляет или добавляет переменную в backend/.env."""
    env_file = BACKEND / ".env"
    if not env_file.exists():
        env_example = BACKEND / ".env.example"
        if env_example.exists():
            shutil.copy(env_example, env_file)
        else:
            env_file.write_text(f"{key}={value}\n", encoding="utf-8")
            return
    content = env_file.read_text(encoding="utf-8")
    lines = content.splitlines()
    found = False
    new_lines = []
    for line in lines:
        if line.startswith(f"{key}=") or line.startswith(f"# {key}="):
            new_lines.append(f"{key}={value}")
            found = True
        else:
            new_lines.append(line)
    if not found:
        new_lines.append(f"{key}={value}")
    env_file.write_text("\n".join(new_lines) + "\n", encoding="utf-8")


def _ollama_is_running(base_url: str = "http://localhost:11434") -> bool:
    try:
        urllib.request.urlopen(f"{base_url}/api/tags", timeout=2)
        return True
    except Exception:
        return False


def _ollama_model_exists(model: str, base_url: str = "http://localhost:11434") -> bool:
    import json
    try:
        with urllib.request.urlopen(f"{base_url}/api/tags", timeout=5) as resp:
            data = json.loads(resp.read())
        names = [m.get("name", "") for m in data.get("models", [])]
        # сравниваем без тега :latest для гибкости
        model_base = model.split(":")[0]
        return any(n == model or n.startswith(model_base) for n in names)
    except Exception:
        return False


def setup_ollama() -> tuple[bool, "subprocess.Popen | None"]:
    """
    Проверяет Ollama, при необходимости запускает сервис и скачивает модель.
    Возвращает (ollama_ready, proc_or_None).
    proc — только если мы сами его запустили (нужен для cleanup).
    """
    if not shutil.which("ollama"):
        print_ollama("Ollama не установлен — будет использован Groq")
        return False, None

    # Читаем модель из .env
    env_file = BACKEND / ".env"
    ollama_model = "yandex/YandexGPT-5-Lite-8B-instruct-GGUF:latest"
    ollama_base_url = "http://localhost:11434"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            if line.startswith("OLLAMA_MODEL="):
                ollama_model = line.split("=", 1)[1].strip()
            if line.startswith("OLLAMA_BASE_URL="):
                ollama_base_url = line.split("=", 1)[1].strip()

    ollama_proc = None
    we_started = False

    if _ollama_is_running(ollama_base_url):
        print_ollama("Сервис уже запущен")
    else:
        print_ollama("Запускаю ollama serve...")
        ollama_proc = subprocess.Popen(
            ["ollama", "serve"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        we_started = True

        # Ждём готовности — до 15 секунд
        for i in range(30):
            time.sleep(0.5)
            if _ollama_is_running(ollama_base_url):
                print_ollama("Сервис готов")
                break
        else:
            print_error("Ollama не ответил за 15 сек — переключаюсь на Groq")
            ollama_proc.terminate()
            return False, None

    # Проверяем наличие модели
    if _ollama_model_exists(ollama_model, ollama_base_url):
        print_ollama(f"Модель {ollama_model} уже скачана")
    else:
        print_ollama(f"Скачиваю модель {ollama_model} (может занять несколько минут)...")
        pull_proc = subprocess.Popen(
            ["ollama", "pull", ollama_model],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
        )
        for raw in iter(pull_proc.stdout.readline, b""):
            line = raw.decode("utf-8", errors="replace").rstrip()
            if line:
                print_ollama(line)
        pull_proc.wait()
        if pull_proc.returncode != 0:
            print_error("Не удалось скачать модель — переключаюсь на Groq")
            if we_started and ollama_proc:
                ollama_proc.terminate()
            return False, None
        print_ollama("Модель готова")

    _set_env_var("USE_OLLAMA", "true")
    return True, ollama_proc if we_started else None


def setup_env(ollama_ready: bool):
    env_file = BACKEND / ".env"
    env_example = BACKEND / ".env.example"

    if not env_file.exists():
        if env_example.exists():
            shutil.copy(env_example, env_file)
            print_backend("Создан backend/.env из .env.example")
        else:
            print_error("Нет backend/.env — создай его")
            sys.exit(1)

    if not ollama_ready:
        # Если Ollama недоступен, Groq обязателен
        content = env_file.read_text(encoding="utf-8")
        if "GROQ_API_KEY=your_groq_api_key_here" in content or "GROQ_API_KEY=\n" in content or "GROQ_API_KEY=" not in content:
            print_error("Ollama недоступен и GROQ_API_KEY не задан в backend/.env")
            print_error("Впиши ключ (бесплатно: https://console.groq.com) или установи Ollama")
            sys.exit(1)
        _set_env_var("USE_OLLAMA", "false")


def setup_venv() -> Path:
    venv = BACKEND / ".venv"
    if IS_WINDOWS:
        python_bin = venv / "Scripts" / "python.exe"
        pip_bin    = venv / "Scripts" / "pip.exe"
    else:
        python_bin = venv / "bin" / "python"
        pip_bin    = venv / "bin" / "pip"

    if not venv.exists():
        print_backend("Создаю виртуальное окружение...")
        subprocess.run([sys.executable, "-m", "venv", str(venv)], check=True)

    print_backend("Проверяю зависимости...")
    subprocess.run(
        [str(pip_bin), "install", "-q", "-r", str(BACKEND / "requirements.txt")],
        check=True,
    )
    return python_bin


def npm(*args: str) -> list[str]:
    if IS_WINDOWS:
        return ["cmd", "/c", "npm"] + list(args)
    return ["npm"] + list(args)


def setup_frontend():
    if not (FRONTEND / "node_modules").exists():
        print_frontend("Устанавливаю node_modules...")
        subprocess.run(
            npm("install", "--prefix", str(FRONTEND), "--silent"),
            check=True,
        )


def main():
    print(f"\nПлатформа: {platform.system()} {platform.machine()}\n")

    check_python()
    check_node()

    # Ollama проверяем до setup_env — она влияет на проверку GROQ_API_KEY
    ollama_ready, ollama_proc = setup_ollama()

    setup_env(ollama_ready)
    python_bin = setup_venv()
    setup_frontend()

    provider = "Ollama (локально)" if ollama_ready else "Groq API"
    print(f"\n  LLM      -> {provider}")
    print(f"  backend  -> http://localhost:8000")
    print(f"  frontend -> http://localhost:3000")
    print(f"\nCtrl+C для остановки\n")

    popen_kwargs = {} if IS_WINDOWS else {"preexec_fn": os.setsid}

    backend_proc = subprocess.Popen(
        [str(python_bin), "main.py"],
        cwd=str(BACKEND),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        **popen_kwargs,
    )
    frontend_proc = subprocess.Popen(
        npm("--prefix", str(FRONTEND), "run", "dev"),
        cwd=str(ROOT),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        **popen_kwargs,
    )

    threading.Thread(target=stream, args=(backend_proc,  print_backend),  daemon=True).start()
    threading.Thread(target=stream, args=(frontend_proc, print_frontend), daemon=True).start()

    def kill_proc(proc: subprocess.Popen):
        if proc.poll() is not None:
            return
        if IS_WINDOWS:
            subprocess.call(
                ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        else:
            try:
                os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
            except ProcessLookupError:
                pass

    def shutdown(reason: str | None = None):
        if reason:
            print_error(reason)
        print("\nОстанавливаю...")
        kill_proc(backend_proc)
        kill_proc(frontend_proc)
        if ollama_proc:
            print_ollama("Останавливаю ollama serve...")
            kill_proc(ollama_proc)

    try:
        while True:
            if backend_proc.poll() is not None:
                shutdown("Бэкенд завершился неожиданно")
                break
            if frontend_proc.poll() is not None:
                shutdown("Фронтенд завершился неожиданно")
                break
            threading.Event().wait(0.5)
    except KeyboardInterrupt:
        shutdown()

    backend_proc.wait()
    frontend_proc.wait()
    if ollama_proc:
        ollama_proc.wait()


if __name__ == "__main__":
    main()
