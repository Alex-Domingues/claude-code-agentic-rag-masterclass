from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    openai_api_key: str
    openai_vector_store_id: str
    supabase_url: str
    supabase_service_role_key: str
    langsmith_api_key: str
    langsmith_project: str = "rag-masterclass"


settings = Settings()
