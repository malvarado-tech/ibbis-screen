import shutil
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Mock mode: auto-detected if commec binary not in PATH
    MOCK_MODE: Optional[bool] = None
    COMMEC_TIMEOUT: int = 300  # 5 minutes
    JOB_EXPIRY_SECONDS: int = 3600  # 1 hour
    CLEANUP_INTERVAL_SECONDS: int = 300  # 5 minutes

    # Screening options
    SKIP_TAXONOMY: bool = True  # Skip Steps 2-3 (requires NCBI nr/nt databases if False)
    COMMEC_THREADS: int = 2

    # Paths (relevant when running with real commec in Docker)
    COMMEC_CONFIG: str = "/opt/commec/config.yaml"
    COMMEC_DB_DIR: str = "/opt/commec/databases"
    TEMP_DIR: str = "/tmp/ibbis_jobs"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    model_config = {"env_prefix": "IBBIS_"}

    @property
    def is_mock_mode(self) -> bool:
        if self.MOCK_MODE is not None:
            return self.MOCK_MODE
        return shutil.which("commec") is None
