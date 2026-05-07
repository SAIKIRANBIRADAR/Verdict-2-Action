# Verdict2Action

> From Court Judgments to Verified Action Plans

Verdict2Action is an AI-powered government decision-support platform that transforms lengthy court judgment PDFs into structured, explainable, and human-verified action plans.

The platform helps government departments process legal judgments faster, reduce manual effort, avoid missed deadlines, and improve compliance workflows through intelligent extraction, summarization, translation, and action tracking.

---

# Problem Statement

Government departments receive court judgments in lengthy PDF formats that contain critical legal directives, compliance instructions, deadlines, and appeal considerations.

Currently:

- Officials manually read complex legal documents
- Important directives are difficult to identify
- Deadlines and compliance actions may be missed
- Decision-making becomes slow and inefficient

Verdict2Action solves this by using AI to extract actionable insights from court judgments and present them in a structured, verified, and easy-to-understand workflow.

---

# Key Features

## AI Judgment Reader
- Extracts important information from court judgment PDFs
- Handles both scanned and digital PDFs
- Identifies:
  - Case details
  - Directives
  - Deadlines
  - Parties involved
  - Appeal considerations

---

## Smart Highlight View
Highlights important sections directly inside the judgment PDF using severity-based indicators:

- 🔴 Critical
- 🟠 Important
- 🟡 Informational

---

## Executive Brief Generator
Generates a concise 2–3 page AI-generated summary including:

- Case overview
- Key directives
- Compliance actions
- Important dates
- Appeal suggestions

---

## Multi-Language Translation
Supports translated executive briefs in:

- English
- Hindi
- Kannada

---

## AI Action Plan Engine
Creates structured action plans containing:

- Recommended action
- Responsible department
- Compliance steps
- Appeal recommendations
- Risk score
- Timelines

---

## Human Verification Workflow
Ensures reliability through a mandatory review layer.

Officials can:
- Approve
- Edit
- Reject

Only verified records move into dashboards and analytics.

---

## Case Dashboard
Provides department-wide visibility into:

- Pending actions
- Urgent cases
- Compliance timelines
- Case statuses

---

## Notifications & Alerts
Automated reminders for:

- Upcoming deadlines
- Compliance actions
- Appeal windows
- Pending reviews

---

## Analytics Dashboard
Displays system-wide insights:

- Total cases processed
- Urgent case count
- Compliance rates
- Department performance
- Average response time

---

# Tech Stack

## Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion

## Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- Celery + Redis

## AI & OCR
- OpenAI / Gemini API
- PaddleOCR
- pdfplumber
- PyMuPDF

## Deployment
- Vercel (Frontend)
- Render/Railway (Backend)
- Neon PostgreSQL

---

# System Architecture

```text
PDF Upload
    ↓
PDF Extraction (OCR/Text)
    ↓
AI Analysis Engine
    ↓
Structured JSON Output
    ↓
Action Plan Generator
    ↓
Human Verification
    ↓
Dashboard & Analytics

```
---
# Project Structure

```text
verdict2action/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── app/
│   └── public/
│
├── backend/
│   ├── app/
│   ├── api/
│   ├── services/
│   ├── models/
│   ├── workers/
│   └── prompts/
│
├── README.md
└── .env.example
```
---
# Installation
Clone Repository
```text
git clone https://github.com/yourusername/verdict2action.git
cd verdict2action
Frontend Setup
cd frontend
npm install
npm run dev
```
---
# Frontend runs on:

```text
http://localhost:3000
```
---
# Backend Setup
## Create Virtual Environment
```text
cd backend
python -m venv venv
```
## Windows
```text
venv\Scripts\activate
```
## Linux/Mac
```text
source venv/bin/activate
```
## Install Dependencies
```text
pip install -r requirements.txt
```
---
# Configure Environment Variables

## Create .env
```text
DATABASE_URL=
OPENAI_API_KEY=
GEMINI_API_KEY=
REDIS_URL=
JWT_SECRET=
```
---
## Run Backend
```text
uvicorn app.main:app --reload
```
## Backend runs on:
```text
http://localhost:8000
```
---
# Running Celery Worker
```text
celery -A app.workers.celery_worker worker --loglevel=info
```
---
# API Documentation

## Swagger docs available at:

```text
http://localhost:8000/docs
```
---
# Core Workflow
 1. Upload Judgment PDF

Users upload court judgments.

 2. AI Processing

System extracts legal text and analyzes directives.

 3. Output Selection

Users choose:

Highlighted PDF
Executive Brief
 4. Translation

Optional translated brief generation.

 5. Action Plan Generation

AI generates structured recommendations.

 6. Human Verification

Officials verify AI outputs.

7. Dashboard & Tracking

Approved records appear in dashboards and analytics.



## License

This project is built for hackathon and research purposes.

## Tagline

No missed directives. No missed deadlines.
