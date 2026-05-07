# Verdict 2 Action — Backend

> AI-powered government decision-support system that converts court judgment PDFs into structured, human-verified action plans.

## Architecture

```
backend/
├── app/
│   ├── api/             # FastAPI route modules (9 routers)
│   ├── core/            # Config, security, dependencies
│   ├── models/          # SQLAlchemy ORM models (6 tables)
│   ├── schemas/         # Pydantic request/response schemas
│   ├── services/        # Business logic (AI, PDF, OCR, translation)
│   ├── utils/           # File handling, logging
│   ├── workers/         # Celery async tasks
│   ├── db/              # Database setup, seeding
│   ├── prompts/         # AI prompt templates
│   ├── middleware/       # Error handling
│   └── main.py          # FastAPI app entry point
├── uploads/             # Uploaded PDF storage
├── generated/           # Generated brief PDFs
├── requirements.txt
├── .env.example
└── README.md
```

## Quick Start

### 1. Prerequisites
- Python 3.11+
- PostgreSQL (running on localhost:5432)
- Redis (optional, for Celery async tasks)

### 2. Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your database URL and API keys
```

### 3. Database Setup

```bash
# Create the PostgreSQL database
psql -U postgres -c "CREATE DATABASE verdict2action;"

# Tables are auto-created on startup
```

### 4. Run the Server

```bash
uvicorn app.main:app --reload --port 8000
```

Server starts at: **http://localhost:8000**
Swagger docs at: **http://localhost:8000/docs**

### 5. Seed Demo Data (Optional)

```bash
python -m app.db.seed
```

Creates:
- 3 users (admin/reviewer/viewer)
- 5 sample cases
- Sample notifications

### 6. Celery Worker (Optional)

For async PDF processing:

```bash
# Start Redis first, then:
celery -A app.workers.celery_app worker --loglevel=info
```

---

## API Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/signup` | Register new user | No |
| POST | `/auth/login` | Login, get JWT | No |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/upload/` | Upload judgment PDF | Yes |
| POST | `/extract/{case_id}` | Run AI extraction (sync) | Yes |
| POST | `/extract/{case_id}/async` | Run extraction (Celery) | Yes |
| GET | `/extract/{case_id}/status` | Check processing status | No |
| GET | `/cases/` | List cases (filtered) | Yes |
| GET | `/cases/{case_id}` | Case detail + extraction + plan | Yes |
| DELETE | `/cases/{case_id}` | Delete case | Yes |
| POST | `/action-plan/{case_id}` | Generate action plan | Yes |
| PUT | `/action-plan/{case_id}` | Edit action plan | Yes |
| POST | `/verification/{case_id}` | Approve/reject case | Reviewer+ |
| POST | `/translate/` | Translate text | Yes |
| GET | `/notifications/` | List notifications | Yes |
| POST | `/notifications/{id}/read` | Mark as read | Yes |
| POST | `/notifications/read-all` | Mark all read | Yes |
| GET | `/analytics/` | Dashboard analytics | Yes |
| GET | `/health` | Health check | No |

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@verdict2action.gov.in | admin123 |
| Reviewer | reviewer@verdict2action.gov.in | reviewer123 |
| Viewer | viewer@verdict2action.gov.in | viewer123 |

## Processing Pipeline

```
Upload PDF → Text Extraction (pdfplumber/PyMuPDF)
                 ↓ (if scanned)
              OCR (PaddleOCR/Tesseract)
                 ↓
           AI Analysis (OpenAI/Gemini/Mock)
                 ↓
           Action Plan Generation
                 ↓
           PDF Brief Generation (ReportLab)
                 ↓
           Human Verification (approve/edit/reject)
                 ↓
           Dashboard + Analytics
```

## AI Providers

Set `AI_PROVIDER` in `.env`:

| Value | Behavior |
|-------|----------|
| `mock` | Returns realistic demo data (default, no API key needed) |
| `openai` | Uses GPT-4o-mini via OpenAI API |
| `gemini` | Uses Gemini 1.5 Flash via Google AI |

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL + SQLAlchemy
- **Validation**: Pydantic v2
- **Auth**: JWT (python-jose + passlib)
- **PDF**: pdfplumber + PyMuPDF
- **OCR**: PaddleOCR / Tesseract
- **AI**: OpenAI / Google Gemini
- **Tasks**: Celery + Redis
- **PDF Gen**: ReportLab
- **Logging**: Loguru
