from database import Base, engine
import models  # noqa: F401  (ensures models are registered on Base.metadata)

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("Tables created successfully")
