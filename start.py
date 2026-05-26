#!/usr/bin/env python3
"""Cross-platform dev launcher: Linux, macOS, Windows."""
import os
import sys
import platform
import shutil
import subprocess
import threading
from pathlib import Path

ROOT = Path(__file__).parent
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend"

IS_WINDOWS = platform.system() == "Windows"

# ANSI colours
if IS_WINDOWS:
    import ctypes
    ctypes.windll.kernel32.SetConsoleMode(
        ctypes.windll.kernel32.GetStdHandle(-11), 7
    )
BLUE  = "\033[94m"
GREEN = "\033[92m"
RED   = "\033[91m"
RESET = "\033[0m"


def print_backend(msg: str):
    print(f"{BLUE}[backend]{RESET}  {msg}", flush=True)

def print_frontend(msg: str):
    print(f"{GREEN}[frontend]{RESET} {msg}", flush=True)

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


def setup_env():
    env_file = BACKEND / ".env"
    env_example = BACKEND / ".env.example"

    if not env_file.exists():
        if env_example.exists():
            shutil.copy(env_example, env_file)
            print_backend("Создан backend/.env из .env.example")
        else:
            print_error("Нет backend/.env — создай его с GROQ_API_KEY")
            sys.exit(1)

    content = env_file.read_text(encoding="utf-8")
    if "GROQ_API_KEY=your_groq_api_key_here" in content or "GROQ_API_KEY=\n" in content:
        print_error("Впиши реальный GROQ_API_KEY в backend/.env")
        print_error("Ключ бесплатно: https://console.groq.com")
        sys.exit(1)


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


def setup_frontend():
    if not (FRONTEND / "node_modules").exists():
        print_frontend("Устанавливаю node_modules...")
        subprocess.run(
            ["npm", "install", "--prefix", str(FRONTEND), "--silent"],
            check=True,
        )


def main():
    print(f"\nПлатформа: {platform.system()} {platform.machine()}\n")

    check_python()
    check_node()
    setup_env()
    python_bin = setup_venv()
    setup_frontend()

    print(f"\n  backend  → http://localhost:8000")
    print(f"  frontend → http://localhost:3000")
    print(f"\nCtrl+C для остановки\n")

    backend_proc = subprocess.Popen(
        [str(python_bin), "main.py"],
        cwd=str(BACKEND),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev", "--prefix", str(FRONTEND)],
        cwd=str(ROOT),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )

    threading.Thread(target=stream, args=(backend_proc,  print_backend),  daemon=True).start()
    threading.Thread(target=stream, args=(frontend_proc, print_frontend), daemon=True).start()

    try:
        while True:
            if backend_proc.poll() is not None:
                print_error("Бэкенд завершился неожиданно")
                frontend_proc.terminate()
                break
            if frontend_proc.poll() is not None:
                print_error("Фронтенд завершился неожиданно")
                backend_proc.terminate()
                break
            threading.Event().wait(0.5)
    except KeyboardInterrupt:
        print("\nОстанавливаю...")
        backend_proc.terminate()
        frontend_proc.terminate()

    backend_proc.wait()
    frontend_proc.wait()


if __name__ == "__main__":
    main()
