"""
AASHA AI TEAS — FastAPI entrypoint
Annanth Aasha Foundation
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import router as api_router

app = FastAPI(
    title="AASHA AI TEAS API",
    description=(
        "AI-native learning and impact ecosystem for Annanth Aasha Foundation. "
        "Transforms student books into reusable TLN nodes, simulations, assessments, and impact analytics."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    import asyncio
    from app.database import init_db
    try:
        init_db()
    except Exception as e:
        import logging
        logging.getLogger("main").error(f"Failed to initialize database: {e}")
        
    from app.services.telegram_service import telegram_polling_loop
    # Run the Telegram updates polling loop in the background
    asyncio.create_task(telegram_polling_loop())




@app.get("/health", tags=["system"])
def health():
    return {
        "status": "ok",
        "service": "aasha-ai-teas-api",
        "version": "1.0.0",
        "organisation": "Annanth Aasha Foundation",
        "centre_mode": os.getenv("CENTRE_MODE", "ground_execution"),
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc), "service": "aasha-ai-teas-api"},
    )
