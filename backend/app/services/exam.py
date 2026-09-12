"""Shared exam state, validation and student-safe result projection."""
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.test import Test
from app.models.question import TestQuestion
from app.models.reading import ReadingAnswer
from app.models.listening import ListeningAnswer
from app.models.writing import WritingAnswer
from app.models.speaking import SpeakingAnswer
from app.models.feedback import Feedback
from app.services.scoring import calculate_reading_score, calculate_listening_score, calculate_overall_band

SECTIONS = ("reading", "listening", "writing", "speaking")
DURATIONS = {"reading": 3600, "listening": 1800, "writing": 3600, "speaking": 900}
SUBMISSION_GRACE_SECONDS = 60


def utcnow():
    return datetime.now(timezone.utc)


def timestamp(value):
    return value.isoformat().replace("+00:00", "Z")


def parse_timestamp(value):
    result = datetime.fromisoformat(value.replace("Z", "+00:00"))
    return result.replace(tzinfo=timezone.utc) if result.tzinfo is None else result


def required_sections(test):
    return SECTIONS if (test.test_mode or "full") == "full" else (test.test_mode,)


def owned_test(db: Session, test_id: int, user, *, lock=False, allow_admin=False):
    query = db.query(Test).filter(Test.id == test_id)
    if not (allow_admin and user.role == "admin"):
        query = query.filter(Test.user_id == user.id)
    test = (query.with_for_update() if lock else query).first()
    if test is None:
        raise HTTPException(404, "Test topilmadi")
    return test


def ensure_section(test, section):
    if section not in SECTIONS or section not in required_sections(test):
        raise HTTPException(400, "Ushbu bo'lim tanlangan test rejimiga kirmaydi")


def ensure_active(test):
    if test.status != "in_progress" or test.is_flagged_cheating:
        raise HTTPException(409, "Test yopilgan yoki tekshiruvga yuborilgan")


def section_questions(db, test, section, requested_set=None):
    ensure_section(test, section)
    if requested_set is not None and requested_set != (test.set_number or 1):
        raise HTTPException(400, "Test boshlanganidan keyin to'plamni almashtirib bo'lmaydi")
    questions = db.query(TestQuestion).filter(
        TestQuestion.section == section, TestQuestion.set_number == (test.set_number or 1)
    ).order_by(TestQuestion.order_num).all()
    if not questions:
        raise HTTPException(409, "Ushbu to'plam uchun savollar hali tayyor emas")
    return questions


def set_section_state(test, section, values):
    states = dict(test.section_state or {})
    states[section] = {**states.get(section, {}), **values}
    test.section_state = states
    return states[section]


def section_is_submitted(db, test, section):
    state = (test.section_state or {}).get(section, {})
    if state.get("submitted_at"):
        return True
    # Old test rows predate persistent section state. Never infer from a partial
    # newly started section; legacy objective sections historically stored answers only.
    if state:
        return False
    if section in {"reading", "listening"}:
        model = ReadingAnswer if section == "reading" else ListeningAnswer
        return db.query(model).filter(model.test_id == test.id).first() is not None
    model, field, expected = (WritingAnswer, WritingAnswer.task_number, {1, 2}) if section == "writing" else (SpeakingAnswer, SpeakingAnswer.part_number, {1, 2, 3})
    return {value for (value,) in db.query(field).filter(model.test_id == test.id).all()} == expected


def start_section(db, test, section):
    ensure_section(test, section)
    ensure_active(test)
    if section_is_submitted(db, test, section):
        raise HTTPException(409, "Bo'lim allaqachon topshirilgan")
    section_questions(db, test, section)
    state = (test.section_state or {}).get(section, {})
    if not state.get("started_at"):
        now = utcnow()
        state = set_section_state(test, section, {
            "started_at": timestamp(now),
            "deadline_at": timestamp(now + timedelta(seconds=DURATIONS[section])),
            "submitted_at": None, "audio_started_at": None,
        })
    return state


def ensure_submission(db, test, section):
    ensure_section(test, section)
    ensure_active(test)
    if section_is_submitted(db, test, section):
        raise HTTPException(409, "Bo'lim allaqachon topshirilgan")
    state = (test.section_state or {}).get(section, {})
    if not state.get("deadline_at"):
        raise HTTPException(409, "Avval bo'limni boshlang")
    if utcnow() > parse_timestamp(state["deadline_at"]) + timedelta(seconds=SUBMISSION_GRACE_SECONDS):
        raise HTTPException(409, "Bo'lim vaqti tugagan")


def mark_submitted(test, section):
    set_section_state(test, section, {"submitted_at": timestamp(utcnow())})


def subjective_status(answers, expected, number_field):
    if not answers:
        return "none"
    if {getattr(answer, number_field) for answer in answers} != expected:
        return "incomplete"
    if all(answer.status == "approved" and answer.admin_score is not None for answer in answers):
        return "approved"
    return "pending"


