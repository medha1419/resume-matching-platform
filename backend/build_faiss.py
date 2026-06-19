import numpy as np
import faiss

from database import SessionLocal
from embeddings import embed_batch
from models import Job

INDEX_PATH = "data/faiss_index.bin"
BATCH_SIZE = 32


def main():
    db = SessionLocal()
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
        print(f"Embedding job {start + 1} of {total}...")
        texts = [job.clean_description for job in batch]
        all_embeddings.extend(embed_batch(texts))

    vectors = np.array(all_embeddings, dtype="float32")
    faiss.normalize_L2(vectors)

    dimension = vectors.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(vectors)

    faiss.write_index(index, INDEX_PATH)

    for position, job in enumerate(jobs):
        job.faiss_index = position
    db.commit()
    db.close()

    print(f"FAISS index built with {total} vectors. Saved to {INDEX_PATH}")


if __name__ == "__main__":
    main()
