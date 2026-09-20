from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from .config import settings, logger

Base = declarative_base()

def get_engine():
    db_url = settings.sync_database_url
    connect_args = {"connect_timeout": 5}
    # If connecting to remote PostgreSQL (e.g. Supabase), ensure sslmode is required if not present in URL
    if "postgresql" in db_url and "localhost" not in db_url and "127.0.0.1" not in db_url:
        if "sslmode" not in db_url:
            connect_args["sslmode"] = "require"

    try:
        eng = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            connect_args=connect_args
        )
        # Verify connection can be made
        with eng.connect() as test_conn:
            test_conn.execute(text("SELECT 1"))
        return eng
    except Exception as e:
        logger.warning(f"Note: Primary database connection failed ({e}). Falling back to SQLite local engine for resilience.")
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

