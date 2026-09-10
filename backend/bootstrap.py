"""Initialize schema/content and optionally create a first administrator."""
import argparse
import getpass
from sqlalchemy import func
from app.database import SessionLocal
from app.migrations import initialize_database
from app.models.user import User
from app.schemas.user import UserCreate
from app.services.auth import hash_password


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--admin-email", help="Create this admin only if it does not exist; password is prompted securely.")
    args = parser.parse_args()
    initialize_database()
    from seed_practice import seed_practice
    seed_practice()
    if args.admin_email:
        with SessionLocal() as db:
            existing = db.query(User).filter(func.lower(User.email) == args.admin_email.lower()).first()
            if existing:
                print("Account already exists; role and password were not changed.")
                return
            password = getpass.getpass("New admin password (8+ characters): ")
            confirmed = getpass.getpass("Repeat password: ")
            if password != confirmed:
                raise SystemExit("Passwords do not match.")
            validated = UserCreate(email=args.admin_email, full_name="Administrator", password=password)
            db.add(User(email=validated.email, full_name=validated.full_name, role="admin", password_hash=hash_password(password)))
            db.commit()
            print("Administrator created.")
    print("Database and original practice content are ready.")


if __name__ == "__main__":
    main()
