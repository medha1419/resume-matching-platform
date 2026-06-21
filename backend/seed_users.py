import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

import pandas as pd

from auth import hash_password
from database import SessionLocal
from embeddings import embed_text
from models import User

XLSX_PATH = "data/raw/USER_JOB_DATA.xlsx"
SHEET_NAME = "User Data"
DEFAULT_PASSWORD = "RoleCall123"


def main():
    df = pd.read_excel(XLSX_PATH, sheet_name=SHEET_NAME)
    db = SessionLocal()

    existing_ids = {row[0] for row in db.query(User.user_id_original).all()}
    password_hash = hash_password(DEFAULT_PASSWORD)

    inserted = 0
    for _, row in df.iterrows():
        user_id = row.get("User_ID")
        if pd.isna(user_id):
            continue
        if user_id in existing_ids:
            continue

        job_title = None if pd.isna(row.get("User_JT")) else row.get("User_JT")
        skills_text = None if pd.isna(row.get("User_Skills")) else row.get("User_Skills")
        skills_embedding = embed_text(skills_text) if skills_text else None

        user = User(
            user_id_original=user_id,
            password_hash=password_hash,
            job_title=job_title,
            skills_text=skills_text,
            skills_embedding=skills_embedding,
        )
        db.add(user)
        existing_ids.add(user_id)
        inserted += 1

        if inserted % 50 == 0:
            db.commit()
            print(f"Inserted {inserted} users so far...")

    db.commit()
    db.close()
    print(f"Seeded {inserted} users")


if __name__ == "__main__":
    main()
