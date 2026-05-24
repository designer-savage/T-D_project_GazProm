from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    database_url: str = "./db/td_demo.db"
    cors_origins: str = "http://localhost:3000"
    debug: bool = True
    seed_db: bool = True

    model_config = {"env_file": ".env"}


settings = Settings()
