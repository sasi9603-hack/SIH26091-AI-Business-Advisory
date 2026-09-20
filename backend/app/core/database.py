from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from .config import settings, logger

Base = declarative_base()

def get_engine():
    db_url = settings.sync_database_url
    connect_args = {"connect_timeout": 10}
    # If connecting to remote PostgreSQL (e.g. Supabase), ensure sslmode is required if not present in URL
    if "postgresql" in db_url and "localhost" not in db_url and "127.0.0.1" not in db_url:
        if "sslmode" not in db_url:
            connect_args["sslmode"] = "require"

    try:
        eng = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            connect_args=connect_args
        )
        # Test connection
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Connected to primary PostgreSQL database.")
        return eng
    except Exception as e:
        if settings.ENVIRONMENT.lower() == "production":
            logger.critical(f"FATAL: Production database connection failed: {e}")
            raise RuntimeError(f"Database connection failed in production mode: {e}")
        logger.warning(
            f"Could not connect to PostgreSQL at {settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT} ({e}). "
            "Initializing development SQLite fallback database."
        )
        fallback_url = "sqlite:///./dev_sih26091.db"
        return create_engine(fallback_url, connect_args={"check_same_thread": False})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_postgis():
    """Initializes PostGIS spatial and pgvector extensions if running on PostgreSQL."""
    try:
        with engine.connect() as conn:
            if "postgresql" in str(engine.url):
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                try:
                    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                except Exception as ve:
                    logger.warning(f"Note on pgvector extension check: {ve}")
                conn.commit()
                logger.info("Spatial and vector extensions verified on PostgreSQL.")
    except Exception as e:
        logger.warning(f"Note on database extensions check: {e}")

