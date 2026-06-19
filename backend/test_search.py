import numpy as np
import faiss

from database import SessionLocal
from embeddings import embed_text
from models import Job

INDEX_PATH = "data/faiss_index.bin"
QUERY = "Python developer with machine learning experience"
TOP_K = 5


def main():
    index = faiss.read_index(INDEX_PATH)

    query_vector = np.array([embed_text(QUERY)], dtype="float32")
    faiss.normalize_L2(query_vector)

    scores, indices = index.search(query_vector, TOP_K)

    db = SessionLocal()
    for rank, (score, idx) in enumerate(zip(scores[0], indices[0]), start=1):
        job = db.query(Job).filter(Job.faiss_index == int(idx)).first()
        title = job.job_title if job else "Unknown"
        print(f"Rank {rank}: {title} (score: {score:.2f})")
    db.close()


if __name__ == "__main__":
    main()
