import logging
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "SIH26091 AI-Driven Business Advisory Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    FRONTEND_URL: Optional[str] = None
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    
    # PostgreSQL + PostGIS Connection Configuration
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "sih26091_advisory"
    DATABASE_URL: Optional[str] = None
    
    # AI / LLM Configuration (Never stored in database, loaded via ENV)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    
    # Google Maps & Places Configuration
    GOOGLE_MAPS_API_KEY: str = ""
    GOOGLE_GEOCODE_URL: str = "https://maps.googleapis.com/maps/api/geocode/json"
    GOOGLE_PLACES_URL: str = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    
    # External APIs (Open Data / Overpass / Nominatim)
    OVERPASS_API_URL: str = "https://overpass-api.de/api/interpreter"
    NOMINATIM_GEOCODE_URL: str = "https://nominatim.openstreetmap.org/search"
    GEOCODING_USER_AGENT: str = "SIH26091-Rural-Business-Advisory/1.0"
    
    # Census & Open Government Data (data.gov.in)
    DATA_GOV_IN_API_KEY: str = ""
    CENSUS_API_URL: str = "https://api.data.gov.in/resource/census-pca"
    
    # UDYAM & MSME Registry Open Data
    UDYAM_API_KEY: str = ""
    UDYAM_API_URL: str = "https://api.data.gov.in/resource/msme-udyam"
    
    # External API Resilience
    EXTERNAL_API_TIMEOUT_SECONDS: float = 6.0
    EXTERNAL_API_MAX_RETRIES: int = 2
    EXTERNAL_API_BACKOFF_FACTOR: float = 0.5
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        origins = []
        if self.CORS_ORIGINS:
            origins.extend([origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()])
        if self.FRONTEND_URL:
            for url in self.FRONTEND_URL.split(","):
                cleaned = url.strip().rstrip("/")
                if cleaned and cleaned not in origins:
                    origins.append(cleaned)
        return origins or ["*"]

    @property
    def sync_database_url(self) -> str:
        if self.DATABASE_URL:
            import urllib.parse
            url = self.DATABASE_URL.strip("'\" \r\n\t")
            # Auto-encode unescaped special characters (e.g. '@') in password
            if url.count("@") > 1 and "://" in url:
                scheme, remainder = url.split("://", 1)
                user_pass, host_part = remainder.rsplit("@", 1)
                if ":" in user_pass:
                    username, password = user_pass.split(":", 1)
                    safe_password = urllib.parse.quote_plus(urllib.parse.unquote_plus(password))
                    url = f"{scheme}://{username}:{safe_password}@{host_part}"

            # Normalize for psycopg2 if postgres:// or postgresql:// prefix provided (e.g. Supabase / Render)
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+psycopg2://", 1)
            elif url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
            return url
        return f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def async_database_url(self) -> str:
        if self.DATABASE_URL:
            import urllib.parse
            url = self.DATABASE_URL.strip("'\" \r\n\t")
            if url.count("@") > 1 and "://" in url:
                scheme, remainder = url.split("://", 1)
                user_pass, host_part = remainder.rsplit("@", 1)
                if ":" in user_pass:
                    username, password = user_pass.split(":", 1)
                    safe_password = urllib.parse.quote_plus(urllib.parse.unquote_plus(password))
                    url = f"{scheme}://{username}:{safe_password}@{host_part}"

            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+asyncpg://", 1)
            elif url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            elif url.startswith("postgresql+psycopg2://"):
                url = url.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)
            return url
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()

# Setup logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("sih26091")
