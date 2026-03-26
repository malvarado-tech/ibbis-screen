FROM quay.io/biocontainers/commec:1.0.3--pyhdfd78af_0

# Install web framework dependencies
RUN pip install --no-cache-dir \
    fastapi>=0.110.0 \
    "uvicorn[standard]>=0.27.0" \
    pydantic>=2.0 \
    pydantic-settings>=2.0 \
    python-multipart>=0.0.6

# Download biorisk + low_concern databases (~236 MB zip)
RUN mkdir -p /opt/commec/databases && \
    wget -q -O /tmp/commec-dbs.zip \
      https://github.com/ibbis-bio/commec-databases/releases/download/v1.0.0/commec-dbs.zip && \
    unzip -o /tmp/commec-dbs.zip -d /opt/commec/databases && \
    rm /tmp/commec-dbs.zip

# Prepare HMM databases (hmmpress for HMMER)
RUN find /opt/commec/databases -name "*.hmm" -exec hmmpress -f {} \; || true

# Copy backend code
COPY . /app
WORKDIR /app

# Create temp directory for screening jobs
RUN mkdir -p /tmp/ibbis_jobs

# Real commec mode
ENV IBBIS_MOCK_MODE=false
ENV IBBIS_COMMEC_DB_DIR=/opt/commec/databases

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
