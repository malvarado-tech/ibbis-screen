from __future__ import annotations

import asyncio
import json
import logging
import re
import shutil
from pathlib import Path
from typing import Any, Optional
from uuid import uuid4

from config import Settings
from models.schemas import (
    ExampleSequence,
    JobRecord,
    Region,
    ScreeningResult,
    ScreeningStep,
)

logger = logging.getLogger(__name__)

# Valid IUPAC nucleotide characters
VALID_NUCLEOTIDES = set("ATGCUNRYSWKMBDHVatgcunryswkmbdhv")

# Maximum sequence length (10 million bp — generous but prevents abuse)
MAX_SEQUENCE_LENGTH = 10_000_000

# --- Mock Data (mirrors frontend/lib/mock-data.ts) ---

MOCK_STEPS_PASS = [
    ScreeningStep(id="1", name="Biorisk Scan", description="HMM profile matching against biorisk database", status="complete", duration=1.2),
    ScreeningStep(id="2", name="Protein Taxonomy", description="BLAST/DIAMOND search against NCBI nr", status="skipped"),
    ScreeningStep(id="3", name="Nucleotide Taxonomy", description="BLASTN search against NCBI core_nt", status="skipped"),
    ScreeningStep(id="4", name="Low-Concern Check", description="Clearing against benign databases", status="complete", duration=0.8),
]

MOCK_GFP_RESULT = ScreeningResult(
    overall="PASS",
    steps=[s.model_copy(update={"duration": d}) for s, d in zip(MOCK_STEPS_PASS, [1.2, None, None, 0.8])],
    regions=[Region(start=1, end=720, type="benign", label="GFP — Aequorea victoria fluorescent protein (common lab marker)")],
)

MOCK_INSULIN_RESULT = ScreeningResult(
    overall="PASS",
    steps=[s.model_copy(update={"duration": d}) for s, d in zip(MOCK_STEPS_PASS, [0.9, None, None, 0.6])],
    regions=[Region(start=1, end=333, type="benign", label="Insulin — Homo sapiens preproinsulin (therapeutic, low-concern)")],
)

MOCK_FLAGGED_RESULT = ScreeningResult(
    overall="FLAG",
    steps=[
        ScreeningStep(id="1", name="Biorisk Scan", description="HMM profile matching against biorisk database", status="complete", duration=1.5),
        ScreeningStep(id="2", name="Protein Taxonomy", description="BLAST/DIAMOND search against NCBI nr", status="skipped"),
        ScreeningStep(id="3", name="Nucleotide Taxonomy", description="BLASTN search against NCBI core_nt", status="skipped"),
        ScreeningStep(id="4", name="Low-Concern Check", description="Clearing against benign databases", status="complete", duration=1.1),
    ],
    regions=[
        Region(start=1, end=720, type="benign", label="GFP variant — fluorescent protein (benign)"),
        Region(start=721, end=891, type="biorisk", label="Flagged region — matches biorisk HMM profile (toxin-like domain)", score=0.94),
        Region(start=892, end=960, type="unknown", label="Uncharacterized region"),
    ],
)

MOCK_DEFAULT_RESULT = ScreeningResult(
    overall="PASS",
    steps=[
        ScreeningStep(id="1", name="Biorisk Scan", description="HMM profile matching against biorisk database", status="complete", duration=1.3),
        ScreeningStep(id="2", name="Protein Taxonomy", description="BLAST/DIAMOND search against NCBI nr", status="skipped"),
        ScreeningStep(id="3", name="Nucleotide Taxonomy", description="BLASTN search against NCBI core_nt", status="skipped"),
        ScreeningStep(id="4", name="Low-Concern Check", description="Clearing against benign databases", status="complete", duration=0.7),
    ],
    regions=[],
)

# Fingerprints for matching example sequences
MOCK_FINGERPRINTS = [
    ("ATGGTGAGCAAGGGCGAGGAG", MOCK_GFP_RESULT),       # GFP
    ("ATGGCCCTGTGGATGCGCCTC", MOCK_INSULIN_RESULT),    # Insulin
    ("ATGGCTAGCAAAGGAGAAGAA", MOCK_FLAGGED_RESULT),    # Flagged construct
]

