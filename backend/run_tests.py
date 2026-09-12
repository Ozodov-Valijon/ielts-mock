"""Run regression suites with an isolated database and no paid AI requests."""
import os
from pathlib import Path
import subprocess
import sys
import tempfile


def main():
    backend = Path(__file__).resolve().parent
    with tempfile.TemporaryDirectory(prefix='ielts-test-run-') as directory:
        root = Path(directory)
        env = os.environ.copy()
        env.update(DATABASE_URL=f'sqlite:///{(root / "test.db").as_posix()}', AI_ENABLED='false',
                   OPENAI_API_KEY='', GEMINI_API_KEY='', UPLOAD_DIR=str(root / 'uploads'),
                   BACKUP_DIR=str(root / 'backups'), ENVIRONMENT='development')
        for tests in (backend / 'tests', backend.parent / 'tests'):
            result = subprocess.run([sys.executable, '-m', 'unittest', 'discover', '-s', str(tests), '-v'], cwd=backend, env=env)
            if result.returncode:
                return result.returncode
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
