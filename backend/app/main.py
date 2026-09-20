import time
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .core.config import settings, logger
from .api import (
    location,
    competitors,
    market,
    census,
    udyam,
    finance,
    schemes,
    advisory,
    rag
)
from contextlib import asynccontextmanager
from .core.database import engine, Base, init_postgis, SessionLocal

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up SIH26091 API & verifying database connectivity...")
    try:
        init_postgis()
        Base.metadata.create_all(bind=engine)
        try:
            from database.seed_data import seed_development_database
            seed_development_database()
        except Exception as seed_err:
            logger.info(f"Database seed note: {seed_err}")
        try:
            from .services.rag_service import seed_rag_knowledge_base
            with SessionLocal() as db:
                seed_rag_knowledge_base(db)
        except Exception as rag_err:
            logger.info(f"RAG knowledge base seed note: {rag_err}")
    except Exception as e:
        logger.warning(f"Database initialization note: {e}")
    yield
    logger.info("SIH26091 Advisory API shutdown completed.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Driven Hyper-Local Business Advisory & Financial Structuring API for Rural Micro-Entrepreneurs (SIH26091)",
    lifespan=lifespan
)

# Configure CORS for frontend React/Vite application
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging & Performance Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.info(f"Incoming {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000.0
        response.headers["X-Process-Time-Ms"] = str(round(process_time, 2))
        logger.info(f"Completed {request.method} {request.url.path} with status {response.status_code} in {process_time:.1f}ms")
        return response
    except Exception as exc:
        logger.error(f"Unhandled error processing {request.method} {request.url.path}: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": "An internal server error occurred.", "detail": str(exc)}
        )

# Required Health Endpoint: GET /api/health
@app.get("/api/health", tags=["System Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

# Root endpoint for quick verification
@app.get("/", tags=["System Health"])
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "docs": "/docs",
        "health": "/api/health"
    }

# Mount under /api directly (e.g. /api/location/geocode, /api/competitors/search, /api/market/analyze, /api/census/..., /api/udyam/..., /api/finance/calculate)
app.include_router(location.router, prefix="/api")
app.include_router(competitors.router, prefix="/api")
app.include_router(market.router, prefix="/api")
app.include_router(census.router, prefix="/api")
app.include_router(udyam.router, prefix="/api")
app.include_router(finance.router, prefix="/api")
app.include_router(schemes.router, prefix="/api")
app.include_router(advisory.router, prefix="/api")
app.include_router(advisory.advisory_router, prefix="/api")
app.include_router(rag.router, prefix="/api")

# Mount under /api/v1 for versioned API client endpoints
app.include_router(location.router, prefix=settings.API_V1_STR)
app.include_router(competitors.router, prefix=settings.API_V1_STR)
app.include_router(market.router, prefix=settings.API_V1_STR)
app.include_router(census.router, prefix=settings.API_V1_STR)
app.include_router(udyam.router, prefix=settings.API_V1_STR)
app.include_router(finance.router, prefix=settings.API_V1_STR)
app.include_router(schemes.router, prefix=settings.API_V1_STR)
app.include_router(advisory.router, prefix=settings.API_V1_STR)
app.include_router(advisory.advisory_router, prefix=settings.API_V1_STR)
app.include_router(rag.router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
