"""Checks the complete authored set and its additive seeding, without live DB writes."""

import collections
import pathlib
import sys
import unittest
import wave

ROOT = pathlib.Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"
sys.path.insert(0, str(BACKEND))

from content.practice_set_3 import AUDIO_URL, LISTENING_PARTS, MANIFEST, QUESTIONS, READING_PASSAGES


class PracticeContentTests(unittest.TestCase):
    def test_counts_and_contiguous_order(self):
        self.assertEqual(collections.Counter(q["section"] for q in QUESTIONS), MANIFEST["counts"])
        for section, expected in MANIFEST["counts"].items():
            subset = [q for q in QUESTIONS if q["section"] == section]
            self.assertEqual([q["order_num"] for q in subset], list(range(1, expected + 1)))
            self.assertTrue(all(q["set_number"] == 3 for q in subset))

    def test_substantial_reading_passages(self):
        self.assertEqual(len(READING_PASSAGES), 3)
        for passage in READING_PASSAGES:
            self.assertGreaterEqual(len(passage.split()), 550)
        self.assertEqual(
            [sum(q["passage_text"] == p for q in QUESTIONS if q["section"] == "reading") for p in READING_PASSAGES],
            [13, 13, 14],
        )

    def test_answer_integrity(self):
        keys = [(q["section"], q["order_num"]) for q in QUESTIONS]
        self.assertEqual(len(set(keys)), len(keys))
        for question in QUESTIONS:
            self.assertTrue(question["question_text"].strip())
            if question["section"] in {"reading", "listening"}:
                self.assertTrue(question["correct_answer"].strip())
            if question["options"]:
                self.assertEqual(len(question["options"]), len(set(question["options"])))
                self.assertEqual(question["options"].count(question["correct_answer"]), 1)
            elif question["section"] == "reading":
                self.assertIn(question["correct_answer"].lower(), question["passage_text"].lower())
                self.assertLessEqual(len(question["correct_answer"].split()), 2)

    def test_complete_listening_scripts_and_answers(self):
        self.assertEqual([p["part"] for p in LISTENING_PARTS], [1, 2, 3, 4])
        spoken_numbers = {3: "six thirty", 4: "six weeks", 5: "ninety-six pounds", 9: "four days"}
        for part in LISTENING_PARTS:
            transcript = " ".join(turn[1] for turn in part["turns"]).lower()
            self.assertGreaterEqual(len(transcript.split()), 500)
            first = (part["part"] - 1) * 10 + 1
            questions = [q for q in QUESTIONS if q["section"] == "listening" and first <= q["order_num"] < first + 10]
            self.assertEqual(len(questions), 10)
            for question in questions:
                self.assertEqual(question["audio_url"], AUDIO_URL)
                self.assertIsNone(question["passage_text"], "Transcripts must not leak through question payloads")
                if question["question_type"] == "fill_blank":
                    phrase = spoken_numbers.get(question["order_num"], question["correct_answer"].lower())
                    self.assertIn(phrase, transcript)

    def test_audio_is_complete_pcm_recording(self):
        audio_path = BACKEND / "content_audio" / "practice-set-3.wav"
        self.assertTrue(audio_path.is_file(), "Generate the supplied local Windows speech recording first")
        with wave.open(str(audio_path), "rb") as audio:
            self.assertEqual(audio.getcomptype(), "NONE")
            self.assertEqual(audio.getnchannels(), 1)
            self.assertEqual(audio.getsampwidth(), 2)
            duration = audio.getnframes() / audio.getframerate()
            self.assertGreater(duration, 1000, "Full recording should exceed sixteen minutes")
            self.assertLess(duration, 1800, "Recording must fit the 30 minute listening timer")
            audible_chunks = 0
            while chunk := audio.readframes(audio.getframerate() * 10):
                if any(chunk):
                    audible_chunks += 1
            self.assertGreater(audible_chunks, 70, "Audio should contain speech throughout all four parts")

    def test_original_manifest(self):
        self.assertFalse(MANIFEST["official"])
        self.assertEqual(MANIFEST["license"], "CC0-1.0")
        self.assertIn("synthetic", MANIFEST["audio"])

    def test_additive_idempotent_seed_on_isolated_database(self):
        # The app's configured engine is imported but never connected or used.
        # All writes below go only to the explicit in-memory SQLite engine.
        from sqlalchemy import create_engine
        from sqlalchemy.orm import Session
        from app.models.question import TestQuestion
        from seed_practice import seed_practice_set

        engine = create_engine("sqlite:///:memory:")
        TestQuestion.__table__.create(bind=engine)
        with Session(engine) as db:
            original = TestQuestion(section="reading", set_number=1, order_num=1, question_type="fill_blank", question_text="Keep existing", correct_answer="existing")
            customised = TestQuestion(section="reading", set_number=3, order_num=1, question_type="fill_blank", question_text="Keep custom slot", correct_answer="custom")
            db.add_all([original, customised])
            db.commit()
            added = seed_practice_set(db)
            db.commit()
            self.assertEqual(sum(added.values()), 84)
            self.assertEqual(seed_practice_set(db), {})
            db.commit()
            self.assertEqual(db.query(TestQuestion).count(), 86)
            self.assertEqual(db.get(TestQuestion, original.id).question_text, "Keep existing")
            self.assertEqual(db.get(TestQuestion, customised.id).question_text, "Keep custom slot")
        engine.dispose()


if __name__ == "__main__":
    unittest.main()
