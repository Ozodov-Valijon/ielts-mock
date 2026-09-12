"""Disposable browser-QA server; never uses the user's accounts or database."""
import os
from pathlib import Path
import tempfile


def main():
    with tempfile.TemporaryDirectory(prefix='ielts-browser-qa-') as directory:
        root = Path(directory)
        os.environ.update(DATABASE_URL=f'sqlite:///{(root / "qa.db").as_posix()}',
            UPLOAD_DIR=str(root / 'uploads'), BACKUP_DIR=str(root / 'backups'),
            AI_ENABLED='false', OPENAI_API_KEY='', GEMINI_API_KEY='', ENVIRONMENT='development',
            SECRET_KEY='disposable-local-qa-key-not-for-production')
        from app.migrations import initialize_database
        from app.database import SessionLocal, engine
        from app.models import User
        from app.services.auth import hash_password
        from seed_practice import seed_practice
        initialize_database()
        seed_practice()
        with SessionLocal() as db:
            for role in ('student', 'admin'):
                db.add(User(email=f'qa-{role}@example.com', full_name=f'QA {role}', role=role,
                            password_hash=hash_password('QA-local-test-2026')))
            db.commit()
        import uvicorn
        try:
            uvicorn.run('app.main:app', host='127.0.0.1', port=18000)
        finally:
            engine.dispose()


if __name__ == '__main__':
    main()