EXAMPLE_SEQUENCES = [
    ExampleSequence(
        name="Green Fluorescent Protein (GFP)",
        description="Common lab marker protein from jellyfish. Expected result: PASS",
        sequence=">GFP_Example Green Fluorescent Protein\nATGGTGAGCAAGGGCGAGGAGCTGTTCACCGGGGTGGTGCCCATCCTGGTCGAGCTGGACGGCGACGTAAACGGCCACAAG\nTTCAGCGTGTCCGGCGAGGGCGAGGGCGATGCCACCTACGGCAAGCTGACCCTGAAGTTCATCTGCACCACCGGCAAGCTG",
    ),
    ExampleSequence(
        name="Human Insulin",
        description="Therapeutic protein, well-characterized. Expected result: PASS",
        sequence=">INS_Human Human Preproinsulin\nATGGCCCTGTGGATGCGCCTCCTGCCCCTGCTGGCGCTGCTGGCCCTCTGGGGACCTGACCCAGCCGCAGCCTTTGTGAACC\nAACACCTGTGCGGCTCACACCTGGTGGAAGCTCTCTACCTAGTGTGCGGGGAACGAGGCTTCTTCTACACACCCAAGACCCGC",
    ),
    ExampleSequence(
        name="Synthetic Construct (Flagged)",
        description="Synthetic sequence with a flagged insert region. Expected result: FLAG",
        sequence=">SYN_Construct_X Synthetic construct with insert\nATGGCTAGCAAAGGAGAAGAACTCTTCACTGGAGTTGTCCCAATTCTTGTTGAATTAGATGGTGATGTTAATGGGCACAAATT\nTTCTGTCAGTGGAGAGGGTGAAGGTGATGCAACATACGGAAAACTTACCCTTAAATTTATTTGCACTACTGGAAAACTACCTG",
    ),
]


