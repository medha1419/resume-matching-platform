import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

import pandas as pd

from database import SessionLocal
from models import Job

CSV_PATH = "data/processed/jobs_clean.csv"


def main():
    df = pd.read_csv(CSV_PATH)
    db = SessionLocal()

    existing_job_ids = {row[0] for row in db.query(Job.job_id).all()}

    inserted = 0
    for i, row in df.iterrows():
        if row.get("flag") != "ok":
            continue
        description = row.get("clean_description")
        if pd.isna(description) or not str(description).strip():
            continue

        job_id = row["job_id"]
        if job_id in existing_job_ids:
            continue

        salary_min = row.get("salary_min")
        salary_max = row.get("salary_max")

        job = Job(
            job_id=job_id,
            job_title=row["job_title"],
            clean_description=description,
            location=None if pd.isna(row.get("location")) else row.get("location"),
            salary_min=None if pd.isna(salary_min) else int(salary_min),
            salary_max=None if pd.isna(salary_max) else int(salary_max),
            currency=None if pd.isna(row.get("currency")) else row.get("currency"),
        )
        db.add(job)
        existing_job_ids.add(job_id)
        inserted += 1

        if inserted % 100 == 0:
            db.commit()
            print(f"Inserted {inserted} jobs so far...")

    db.commit()
    db.close()
    print(f"Seeded {inserted} jobs into database")


if __name__ == "__main__":
    main()
