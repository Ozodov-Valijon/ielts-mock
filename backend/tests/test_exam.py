"""Exam regressions run against a fresh in-memory database, never the user's DB.

Run: python -m unittest discover -s tests -v
"""
import json
import tempfile
import unittest
from datetime import timedelta
from pathlib import Path
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.models import User, Test, TestQuestion, WritingAnswer, SpeakingAnswer, ReadingAnswer, Feedback
from app.routers import tests, reading, listening, writing, speaking, feedback, admin
from app.services.auth import get_current_user
from app.services.exam import timestamp, utcnow
from app.config import settings


class ExamRegressionTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        Base.metadata.create_all(self.engine)
        self.sessions = sessionmaker(bind=self.engine, autoflush=False)
        self.db = self.sessions()
        self.user = User(email="student@test.local", phone="+998900000001", password_hash="unused", role="student")
        self.other = User(email="other@test.local", phone="+998900000002", password_hash="unused", role="student")
        self.admin = User(email="admin@test.local", phone="+998900000003", password_hash="unused", role="admin")
        self.db.add_all([self.user, self.other, self.admin])
        for set_number in (1, 2):
            for section, count in (("reading", 2), ("listening", 2), ("writing", 2), ("speaking", 3)):
                for number in range(1, count + 1):
                    self.db.add(TestQuestion(section=section, set_number=set_number, order_num=number,
                        question_type="fill_blank" if section in {"reading", "listening"} else f"{section}_{number}",
                        question_text=f"{section} actual prompt {number}", correct_answer="answer" if section in {"reading", "listening"} else None))
        self.db.commit()
        self.actor = self.user
        app = FastAPI()
        for route in (tests, reading, listening, writing, speaking, feedback, admin):
            app.include_router(route.router, prefix="/api/v1")

        def database():
            try:
                yield self.db
            finally:
                self.db.rollback()

        app.dependency_overrides[get_db] = database
        app.dependency_overrides[get_current_user] = lambda: self.actor
        self.client = TestClient(app)
        self.catalog_patch = patch("app.routers.tests.catalog", return_value=[
            {"set_number": n, "available_modes": ["full", "reading", "listening", "writing", "speaking"]} for n in (1, 2)
        ])
        self.catalog_patch.start()
        self.ai = AsyncMock(return_value={"ai_score": 8.5, "ai_analysis": json.dumps({"private_draft": True})})
        self.writing_patch = patch("app.routers.writing.analyze_writing", self.ai)
        self.writing_patch.start()
        self.speaking_patch = patch("app.routers.speaking.analyze_speaking", self.ai)
        self.speaking_patch.start()
        self.transcript_patch = patch("app.routers.speaking.transcribe_audio", return_value="Example transcript")
        self.transcript_patch.start()
        self.uploads = tempfile.TemporaryDirectory(prefix="ielts-exam-test-")
        self.storage_patch = patch.object(settings, "UPLOAD_DIR", Path(self.uploads.name))
        self.storage_patch.start()

    def tearDown(self):
        for mock in (self.catalog_patch, self.writing_patch, self.speaking_patch, self.transcript_patch, self.storage_patch):
            mock.stop()
        self.client.close()
        self.db.close()
        self.engine.dispose()
        self.uploads.cleanup()

    def create(self, mode="full"):
        response = self.client.post("/api/v1/tests", json={"set_number": 1, "test_mode": mode})
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()["id"]

    def start(self, test_id, section):
        response = self.client.post(f"/api/v1/tests/{test_id}/sections/{section}/start")
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def submit_objective(self, test_id, section):
        self.start(test_id, section)
        questions = self.client.get(f"/api/v1/tests/{test_id}/{section}/questions").json()
        response = self.client.post(f"/api/v1/tests/{test_id}/{section}/submit", json={"answers": [
            {"question_id": q["id"], "user_answer": "answer"} for q in questions
        ]})
        self.assertEqual(response.status_code, 200, response.text)
        return response

    def test_timer_is_persisted_and_expired_submission_rejected(self):
        test_id = self.create("reading")
        first = self.start(test_id, "reading")
        self.assertEqual(first, self.start(test_id, "reading"))
        self.assertTrue(first["deadline_at"].endswith("Z"))
        test = self.db.get(Test, test_id)
        test.section_state = {"reading": {**first, "deadline_at": timestamp(utcnow() - timedelta(seconds=61))}}
        self.db.commit()
        response = self.client.post(f"/api/v1/tests/{test_id}/reading/submit", json={"answers": []})
        self.assertEqual(response.status_code, 409)
        self.assertEqual(self.db.query(ReadingAnswer).count(), 0)

    def test_wrong_mode_set_duplicate_unknown_ids_and_resubmit(self):
        test_id = self.create("reading")
        self.assertEqual(self.client.post(f"/api/v1/tests/{test_id}/sections/writing/start").status_code, 400)
        self.assertEqual(self.client.get(f"/api/v1/tests/{test_id}/reading/questions?set_number=2").status_code, 400)
        self.start(test_id, "reading")
        q = self.db.query(TestQuestion).filter_by(section="reading", set_number=1).first()
        wrong = self.db.query(TestQuestion).filter_by(section="reading", set_number=2).first()
        url = f"/api/v1/tests/{test_id}/reading/submit"
        self.assertEqual(self.client.post(url, json={"answers": [{"question_id": q.id, "user_answer": "answer"}] * 2}).status_code, 422)
        self.assertEqual(self.client.post(url, json={"answers": [{"question_id": wrong.id, "user_answer": "answer"}]}).status_code, 422)
        self.assertEqual(self.db.query(ReadingAnswer).count(), 0)
        self.assertEqual(self.client.post(url, json={"answers": []}).status_code, 200)
        self.assertEqual(self.db.query(ReadingAnswer).count(), 2)
        self.assertEqual(self.client.post(url, json={"answers": []}).status_code, 409)
        result = self.client.get(f"/api/v1/tests/{test_id}/feedback").json()
        self.assertEqual(result["overall_band"], 0)
        self.assertEqual(result["status"], "completed")
        self.assertIsNone(result["writing_score"])

    def test_feedback_is_read_only_before_submission(self):
        test_id = self.create()
        for _ in range(2):
            result = self.client.get(f"/api/v1/tests/{test_id}/feedback")
            self.assertEqual(result.status_code, 200, result.text)
            self.assertFalse(result.json()["is_approved"])
            self.assertIsNone(result.json()["overall_band"])
        self.assertEqual(self.db.query(Feedback).count(), 0)
        test = self.db.get(Test, test_id)
        self.assertEqual(test.status, "in_progress")
        self.assertIsNone(test.completed_at)

    def test_writing_hides_draft_and_requires_both_reviewed_tasks(self):
        test_id = self.create("writing")
        self.start(test_id, "writing")
        url = f"/api/v1/tests/{test_id}/writing/submit"
        self.assertEqual(self.client.post(url, json={"task_number": 0, "user_text": "x"}).status_code, 422)
        response = self.client.post(url, json={"task_number": 1, "user_text": ""})
        self.assertEqual(response.status_code, 200, response.text)
        self.assertNotIn("ai_analysis", response.json())
        self.assertIsNone(response.json()["answer"]["ai_score"])
        self.ai.assert_awaited_with("", 1, "writing actual prompt 1")
        self.assertEqual(self.client.post(url, json={"task_number": 1, "user_text": "x"}).status_code, 409)
        first = self.db.query(WritingAnswer).filter_by(test_id=test_id, task_number=1).first()
        first_id = first.id
        self.actor = self.admin
        for score in (-0.5, 9.5, 6.2):
            self.assertEqual(self.client.put(f"/api/v1/admin/writing/{first_id}/review", json={"admin_score": score, "admin_feedback": "review"}).status_code, 422)
        self.assertEqual(self.client.put(f"/api/v1/admin/writing/{first_id}/review", json={"admin_score": 6, "admin_feedback": "Improve examples"}).status_code, 200)
        self.assertEqual(self.db.get(Test, test_id).status, "in_progress")
        self.actor = self.user
        self.assertEqual(self.client.post(url, json={"task_number": 2, "user_text": "essay"}).status_code, 200)
        result = self.client.get(f"/api/v1/tests/{test_id}/feedback").json()
        self.assertIsNone(result["writing_score"])
        self.assertEqual(result["status"], "pending_review")
        self.assertEqual(result["writing_feedback"], "Task 1: Improve examples")
        answers = self.client.get(f"/api/v1/tests/{test_id}/writing/results").json()
        self.assertTrue(all(a["ai_score"] is None and a["ai_analysis"] is None for a in answers))
        second_id = next(a["id"] for a in answers if a["task_number"] == 2)
        self.actor = self.admin
        self.assertEqual(self.client.put(f"/api/v1/admin/writing/{second_id}/review", json={"admin_score": 7.5, "admin_feedback": "Good"}).status_code, 200)
        self.actor = self.user
        result = self.client.get(f"/api/v1/tests/{test_id}/feedback").json()
        self.assertTrue(result["is_approved"])
        self.assertEqual(result["overall_band"], 7.0)
        self.assertEqual(result["status"], "completed")

    def test_partial_full_test_never_completes(self):
        test_id = self.create()
        self.submit_objective(test_id, "reading")
        result = self.client.get(f"/api/v1/tests/{test_id}/feedback").json()
        self.assertIsNone(result["overall_band"])
        self.assertEqual(result["status"], "in_progress")

    def test_listening_audio_start_cannot_reset(self):
        test_id = self.create("listening")
        self.start(test_id, "listening")
        first = self.client.post(f"/api/v1/tests/{test_id}/listening/audio/start")
        self.assertEqual(first.status_code, 200)
        self.assertTrue(first.json()["audio_started_at"])
        self.assertEqual(self.client.post(f"/api/v1/tests/{test_id}/listening/audio/start").status_code, 409)
        self.assertEqual(self.start(test_id, "listening")["audio_started_at"], first.json()["audio_started_at"])

    def test_terminated_test_rejects_work(self):
        test_id = self.create("reading")
        self.start(test_id, "reading")
        for _ in range(3):
            response = self.client.post(f"/api/v1/tests/{test_id}/anticheat-event", json={"event_type": "tab_switch"})
            self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["auto_terminated"])
        self.assertEqual(self.client.post(f"/api/v1/tests/{test_id}/reading/submit", json={"answers": []}).status_code, 409)
        result = self.client.get(f"/api/v1/tests/{test_id}/feedback").json()
        self.assertEqual(result["status"], "terminated")
        self.assertFalse(result["is_approved"])

    def test_speaking_audio_private_validated_and_pending(self):
        test_id = self.create("speaking")
        self.start(test_id, "speaking")
        url = f"/api/v1/tests/{test_id}/speaking/upload"
        audio = b"RIFF" + b"\x00" * 4 + b"WAVE" + b"\x00" * 40
        self.assertEqual(self.client.post(url, data={"part_number": 4}, files={"file": ("voice.wav", audio, "audio/wav")}).status_code, 422)
        self.assertEqual(self.client.post(url, data={"part_number": 1}, files={"file": ("voice.wav", b"not audio content", "audio/wav")}).status_code, 415)
        response = self.client.post(url, data={"part_number": 1}, files={"file": ("voice.wav", audio, "audio/wav")})
        self.assertEqual(response.status_code, 200, response.text)
        audio_url = response.json()["audio_url"]
        self.assertEqual(self.client.get(audio_url).content, audio)
        self.assertEqual(self.client.get(audio_url).headers["cache-control"], "private, no-store")
        self.actor = self.other
        self.assertEqual(self.client.get(audio_url).status_code, 404)
        self.actor = self.admin
        self.assertEqual(self.client.get(audio_url).status_code, 200)
        self.actor = self.user
        self.assertEqual(self.client.post(url, data={"part_number": 1}, files={"file": ("voice.wav", audio, "audio/wav")}).status_code, 409)
        result = self.client.post(f"/api/v1/tests/{test_id}/speaking/finish")
        self.assertEqual(result.status_code, 200, result.text)
        self.assertEqual(self.db.query(SpeakingAnswer).count(), 3)
        self.assertEqual(self.client.post(f"/api/v1/tests/{test_id}/speaking/finish").status_code, 200)
        snapshot = self.client.get(f"/api/v1/tests/{test_id}/feedback").json()
        self.assertEqual(snapshot["status"], "pending_review")
        self.assertIsNone(snapshot["speaking_score"])

    def test_admin_question_validation_and_averages(self):
        self.assertEqual(self.client.get("/api/v1/admin/tests").status_code, 403)
        self.actor = self.admin
        question = {"section": "writing", "set_number": 3, "question_type": "writing_task_1", "question_text": "Describe the table", "order_num": 1, "correct_answer": None}
        self.assertEqual(self.client.post("/api/v1/admin/questions", json=question).status_code, 200)
        self.assertEqual(self.client.post("/api/v1/admin/questions", json=question).status_code, 409)
        self.assertEqual(self.client.post("/api/v1/admin/questions", json={**question, "section": "reading", "set_number": 4}).status_code, 422)
        stats = self.client.get("/api/v1/admin/stats").json()
        self.assertIn("average_band", stats)
        self.assertIsNone(stats["average_band"])
        self.assertEqual(self.client.get("/api/v1/admin/tests").status_code, 200)


if __name__ == "__main__":
    unittest.main()
