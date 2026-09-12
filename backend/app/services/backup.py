"""Consistent database snapshots and private recordings, without copying secrets."""
import asyncio
import hashlib
import json
import logging
import os
from pathlib import Path
import sqlite3
import subprocess
import tempfile
from datetime import datetime, timezone
from zipfile import ZipFile, ZIP_DEFLATED
from sqlalchemy.engine import make_url
from app.config import settings

logger = logging.getLogger(__name__)


def create_backup(label: str = "scheduled") -> Path:
    settings.BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    destination = settings.BACKUP_DIR / f"backup-{timestamp}-{label}.zip"
    url = make_url(settings.DATABASE_URL)
    manifest = {"created_at": timestamp, "database": url.get_backend_name(), "files": {}}
    with tempfile.TemporaryDirectory(prefix="ielts-backup-") as temp:
        snapshot = Path(temp) / ("database.sqlite3" if url.get_backend_name() == "sqlite" else "database.dump")
        if url.get_backend_name() == "sqlite":
            source_path = Path(url.database or "")
            if not source_path.is_file():
                raise RuntimeError("Backup source database does not exist.")
            source = sqlite3.connect(f"file:{source_path.as_posix()}?mode=ro", uri=True)
            target = sqlite3.connect(snapshot)
            try:
                source.backup(target)
                if target.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
                    raise RuntimeError("Backup integrity check failed.")
            finally:
                target.close()
                source.close()
        elif url.get_backend_name() == "postgresql":
            env = os.environ.copy()
            env.update(PGHOST=url.host or "localhost", PGPORT=str(url.port or 5432),
                       PGUSER=url.username or "", PGPASSWORD=url.password or "", PGDATABASE=url.database or "")
            subprocess.run(["pg_dump", "--format=custom", "--file", str(snapshot)], env=env, check=True,
                           capture_output=True, timeout=300)
        else:
            raise RuntimeError("Unsupported backup database.")
        partial = destination.with_suffix(".partial")
        try:
            with ZipFile(partial, "x", ZIP_DEFLATED) as archive:
                files = [(snapshot, snapshot.name)]
                for directory, prefix in ((settings.UPLOAD_DIR, "uploads"), (settings.CONTENT_AUDIO_DIR, "content_audio")):
                    if directory.exists():
                        files.extend((p, f"{prefix}/{p.relative_to(directory).as_posix()}")
                                     for p in directory.rglob("*") if p.is_file() and not p.is_symlink() and not p.name.endswith('.partial'))
                for path, name in files:
                    archive.write(path, name)
                    with path.open("rb") as stream:
                        manifest["files"][name] = hashlib.file_digest(stream, "sha256").hexdigest()
                archive.writestr("manifest.json", json.dumps(manifest, indent=2))
            partial.rename(destination)
        except BaseException:
            partial.unlink(missing_ok=True)
            raise
    return destination


async def backup_loop():
    while True:
        try:
            backups = list(settings.BACKUP_DIR.glob("backup-*-scheduled.zip"))
            last = max((p.stat().st_mtime for p in backups), default=0)
            if datetime.now(timezone.utc).timestamp() - last >= settings.BACKUP_INTERVAL_HOURS * 3600:
                await asyncio.to_thread(create_backup)
        except Exception:
            logger.exception("Scheduled backup failed; administrator action required")
        await asyncio.sleep(3600)


if __name__ == "__main__":
    print(create_backup(label="manual"))
