from __future__ import annotations

import re

from fastapi import APIRouter, HTTPException, Path, Query, Request, Response
from fastapi.responses import JSONResponse

from models.schemas import (
    ScreeningJob,
    ScreenRequest,
    ScreenResponse,
)
from services.screening import EXAMPLE_SEQUENCES

router = APIRouter(prefix="/api/v1")

# Regex for valid job IDs (server-generated, safe characters only)
JOB_ID_PATTERN = r"^job_[a-f0-9]{12}$"


@router.post("/screen", response_model=ScreenResponse, status_code=201)
async def submit_screen(request: Request, body: ScreenRequest):
    """Submit a sequence for biosecurity screening."""
    service = request.app.state.screening_service

    try:
        job_id = await service.submit_job(body.sequence, body.name or "Untitled Sequence")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return ScreenResponse(job_id=job_id)


@router.get("/screen/{job_id}", response_model=ScreeningJob)
async def get_job_status(
    request: Request,
    job_id: str = Path(pattern=JOB_ID_PATTERN),
):
    """Get the status and results of a screening job."""
    service = request.app.state.screening_service
    job = service.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return job.to_api_model()


@router.get("/screen/{job_id}/report")
async def get_report(
    request: Request,
    job_id: str = Path(pattern=JOB_ID_PATTERN),
    format: str = Query("json", pattern="^(json|html)$"),
):
    """Download the screening report in JSON or HTML format."""
    service = request.app.state.screening_service
    job = service.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status != "complete" or not job.result:
        raise HTTPException(status_code=404, detail="Report not available yet. Job is still processing.")

    safe_id = re.sub(r"[^a-z0-9_]", "", job_id)

    if format == "html":
        if job.result.report_html:
            return Response(
                content=job.result.report_html,
                media_type="text/html",
                headers={"Content-Disposition": f'attachment; filename="{safe_id}_report.html"'},
            )
        raise HTTPException(status_code=404, detail="HTML report not available for this job.")

    content = job.result.report_json if job.result.report_json else job.result.model_dump()
    return JSONResponse(
        content=content,
        headers={"Content-Disposition": f'attachment; filename="{safe_id}_report.json"'},
    )


@router.get("/examples")
async def get_examples():
    """List available example sequences for testing."""
    return EXAMPLE_SEQUENCES


@router.get("/health")
async def health(request: Request):
    """Health check endpoint."""
    service = request.app.state.screening_service
    return {
        "status": "ok",
        "mock_mode": service.settings.is_mock_mode,
        "version": "0.1.0",
        "active_jobs": service.active_job_count(),
    }
