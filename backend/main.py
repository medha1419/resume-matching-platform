import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import faiss
import numpy as np
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import create_jwt_token, get_current_user, hash_password, verify_password
from database import engine, get_db
from embeddings import embed_text
from models import Job, LikedJob, User

load_dotenv()

INDEX_PATH = "data/faiss_index.bin"

app = FastAPI(title="RoleCall API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

faiss_index: faiss.Index | None = None


@app.on_event("startup")
def load_faiss_index():
    global faiss_index
    faiss_index = faiss.read_index(INDEX_PATH)


# ── Schemas ──────────────────────────────────────────────────────────


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str | None = None
    job_title: str | None = None
    skills_text: str | None = None


class SkillsUpdateRequest(BaseModel):
    skills_text: str
    job_title: str | None = None


class SearchRequest(BaseModel):
    location: str | None = None
    salary_min: int | None = None
    salary_max: int | None = None


class PublicSearchRequest(BaseModel):
    skills_text: str
    location: str | None = None
    salary_min: int | None = None
    salary_max: int | None = None


# ── Auth endpoints ───────────────────────────────────────────────────


@app.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter(
            (User.user_id_original == payload.username)
            | (User.email == payload.username)
        )
        .first()
    )
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_jwt_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": str(user.id),
        "full_name": user.full_name,
        "job_title": user.job_title,
    }


@app.post("/auth/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    skills_embedding = (
        embed_text(payload.skills_text) if payload.skills_text else None
    )

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        job_title=payload.job_title,
        skills_text=payload.skills_text,
        skills_embedding=skills_embedding,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_jwt_token(user.id)
    return {"access_token": token, "token_type": "bearer", "user_id": str(user.id)}


# ── User endpoints ───────────────────────────────────────────────────


@app.get("/users/me")
def read_current_user(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "user_id_original": current_user.user_id_original,
        "full_name": current_user.full_name,
        "job_title": current_user.job_title,
        "skills_text": current_user.skills_text,
        "created_at": current_user.created_at,
    }


@app.put("/users/me/skills")
def update_skills(
    payload: SkillsUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.skills_text = payload.skills_text
    if payload.job_title is not None:
        current_user.job_title = payload.job_title
    current_user.skills_embedding = embed_text(payload.skills_text)

    db.add(current_user)
    db.commit()

    return {
        "message": "Skills updated successfully",
        "skills_text": current_user.skills_text,
    }


# ── Search endpoint ──────────────────────────────────────────────────


@app.post("/search")
def search_jobs(
    payload: SearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.skills_embedding:
        raise HTTPException(status_code=400, detail="Please add your skills first")

    query_vector = np.array([current_user.skills_embedding], dtype="float32")
    faiss.normalize_L2(query_vector)

    top_k = 50
    scores, indices = faiss_index.search(query_vector, top_k)
    scores = scores[0]
    indices = indices[0]

    score_by_position = {
        int(idx): float(score) for idx, score in zip(indices, scores) if idx != -1
    }

    jobs = (
        db.query(Job)
        .filter(Job.faiss_index.in_(score_by_position.keys()))
        .all()
    )

    liked_job_ids = {
        liked.job_id
        for liked in db.query(LikedJob).filter(LikedJob.user_id == current_user.id)
    }

    results = []
    for job in jobs:
        if payload.location:
            if not job.location or payload.location.lower() not in job.location.lower():
                continue
        if payload.salary_min is not None:
            if job.salary_max is not None and job.salary_max < payload.salary_min:
                continue
        if payload.salary_max is not None:
            if job.salary_min is not None and job.salary_min > payload.salary_max:
                continue

        results.append(
            {
                "id": str(job.id),
                "job_id": job.job_id,
                "job_title": job.job_title,
                "location": job.location,
                "salary_min": job.salary_min,
                "salary_max": job.salary_max,
                "currency": job.currency,
                "match_score": score_by_position[job.faiss_index],
                "is_liked": job.id in liked_job_ids,
            }
        )

    results.sort(key=lambda r: r["match_score"], reverse=True)
    return results[:15]


@app.post("/search/public")
def search_jobs_public(payload: PublicSearchRequest, db: Session = Depends(get_db)):
    query_vector = np.array([embed_text(payload.skills_text)], dtype="float32")
    faiss.normalize_L2(query_vector)

    top_k = 50
    scores, indices = faiss_index.search(query_vector, top_k)
    scores = scores[0]
    indices = indices[0]

    score_by_position = {
        int(idx): float(score) for idx, score in zip(indices, scores) if idx != -1
    }

    jobs = (
        db.query(Job)
        .filter(Job.faiss_index.in_(score_by_position.keys()))
        .all()
    )

    results = []
    for job in jobs:
        if payload.location:
            if not job.location or payload.location.lower() not in job.location.lower():
                continue
        if payload.salary_min is not None:
            if job.salary_max is not None and job.salary_max < payload.salary_min:
                continue
        if payload.salary_max is not None:
            if job.salary_min is not None and job.salary_min > payload.salary_max:
                continue

        results.append(
            {
                "id": str(job.id),
                "job_id": job.job_id,
                "job_title": job.job_title,
                "location": job.location,
                "salary_min": job.salary_min,
                "salary_max": job.salary_max,
                "currency": job.currency,
                "match_score": min(round((score_by_position[job.faiss_index] / 0.45) * 100), 99),
            }
        )

    results.sort(key=lambda r: r["match_score"], reverse=True)
    return results[:15]


# ── Liked jobs endpoints ─────────────────────────────────────────────


@app.post("/jobs/{job_id}/like")
def like_job(
    job_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = (
        db.query(LikedJob)
        .filter(LikedJob.user_id == current_user.id, LikedJob.job_id == job_id)
        .first()
    )
    if not existing:
        db.add(LikedJob(user_id=current_user.id, job_id=job_id))
        db.commit()

    return {"message": "Job liked", "job_id": str(job_id)}


@app.delete("/jobs/{job_id}/like")
def unlike_job(
    job_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(LikedJob).filter(
        LikedJob.user_id == current_user.id, LikedJob.job_id == job_id
    ).delete()
    db.commit()

    return {"message": "Job unliked", "job_id": str(job_id)}


@app.get("/users/me/liked-jobs")
def get_liked_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    liked = (
        db.query(Job, LikedJob.liked_at)
        .join(LikedJob, LikedJob.job_id == Job.id)
        .filter(LikedJob.user_id == current_user.id)
        .all()
    )

    return [
        {
            "id": str(job.id),
            "job_title": job.job_title,
            "location": job.location,
            "salary_min": job.salary_min,
            "salary_max": job.salary_max,
            "currency": job.currency,
            "liked_at": liked_at,
        }
        for job, liked_at in liked
    ]


# ── Health check ─────────────────────────────────────────────────────


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    jobs_indexed = db.query(Job).filter(Job.faiss_index.isnot(None)).count()
    return {"status": "ok", "jobs_indexed": jobs_indexed}
