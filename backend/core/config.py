import socket
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    database_url: str = "./db/td_demo.db"
    cors_origins: str = "http://localhost:3000"
    debug: bool = True
    seed_db: bool = True

    use_ollama: bool = False
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
    if settings.use_ollama:
        if _ollama_reachable():
            from langchain_ollama import ChatOllama
            return ChatOllama(
                base_url=settings.ollama_base_url,
                model=settings.ollama_model,
                num_predict=max_tokens,
            )
        # Ollama недоступен — пробуем Groq как запасной вариант
        if settings.groq_api_key:
            import logging
            logging.getLogger("uvicorn.error").warning(
                "Ollama недоступен — переключаюсь на Groq"
            )
            from langchain_groq import ChatGroq
            return ChatGroq(
                api_key=settings.groq_api_key,
                model=settings.groq_model,
                max_tokens=max_tokens,
            )
        raise RuntimeError(
            "Ollama недоступен и GROQ_API_KEY не задан. "
            "Запусти ollama serve или добавь ключ в backend/.env"
        )
    from langchain_groq import ChatGroq
    return ChatGroq(
        api_key=settings.groq_api_key,
        model=settings.groq_model,
        max_tokens=max_tokens,
    )
