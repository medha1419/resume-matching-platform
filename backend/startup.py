import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from pathlib import Path

import faiss
import numpy as np

from database import SessionLocal
from embeddings import embed_batch
from models import Job

INDEX_PATH = "data/faiss_index.bin"
BATCH_SIZE = 32


def _build_faiss_index():
    db = SessionLocal()
    try:
        jobs = (
            db.query(Job)
            .filter(Job.clean_description.isnot(None))
            .order_by(Job.id)
            .all()
        )
        total = len(jobs)

        all_embeddings = []
        for start in range(0, total, BATCH_SIZE):
            batch = jobs[start : start + BATCH_SIZE]
            texts = [job.clean_description for job in batch]
            all_embeddings.extend(embed_batch(texts))

        vectors = np.array(all_embeddings, dtype="float32")
        faiss.normalize_L2(vectors)

        dimension = vectors.shape[1]
        index = faiss.IndexFlatIP(dimension)
        index.add(vectors)

        Path(INDEX_PATH).parent.mkdir(parents=True, exist_ok=True)
        faiss.write_index(index, INDEX_PATH)

        for position, job in enumerate(jobs):
            job.faiss_index = position
        db.commit()
    finally:
        db.close()


def ensure_faiss_index() -> faiss.Index:
    if not Path(INDEX_PATH).exists():
        print("FAISS index not found. Building from database...")
        _build_faiss_index()
        print("FAISS index built successfully")
    else:
        print("FAISS index found. Loading...")
    return faiss.read_index(INDEX_PATH)
