FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN useradd --create-home app && mkdir -p /data/uploads /data/backups && chown -R app:app /data
COPY --chown=app:app backend/ .
USER app
EXPOSE 8000
CMD ["sh", "-c", "python bootstrap.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
