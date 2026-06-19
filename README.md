# Resume Matching Platform

An AI-powered job matching platform that uses semantic search to connect resumes with relevant job postings. Resumes and job descriptions are converted into NLP embeddings and compared using vector similarity, allowing candidates to find the best-matching roles in milliseconds. The backend is built with FastAPI and the frontend with React.

## How It Works

1. Job descriptions pre-embedded offline using all-MiniLM-L6-v2
2. User uploads resume PDF
3. Text extracted with pdfplumber
4. Resume embedded with same model → 384-dim vector
5. FAISS searches 1000+ job vectors in milliseconds
6. Optional location and salary filters applied post-search
7. Top 15 matches returned ranked by similarity score

## Tech Stack

| Tool | Purpose |
|------|---------|
| FastAPI | Backend API framework |
| sentence-transformers | Local embedding model (all-MiniLM-L6-v2) |
| FAISS | Vector similarity search |
| pdfplumber | PDF text extraction |
| PostgreSQL (Supabase) | Database for jobs, users, liked jobs |
| Cloudflare R2 | Resume PDF file storage |
| React | Frontend |
| Railway | Backend hosting |
| Vercel | Frontend hosting |

## Project Structure

```
resume-matching/
├── backend/              # FastAPI application
├── frontend/             # React application
├── scripts/
│   └── clean_data.py     # Job description cleaning pipeline
├── data/
│   ├── raw/               # Raw input files (not committed)
│   └── processed/         # Cleaned output files (not committed)
├── requirements.txt
├── .gitignore
└── README.md
```

## Setup Instructions

```bash
# Clone the repository
git clone https://github.com/<your-username>/resume-matching-platform.git
cd resume-matching-platform

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Place the raw Excel file
# Copy USER_JOB_DATA.xlsx into data/raw/

# Run the data cleaning script
python3 scripts/clean_data.py
```

## Feature Roadmap

**Phase 1 (building now)**
- Excel job data ingestion and cleaning pipeline
- Job description text cleaning and noise removal
- Location and salary extraction
- Resume PDF text extraction
- Embedding-based semantic matching with FAISS

**Phase 2 (later)**
- FastAPI backend with resume upload and match endpoints
- React frontend for resume upload and match results
- PostgreSQL storage for users, jobs, and liked jobs
- Location and salary filtering on search results

**Phase 3 (nice to have)**
- User authentication and saved searches
- Cloudflare R2 resume storage
- Deployment to Railway (backend) and Vercel (frontend)
- Job alerts and notifications
