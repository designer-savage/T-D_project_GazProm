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


def get_llm(max_tokens: int):
    if settings.use_ollama:
        from langchain_ollama import ChatOllama
        return ChatOllama(base_url=settings.ollama_base_url, model=settings.ollama_model, num_predict=max_tokens)
    from langchain_groq import ChatGroq
    return ChatGroq(api_key=settings.groq_api_key, model=settings.groq_model, max_tokens=max_tokens)