def feedback_snapshot(db, test):
    required = required_sections(test)
    writing = db.query(WritingAnswer).filter(WritingAnswer.test_id == test.id).order_by(WritingAnswer.task_number).all()
    speaking = db.query(SpeakingAnswer).filter(SpeakingAnswer.test_id == test.id).order_by(SpeakingAnswer.part_number).all()
    w_status = subjective_status(writing, {1, 2}, "task_number") if "writing" in required else "not_required"
    s_status = subjective_status(speaking, {1, 2, 3}, "part_number") if "speaking" in required else "not_required"
    scores = dict.fromkeys(SECTIONS)
    for section, model, scorer in (("reading", ReadingAnswer, calculate_reading_score), ("listening", ListeningAnswer, calculate_listening_score)):
        if section in required and section_is_submitted(db, test, section):
            answers = db.query(model).filter(model.test_id == test.id).all()
            scores[section] = scorer(sum(bool(answer.is_correct) for answer in answers), len(answers))
    if w_status == "approved":
        w = {answer.task_number: answer.admin_score for answer in writing}
        scores["writing"] = calculate_overall_band([w[1], w[2], w[2]])
    if s_status == "approved":
        scores["speaking"] = calculate_overall_band([answer.admin_score for answer in speaking])
    complete = all(section_is_submitted(db, test, section) and scores[section] is not None for section in required)
    approved = complete and test.status != "terminated" and not test.is_flagged_cheating
    overall = calculate_overall_band([scores[section] for section in required]) if approved else None
    writing_feedback = "\n".join(f"Task {a.task_number}: {a.admin_feedback}" for a in writing if a.status == "approved" and a.admin_feedback) or None
    speaking_feedback = "\n".join(f"Part {a.part_number}: {a.admin_feedback}" for a in speaking if a.status == "approved" and a.admin_feedback) or None
    notes = "\n\n".join(filter(None, [writing_feedback, speaking_feedback])) or None
    strengths, weaknesses, recommendations = [], [], []
    for section in required:
        score = scores[section]
        if score is None:
            recommendations.append(f"{section.title()}: natija topshiriqlar bajarilib, zarur bo'lsa ustoz tasdiqlagandan keyin chiqadi.")
        elif score >= 6.5:
            strengths.append(f"{section.title()}: tasdiqlangan natija {score:.1f}.")
        else:
            weaknesses.append(f"{section.title()}: tasdiqlangan natija {score:.1f}; xatolar va ustoz izohlarini ko'rib chiqing.")
    return {
        "test_id": test.id, "test_mode": test.test_mode or "full", "status": test.status, "test_status": test.status,
        "section_state": test.section_state or {}, **{f"{s}_score": scores[s] for s in SECTIONS},
        "overall_band": overall, "is_approved": approved,
        "writing_status": w_status, "speaking_status": s_status,
        "writing_feedback": writing_feedback, "speaking_feedback": speaking_feedback, "admin_notes": notes,
        "strengths": "\n".join(strengths) or None, "weaknesses": "\n".join(weaknesses) or None,
        "recommendations": "\n".join(recommendations) or notes,
    }


def update_completion(db, test):
    """Only submission/review commands call this. GET routes never write state."""
    db.flush()
    snapshot = feedback_snapshot(db, test)
    if test.status == "terminated" or test.is_flagged_cheating:
        return
    if snapshot["is_approved"]:
        test.status = "completed"
        test.overall_band_score = snapshot["overall_band"]
        test.completed_at = test.completed_at or utcnow().replace(tzinfo=None)
    elif all(section_is_submitted(db, test, s) for s in required_sections(test)):
        test.status = "pending_review"
        test.overall_band_score = None
    else:
        test.status = "in_progress"
        test.overall_band_score = None
    feedback = db.query(Feedback).filter(Feedback.test_id == test.id).first()
    if feedback is None:
        feedback = Feedback(test_id=test.id)
        db.add(feedback)
    for key in [*(f"{s}_score" for s in SECTIONS), "overall_band", "strengths", "weaknesses", "recommendations"]:
        setattr(feedback, key, snapshot[key])


def student_answer(answer, section):
    approved = answer.status == "approved" and answer.admin_score is not None
    result = {
        "id": answer.id, "test_id": answer.test_id, "status": answer.status,
        "admin_score": answer.admin_score if approved else None,
        "admin_feedback": answer.admin_feedback if approved else None,
        "ai_score": None, "ai_analysis": None,
        "reviewed_at": answer.reviewed_at if approved else None,
    }
    if section == "writing":
        result.update(task_number=answer.task_number, user_text=answer.user_text)
    else:
        result.update(part_number=answer.part_number, transcript=answer.transcript,
                      audio_url=f"/api/v1/tests/{answer.test_id}/speaking/audio/{answer.id}")
    return result


def stored_audio_name(audio_url):
    # Supports pre-migration /uploads/... and localhost URLs without allowing traversal.
    return Path(urlparse(audio_url or "").path).name
