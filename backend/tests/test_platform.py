"""Platform regressions: real auth, storage, AI safety, catalog, migration, backup."""
import asyncio
import hashlib
import io
import json
import sqlite3
import tempfile
import unittest
import wave
from pathlib import Path
from unittest.mock import patch
from zipfile import ZipFile

from fastapi import FastAPI, UploadFile
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from starlette.datastructures import Headers

from app.config import settings
from app.database import Base, get_db
from app.models import User, TestQuestion
from app.routers import auth, content
from app.services.auth import create_access_token, hash_password
from app.services.storage import save_upload, audio_response
from app.services.scoring import check_answer, calculate_overall_band
from app.services import ai_runtime, ai_writing, ai_speaking
from app.migrations import initialize_database
from app.services.backup import create_backup


def wav_bytes():
    stream = io.BytesIO()
    with wave.open(stream, 'wb') as recording:
        recording.setnchannels(1)
        recording.setsampwidth(2)
        recording.setframerate(16000)
        recording.writeframes(b'\0\0' * 1600)
    return stream.getvalue()


class PlatformTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='ielts-platform-test-')
        self.root = Path(self.temp.name)
        self.engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
        Base.metadata.create_all(self.engine)
        self.sessions = sessionmaker(bind=self.engine)
        self.db = self.sessions()
        self.app = FastAPI()
        self.app.include_router(auth.router, prefix='/api/v1')
        self.app.include_router(content.router, prefix='/api/v1')
        self.app.dependency_overrides[get_db] = lambda: self.db
        self.client = TestClient(self.app)
        self.patches = [patch.object(settings, 'UPLOAD_DIR', self.root / 'uploads'),
                        patch.object(settings, 'CONTENT_AUDIO_DIR', self.root / 'content'),
                        patch.object(settings, 'BACKUP_DIR', self.root / 'backups'),
                        patch.object(settings, 'AI_ENABLED', False)]
        for item in self.patches:
            item.start()

    def tearDown(self):
        self.client.close()
        self.db.close()
        self.engine.dispose()
        for item in reversed(self.patches):
            item.stop()
        self.temp.cleanup()

    def register(self, **overrides):
        return self.client.post('/api/v1/auth/register', json={'full_name': 'Test Student',
            'password': 'test-secret-strong', **overrides})

    def test_phone_only_registration_login_and_duplicate(self):
        result = self.register(phone='+998 (90) 123-45-67')
        self.assertEqual(result.status_code, 200, result.text)
        self.assertIsNone(result.json()['email'])
        self.assertEqual(result.json()['phone'], '+998901234567')
        login = self.client.post('/api/v1/auth/login', json={'identifier': '+998 90 1234567', 'password': 'test-secret-strong'})
        self.assertEqual(login.status_code, 200, login.text)
        me = self.client.get('/api/v1/auth/me', headers={'Authorization': 'Bearer ' + login.json()['access_token']})
        self.assertEqual(me.status_code, 200)
        self.assertEqual(self.register(phone='998901234567').status_code, 409)

    def test_email_case_legacy_login_and_bad_contacts(self):
        self.assertEqual(self.register(email='Student@Example.com').status_code, 200)
        result = self.client.post('/api/v1/auth/login', json={'email': 'STUDENT@example.com', 'password': 'test-secret-strong'})
        self.assertEqual(result.status_code, 200, result.text)
        self.assertEqual(self.register(email='student@example.com').status_code, 409)
        for values in ({}, {'phone': 'invalid'}, {'email': 'not-email'}, {'email': 'x@example.com', 'password': 'short'}):
            self.assertEqual(self.register(**values).status_code, 422)

    def test_bad_jwt_subject_and_unauthorized_audio(self):
        token = create_access_token({'sub': 'not-a-number'})
        result = self.client.get('/api/v1/auth/me', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(result.status_code, 401)
        self.assertEqual(self.client.get('/api/v1/content/audio/sample.wav').status_code, 401)

    def upload(self, value, filename='recording.wav', mime='audio/wav'):
        file = UploadFile(file=io.BytesIO(value), filename=filename, headers=Headers({'content-type': mime}))
        return asyncio.run(save_upload(file))

    def test_upload_size_type_cleanup_and_path_safety(self):
        data = wav_bytes()
        path = self.upload(data)
        self.assertEqual(path.read_bytes(), data)
        for payload, filename, mime in ((data, 'file.html', 'text/html'), (b'not audio bytes', 'x.wav', 'audio/wav')):
            with self.assertRaises(Exception) as failure:
                self.upload(payload, filename, mime)
            self.assertEqual(failure.exception.status_code, 415)
        with patch.object(settings, 'MAX_UPLOAD_SIZE_BYTES', 100):
            with self.assertRaises(Exception) as failure:
                self.upload(data)
            self.assertEqual(failure.exception.status_code, 413)
        self.assertEqual(len(list(settings.UPLOAD_DIR.iterdir())), 1)
        outside = self.root / 'private.txt'
        outside.write_text('private')
        with self.assertRaises(Exception) as failure:
            audio_response(outside)
        self.assertEqual(failure.exception.status_code, 404)

    def test_scoring_keeps_meridiem_decimal_and_fraction(self):
        self.assertFalse(check_answer('6 am', '6 pm'))
        self.assertFalse(check_answer('6', '6 pm'))
        self.assertFalse(check_answer('2 5', '2.5'))
        self.assertTrue(check_answer('6:00 pm', '6 pm'))
        self.assertTrue(check_answer('1/2', '1/2'))
        self.assertFalse(check_answer('1', '1/2'))
        self.assertTrue(check_answer('six', '6'))
        self.assertTrue(check_answer('NG', 'Not Given'))
        self.assertEqual(calculate_overall_band([6, 6, 6, 7]), 6.5)

    def test_ai_unavailable_does_not_fabricate_scores(self):
        result = asyncio.run(ai_writing.analyze_writing('essay', 1, 'Describe a chart'))
        self.assertIsNone(result['ai_score'])
        self.assertEqual(json.loads(result['ai_analysis'])['status'], 'unavailable')
        self.assertEqual(ai_speaking.transcribe_audio('/nonexistent/file.wav'), '')
        self.assertIsNone(asyncio.run(ai_speaking.analyze_speaking('', 1))['ai_score'])

    def test_ai_rejects_nonfinite_scores_and_no_pronunciation(self):
        with self.assertRaises(ValueError):
            ai_runtime.validate_analysis({'summary': 'x', 'criterion': {'score': float('nan'), 'comment': 'x'}, 'overall_band': 6}, ['criterion'], True)
        value = {'summary': 'x', 'fluency_coherence': {'score': 6, 'comment': 'x'}, 'overall_band': 9}
        result = ai_runtime.validate_analysis(value, ['fluency_coherence'], False)
        self.assertIsNone(result['ai_score'])
        self.assertIsNone(json.loads(result['ai_analysis'])['pronunciation']['score'])

    def test_daily_ai_request_limit_persisted(self):
        with patch.object(settings, 'AI_ENABLED', True), patch.object(settings, 'AI_DAILY_REQUEST_LIMIT', 2), patch.object(ai_runtime, 'SessionLocal', self.sessions):
            self.assertTrue(ai_runtime.reserve_request())
            self.assertTrue(ai_runtime.reserve_request())
            self.assertFalse(ai_runtime.reserve_request())

    def test_demo_is_not_full_and_legacy_content_remains_available(self):
        settings.UPLOAD_DIR.mkdir()
        (settings.UPLOAD_DIR / 'listening.wav').write_bytes(wav_bytes())
        for section, count in [('reading', 5), ('listening', 5), ('writing', 2), ('speaking', 3)]:
            for order in range(1, count + 1):
                self.db.add(TestQuestion(section=section, set_number=1, order_num=order, question_text='q',
                    question_type='fill_blank', correct_answer='answer', audio_url='/uploads/listening.wav' if section == 'listening' else None))
        self.db.commit()
        info = content.catalog(self.db)[0]
        self.assertFalse(info['is_complete'])
        self.assertNotIn('full', info['available_modes'])
        self.assertIn('listening', info['available_modes'])
        q = self.db.query(TestQuestion).filter_by(section='listening').first()
        self.assertEqual(content.student_audio_url(q), f'/api/v1/content/legacy-audio/{q.id}')
        self.assertFalse(content.is_valid_audio('/uploads/../private.wav'))
        self.assertFalse(content.is_valid_audio('https://external.example/audio.wav'))

    def test_legacy_migration_preserves_rows_and_is_idempotent(self):
        legacy = create_engine(f'sqlite:///{(self.root / "legacy.db").as_posix()}')
        with legacy.begin() as conn:
            conn.execute(text('CREATE TABLE users (id INTEGER PRIMARY KEY, email VARCHAR NOT NULL UNIQUE, phone VARCHAR, password_hash VARCHAR NOT NULL, full_name VARCHAR, role VARCHAR, created_at DATETIME)'))
            conn.execute(text("INSERT INTO users (id,email,phone,password_hash) VALUES (42,'legacy@example.com','+998 (90) 111-22-33','preserve-me')"))
            conn.execute(text('CREATE TABLE tests (id INTEGER PRIMARY KEY, user_id INTEGER, status VARCHAR, overall_band_score FLOAT, started_at DATETIME, completed_at DATETIME, tab_switches INTEGER, paste_attempts INTEGER, is_flagged_cheating BOOLEAN)'))
            conn.execute(text("INSERT INTO tests (id,user_id,status) VALUES (84,42,'in_progress')"))
        initialize_database(legacy)
        initialize_database(legacy)
        with legacy.connect() as conn:
            self.assertEqual(conn.execute(text('SELECT password_hash FROM users WHERE id=42')).scalar(), 'preserve-me')
            self.assertEqual(conn.execute(text('SELECT user_id FROM tests WHERE id=84')).scalar(), 42)
            self.assertEqual(conn.execute(text('SELECT phone FROM users WHERE id=42')).scalar(), '+998901112233')
        self.assertTrue(next(c for c in inspect(legacy).get_columns('users') if c['name'] == 'email')['nullable'])
        legacy.dispose()

    def test_backup_is_readable_with_recording_and_hashes(self):
        source = self.root / 'backup-source.db'
        with sqlite3.connect(source) as db:
            db.execute('CREATE TABLE sample (value TEXT)')
            db.execute("INSERT INTO sample VALUES ('preserved')")
        db.close()
        settings.UPLOAD_DIR.mkdir()
        (settings.UPLOAD_DIR / 'recording.wav').write_bytes(wav_bytes())
        with patch.object(settings, 'DATABASE_URL', f'sqlite:///{source.as_posix()}'):
            archive_path = create_backup('test')
        with ZipFile(archive_path) as archive:
            manifest = json.loads(archive.read('manifest.json'))
            for name, digest in manifest['files'].items():
                self.assertEqual(hashlib.sha256(archive.read(name)).hexdigest(), digest)
            snapshot = self.root / 'restored.db'
            snapshot.write_bytes(archive.read('database.sqlite3'))
        with sqlite3.connect(snapshot) as db:
            self.assertEqual(db.execute('SELECT value FROM sample').fetchone()[0], 'preserved')
        db.close()


if __name__ == '__main__':
    unittest.main()
