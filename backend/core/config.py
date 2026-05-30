import socket
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "./db/td_demo.db"
    cors_origins: str = "http://localhost:3000"
    debug: bool = True
    seed_db: bool = True

    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "yandex/YandexGPT-5-Lite-8B-instruct-GGUF:latest"

    model_config = {"env_file": ".env"}


settings = Settings()


def _ollama_reachable() -> bool:
    try:
        url = settings.ollama_base_url.replace("http://", "").replace("https://", "")
        host, _, port_str = url.partition(":")
        port = int(port_str.rstrip("/")) if port_str else 11434
        s = socket.create_connection((host, port), timeout=1)
        s.close()
        return True
    except OSError:
        return False


def get_llm(max_tokens: int):
    if not _ollama_reachable():
        raise RuntimeError(
            "Ollama недоступен. Запусти ollama serve и убедись, что модель скачана."
        )
    from langchain_ollama import ChatOllama
    return ChatOllama(
        base_url=settings.ollama_base_url,
        model=settings.ollama_model,
        num_predict=max_tokens,
    )
