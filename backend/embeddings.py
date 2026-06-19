from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"

_model = SentenceTransformer(MODEL_NAME)


def embed_text(text: str) -> list[float]:
    return _model.encode(text).tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    embeddings = _model.encode(texts, batch_size=32, show_progress_bar=False)
    return embeddings.tolist()
