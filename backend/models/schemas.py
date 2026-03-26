from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Literal, Optional

from pydantic import BaseModel


# --- API Request/Response Models ---

class ScreenRequest(BaseModel):
    sequence: str
    name: Optional[str] = "Untitled Sequence"


class ScreenResponse(BaseModel):
    job_id: str
    status: Literal["queued"] = "queued"


# --- Core Data Models (match frontend/lib/types.ts exactly) ---

class ScreeningStep(BaseModel):
    id: str
    name: str
    description: str
    status: Literal["pending", "running", "complete", "skipped"]
    duration: Optional[float] = None


class Region(BaseModel):
    start: int
    end: int
    type: Literal["biorisk", "regulated", "benign", "unknown"]
    label: str
    score: Optional[float] = None


class ScreeningResult(BaseModel):
    overall: Literal["PASS", "FLAG", "WARNING", "ERROR"]
    steps: list[ScreeningStep]
    regions: list[Region]
    report_html: Optional[str] = None
    report_json: Optional[dict[str, Any]] = None


class ScreeningJob(BaseModel):
    job_id: str
    status: Literal["queued", "processing", "complete", "error"]
    current_step: Optional[int] = None
    result: Optional[ScreeningResult] = None
    error: Optional[str] = None


class ExampleSequence(BaseModel):
    name: str
    description: str
    sequence: str


# --- Internal Storage (not exposed via API) ---

@dataclass
class JobRecord:
    job_id: str
    status: str = "queued"
    name: str = "Untitled Sequence"
    sequence: str = ""
    current_step: Optional[int] = None
    result: Optional[ScreeningResult] = None
    error: Optional[str] = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    temp_dir: Optional[str] = None
    task: Optional[asyncio.Task] = None

    def to_api_model(self) -> ScreeningJob:
        return ScreeningJob(
            job_id=self.job_id,
            status=self.status,
            current_step=self.current_step,
            result=self.result,
            error=self.error,
        )