class CommecService:
    """Owns job lifecycle: submission, screening execution, and job storage."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.mock_mode = settings.is_mock_mode
        self._jobs: dict[str, JobRecord] = {}

        if self.mock_mode:
            logger.info("CommecService running in MOCK MODE (commec not found or MOCK_MODE=true)")
        else:
            logger.info("CommecService running with REAL commec")

    # --- Job Management ---

    async def submit_job(self, sequence: str, name: str) -> str:
        """Validate input, create a job, and start screening. Returns job_id."""
        # Validate and get clean FASTA (raises ValueError on failure)
        clean_fasta = self.validate_fasta(sequence)

        job_id = f"job_{uuid4().hex[:12]}"
        job = JobRecord(
            job_id=job_id,
            name=name,
            sequence=clean_fasta,
        )
        self._jobs[job_id] = job

        task = asyncio.create_task(self._run_screening(job))
        job.task = task

        return job_id

    def get_job(self, job_id: str) -> Optional[JobRecord]:
        """Retrieve a job by ID."""
        return self._jobs.get(job_id)

    def active_job_count(self) -> int:
        """Count jobs that are currently queued or processing."""
        return sum(1 for j in self._jobs.values() if j.status in ("queued", "processing"))

    def cleanup_expired(self, max_age_seconds: int) -> int:
        """Remove jobs older than max_age_seconds. Returns count removed."""
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        expired = [
            jid for jid, job in self._jobs.items()
            if (now - job.created_at).total_seconds() > max_age_seconds
        ]
        for jid in expired:
            job = self._jobs.pop(jid, None)
            if job and job.task and not job.task.done():
                job.task.cancel()
        return len(expired)

    def cancel_all(self) -> None:
        """Cancel all running screening tasks (for shutdown)."""
        for job in self._jobs.values():
            if job.task and not job.task.done():
                job.task.cancel()

    # --- FASTA Validation ---

    def validate_fasta(self, sequence: str) -> str:
        """Validate and normalize input to FASTA format. Returns clean FASTA string."""
        sequence = sequence.strip()
        if not sequence:
            raise ValueError("Sequence cannot be empty.")

        lines = sequence.split("\n")
        header = ""
        seq_lines: list[str] = []

        if lines[0].startswith(">"):
            header = lines[0]
            seq_lines = lines[1:]
        else:
            header = ">query_sequence"
            seq_lines = lines

        # Reject multi-FASTA (multiple > headers)
        # Multi-sequence support has been intentionally omitted for this version.
        # It may be added in a future release.
        extra_headers = [i for i, line in enumerate(seq_lines) if line.strip().startswith(">")]
        if extra_headers:
            raise ValueError(
                "Multi-FASTA input is not currently supported. Please submit one sequence at a time. "
                "Multi-sequence support may be added in a future version."
            )

        # Join and clean sequence
        raw_seq = "".join(line.strip() for line in seq_lines)

        if not raw_seq:
            raise ValueError("No sequence data found after header.")

        # Validate characters
        invalid_chars = set(raw_seq) - VALID_NUCLEOTIDES
        if invalid_chars:
            raise ValueError(
                f"Invalid characters in sequence: {', '.join(sorted(invalid_chars))}. "
                "Only IUPAC nucleotide codes (A, T, G, C, U, N, R, Y, S, W, K, M, B, D, H, V) are accepted."
            )

        if len(raw_seq) < 50:
            raise ValueError(f"Sequence must be at least 50 base pairs (got {len(raw_seq)}).")

        if len(raw_seq) > MAX_SEQUENCE_LENGTH:
            raise ValueError(
                f"Sequence exceeds maximum length of {MAX_SEQUENCE_LENGTH:,} base pairs (got {len(raw_seq):,})."
            )

        # Sanitize header (strip non-printable / dangerous chars)
        header = re.sub(r"[^\x20-\x7E]", "", header)

        # Format as proper FASTA (80 chars per line)
        formatted_lines = [raw_seq[i:i + 80] for i in range(0, len(raw_seq), 80)]
        return f"{header}\n" + "\n".join(formatted_lines) + "\n"

    # --- Screening Execution ---

    async def _run_screening(self, job: JobRecord) -> None:
        """Main screening pipeline. Called via asyncio.create_task."""
        try:
            job.status = "processing"
            job.current_step = 1

            if self.mock_mode:
                result = await self._run_mock(job)
            else:
                result = await self._run_real(job.sequence, job)

            job.status = "complete"
            job.result = result
            job.current_step = None

        except ValueError as e:
            job.status = "error"
            job.error = str(e)
        except asyncio.TimeoutError:
            job.status = "error"
            job.error = "Screening timed out. The sequence may be too long for the demo deployment."
        except asyncio.CancelledError:
            job.status = "error"
            job.error = "Screening was cancelled."
        except Exception as e:
            logger.exception("Screening failed for job %s", job.job_id)
            job.status = "error"
            job.error = f"Screening failed: {e}"
        finally:
            job.current_step = None
            if job.temp_dir:
                shutil.rmtree(job.temp_dir, ignore_errors=True)
                job.temp_dir = None

    async def _run_mock(self, job: JobRecord) -> ScreeningResult:
        """Return mock results with realistic delays."""
        clean_seq = re.sub(r"^>.*\n?", "", job.sequence, count=1).replace("\n", "").replace(" ", "")

        # Step 1: Biorisk scan
        job.current_step = 1
        await asyncio.sleep(1.5)

        # Step 4: Low-concern check (steps 2-3 skipped)
        job.current_step = 4
        await asyncio.sleep(1.0)

        for fingerprint, result in MOCK_FINGERPRINTS:
            if fingerprint in clean_seq:
                return result

        return MOCK_DEFAULT_RESULT

    async def _run_real(self, fasta_content: str, job: JobRecord) -> ScreeningResult:
        """Run real commec screening via subprocess."""
        temp_dir = Path(self.settings.TEMP_DIR) / job.job_id
        temp_dir.mkdir(parents=True, exist_ok=True)
        job.temp_dir = str(temp_dir)

        fasta_path = temp_dir / "input.fasta"
        await asyncio.to_thread(fasta_path.write_text, fasta_content)

        output_prefix = temp_dir / "output"

        cmd = [
            "commec", "screen",
            str(fasta_path),
            "-o", str(output_prefix),
            "-d", self.settings.COMMEC_DB_DIR,
            "-t", str(self.settings.COMMEC_THREADS),
        ]
        if self.settings.SKIP_TAXONOMY:
            cmd.insert(2, "--skip-tx")

        # Pass config file if it exists
        config_path = Path(self.settings.COMMEC_CONFIG)
        if config_path.exists():
            cmd.extend(["-y", str(config_path)])

        job.current_step = 1
        logger.info("Running commec: %s", " ".join(cmd))

        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        try:
            stdout, stderr = await asyncio.wait_for(
                proc.communicate(),
                timeout=self.settings.COMMEC_TIMEOUT,
            )
        except asyncio.TimeoutError:
            proc.kill()
            await proc.communicate()
            raise

        logger.info("commec finished: code=%s, stdout=%s, stderr=%s",
                     proc.returncode,
                     stdout.decode(errors="replace")[:500] if stdout else "",
                     stderr.decode(errors="replace")[:500] if stderr else "")

        if proc.returncode != 0:
            err_msg = stderr.decode(errors="replace")[:500]
            raise RuntimeError(f"commec exited with code {proc.returncode}: {err_msg}")

        job.current_step = 4

        return await asyncio.to_thread(self._parse_commec_output, temp_dir)

    # --- Output Parsing ---

    def _parse_commec_output(self, temp_dir: Path) -> ScreeningResult:
        """Parse commec JSON + HTML output into our model."""
        # commec writes output.output.json and output_summary.html in temp_dir
        json_files = list(temp_dir.glob("*.output.json"))
        report_json: dict[str, Any] = {}
        report_html: str | None = None

        if json_files:
            try:
                report_json = json.loads(json_files[0].read_text())
            except (json.JSONDecodeError, OSError) as e:
                logger.warning("Failed to parse commec JSON output: %s", e)

        html_files = list(temp_dir.glob("*summary*.html"))
        if html_files:
            try:
                report_html = html_files[0].read_text()
            except OSError:
                pass

        try:
            return self._map_commec_json(report_json, report_html)
        except Exception as e:
            logger.warning("Failed to map commec output, using fallback: %s", e)
            return self._fallback_result(report_json, report_html)

    def _map_commec_json(self, data: dict[str, Any], report_html: str | None) -> ScreeningResult:
        """Map commec v1.0.3 JSON structure to our ScreeningResult model."""
        if not data or "queries" not in data:
            raise ValueError("Missing 'queries' in commec output")

        queries = data["queries"]
        query_name = next(iter(queries))
        query = queries[query_name]

        # Status mapping: commec Title Case → our UPPER CASE
        # Handles all ScreenStatus enum values from commec v1.0.3
        status_map = {
            "pass": "PASS", "flag": "FLAG", "warning": "WARNING", "error": "ERROR",
            "warning (cleared)": "PASS", "flag (cleared)": "PASS",
            "incomplete": "ERROR", "skip": "WARNING", "-": "WARNING",
        }
        query_status = query.get("status", {})
        raw_overall = query_status.get("screen_status", "Warning").lower()
        overall = status_map.get(raw_overall, "WARNING")

        rationale = query_status.get("rationale", "")
        if rationale:
            logger.info("Screening rationale for %s: %s", query_name, rationale)

        # Build step statuses from per-step fields (all ScreenStatus values)
        step_map = {
            "pass": "complete", "flag": "complete", "warning": "complete",
            "skip": "skipped", "error": "complete", "incomplete": "complete",
            "warning (cleared)": "complete", "flag (cleared)": "complete", "-": "pending",
        }
        biorisk_st = step_map.get(query_status.get("biorisk", "skip").lower(), "complete")
        protein_st = step_map.get(query_status.get("protein_taxonomy", "skip").lower(), "skipped")
        nt_st = step_map.get(query_status.get("nucleotide_taxonomy", "skip").lower(), "skipped")
        lc_st = step_map.get(query_status.get("low_concern", "skip").lower(), "complete")

        steps = [
            ScreeningStep(id="1", name="Biorisk Scan", description="HMM profile matching against biorisk database", status=biorisk_st),
            ScreeningStep(id="2", name="Protein Taxonomy", description="BLAST/DIAMOND against NCBI nr", status=protein_st),
            ScreeningStep(id="3", name="Nucleotide Taxonomy", description="BLASTN against NCBI core_nt", status=nt_st),
            ScreeningStep(id="4", name="Low-Concern Check", description="Clearing against benign databases", status=lc_st),
        ]

        # Parse hits into regions
        regions: list[Region] = []
        hits = query.get("hits", {})
        for hit_name, hit_data in hits.items():
            rec = hit_data.get("recommendation", {})
            hit_status = rec.get("status", "").lower()
            from_step = rec.get("from_step", "")

            if "biorisk" in from_step.lower():
                region_type = "biorisk"
            elif hit_status in ("pass", "cleared"):
                region_type = "benign"
            elif hit_status == "flag":
                region_type = "regulated" if "taxonomy" in from_step.lower() else "biorisk"
            else:
                region_type = "unknown"

            for r in hit_data.get("ranges", []):
                regions.append(Region(
                    start=r.get("query_start", r.get("match_start", 0)),
                    end=r.get("query_end", r.get("match_end", 0)),
                    type=region_type,
                    label=hit_data.get("description", hit_data.get("name", hit_name)),
                    score=r.get("e_value"),
                ))

        return ScreeningResult(
            overall=overall,
            steps=steps,
            regions=regions,
            report_html=report_html,
            report_json=data,
        )

    def _fallback_result(self, data: dict[str, Any], report_html: str | None) -> ScreeningResult:
        """Fallback when commec output can't be parsed normally."""
        return ScreeningResult(
            overall="WARNING",
            steps=[
                ScreeningStep(id="1", name="Biorisk Scan", description="HMM profile matching", status="complete"),
                ScreeningStep(id="2", name="Protein Taxonomy", description="Skipped in lightweight mode", status="skipped"),
                ScreeningStep(id="3", name="Nucleotide Taxonomy", description="Skipped in lightweight mode", status="skipped"),
                ScreeningStep(id="4", name="Low-Concern Check", description="Benign database clearing", status="complete"),
            ],
            regions=[],
            report_html=report_html,
            report_json=data if data else None,
        )
