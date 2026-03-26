from __future__ import annotations

import asyncio
import logging
import sys
import time
from collections import defaultdict
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from api.routes import router
from config import Settings
from services.screening import CommecService


# ---------------------------------------------------------------------------
# Rate limiting middleware (IP-based, in-memory)
# ---------------------------------------------------------------------------
RATE_LIMIT_MAX = 10          # max screening submissions per window
RATE_LIMIT_WINDOW = 3600     # window in seconds (1 hour)

_rate_store: dict[str, list[float]] = defaultdict(list)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Block excessive POST /api/v1/screen requests per IP."""

    async def dispatch(self, request: Request, call_next):
        # Only rate-limit screening submissions
        if request.method == "POST" and request.url.path == "/api/v1/screen":
            ip = request.client.host if request.client else "unknown"
            now = time.time()
            # Prune old timestamps
            _rate_store[ip] = [t for t in _rate_store[ip] if now - t < RATE_LIMIT_WINDOW]
            if len(_rate_store[ip]) >= RATE_LIMIT_MAX:
                return Response(
                    content='{"detail":"Rate limit exceeded. Maximum 10 screenings per hour."}',
                    status_code=429,
                    media_type="application/json",
                )
            _rate_store[ip].append(now)
        return await call_next(request)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)


async def cleanup_expired_jobs(app: FastAPI) -> None:
    """Periodically remove expired jobs from memory."""
    settings: Settings = app.state.settings
    service: CommecService = app.state.screening_service
    while True:
        await asyncio.sleep(settings.CLEANUP_INTERVAL_SECONDS)
        removed = service.cleanup_expired(settings.JOB_EXPIRY_SECONDS)
        if removed:
            logger.info("Cleaned up %d expired jobs", removed)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    settings = Settings()
    app.state.settings = settings
    app.state.screening_service = CommecService(settings)

    logger.info(
        "IBBIS Screen API starting — mock_mode=%s, timeout=%ds, expiry=%ds",
        settings.is_mock_mode,
        settings.COMMEC_TIMEOUT,
        settings.JOB_EXPIRY_SECONDS,
    )

    cleanup_task = asyncio.create_task(cleanup_expired_jobs(app))

    yield

    # Shutdown
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass

    app.state.screening_service.cancel_all()
    logger.info("IBBIS Screen API shut down")


app = FastAPI(
    title="IBBIS Screen API",
    description="Biosecurity screening API wrapping the IBBIS Common Mechanism (commec) tool.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(RateLimitMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://ibbis.malvarado.org",
    ],
    allow_origin_regex=r"https://.*\.(vercel\.app|run\.app)",
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
