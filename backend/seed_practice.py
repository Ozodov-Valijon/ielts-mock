"""Add original practice set 3 without deleting or overwriting existing content.

Usage from backend/: python seed_practice.py
The normal DATABASE_URL configuration is honoured. No demonstration users are
created. Tests can call seed_practice_set(session) with an isolated database.
"""

from collections import Counter

from content.practice_set_3 import MANIFEST, QUESTIONS, SET_NUMBER


def seed_practice_set(db):
    from app.models.question import TestQuestion

    existing = {
        (row.section, row.order_num)
        for row in db.query(TestQuestion).filter(TestQuestion.set_number == SET_NUMBER)
    }
    inserted = Counter()
    for values in QUESTIONS:
        key = (values["section"], values["order_num"])
        if key not in existing:
            db.add(TestQuestion(**values))
            existing.add(key)
            inserted[values["section"]] += 1
    db.flush()
    return dict(inserted)


def seed_practice():
    from app.database import Base, SessionLocal, engine
    from app.models.question import TestQuestion  # noqa: F401

    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        inserted = seed_practice_set(db)
        db.commit()
    print(f"Set {SET_NUMBER}: {MANIFEST['title']}")
    print(f"Added: {inserted or 'nothing; all question slots already exist'}")
    print("Existing sets and existing answers were preserved.")


if __name__ == "__main__":
    seed_practice()
