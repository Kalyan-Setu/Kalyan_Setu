# Kalyan Setu

<p align="center">
  <img src="frontend/src/assets/kalyan-setu-logo.png" alt="Kalyan Setu" width="180" />
</p>

<p align="center">
  A full-stack civic grievance platform connecting citizen reports with government review, triage, action, and status tracking.
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=20232A" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" />
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white" />
  <img alt="Python" src="https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white" />
  <img alt="Database" src="https://img.shields.io/badge/Database-Supabase%20PostgreSQL%20%7C%20SQLite-3ECF8E?logo=supabase&logoColor=white" />
</p>

> **Project status:** The repository contains a working local development stack. The frontend, backend, database fallback, authentication, evidence upload, admin workflow, and AI fallback paths have been exercised locally. Production hardening and provider configuration are still required before public deployment.

## Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Using the Platform](#using-the-platform)
- [API Overview](#api-overview)
- [Database](#database)
- [AI and ML](#ai-and-ml)
- [Project Structure](#project-structure)
- [Testing and Quality Checks](#testing-and-quality-checks)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Overview

Kalyan Setu is a civic grievance redressal application with two role-based experiences:

- **Citizens** can register, authenticate, submit text/photo/voice complaints, track milestones, post follow-up notes, and contact support.
- **Government officials** can view complaints, filter and export records, assign departments and officers, update statuses, inspect dashboard metrics, and run AI-assisted state analysis.

The application uses a React single-page frontend and a FastAPI backend. Supabase PostgreSQL is the primary database for storing users, grievances, official assignments, and contact inquiries. SQLAlchemy with asyncpg provides the database access layer; local SQLite is used only as a development fallback when no PostgreSQL URL is configured.

## Features

### Citizen portal

- Citizen registration with normalized 10-digit Indian phone validation and `@gmail.com` validation.
- JWT bearer authentication with bcrypt password hashes.
- Dashboard with grievance counts, search, category filters, and status filters.
- Guided grievance submission with text description, photo upload, or browser voice recording.
- Browser Web Speech transcription when supported, with a recorded audio upload path.
- Multipart evidence persistence under the backend `uploads/` directory.
- Optional AI-assisted image description, voice transcription, and text summarization.
- Complaint tracking timeline: Submitted, Under Review, Action Assigned, In Progress, and Resolved.
- Citizen follow-up notes and profile editing in the current frontend session, plus contact inquiries with generated ticket IDs.

### Government portal

- Separate official login and role guard.
- State overview with complaint, priority, category, and district metrics.
- Complaint management with search, priority/category filters, status tabs, CSV export, bulk assignment, and status editing.
- Strategic action page for department, officer, budget, SLA, directive, and status updates.
- AI analysis page with clustering, hotspots, predictive directives, budget recommendations, and an official-facing chat assistant.

## Architecture

```mermaid
flowchart LR
    C[Citizen browser] --> F[React + Vite SPA]
    O[Official browser] --> F
    F -->|JWT / JSON / multipart| API[FastAPI API]
    API --> AUTH[Auth router]
    API --> PROB[Problems router]
    API --> GOVT[Government router]
    API --> AI[AI router]
    API --> CONTACT[Contact router]
    AUTH --> DB[(Supabase PostgreSQL)]
    PROB --> DB
    GOVT --> DB
    CONTACT --> DB
    PROB --> FILES[backend/uploads]
    AI --> ANALYSIS[TF-IDF + KMeans + budget DP]
    AI -. optional .-> GROQ[Groq API]
    PROB -. optional .-> HF[Hugging Face Inference API]
```

### Request and grievance workflow

```mermaid
sequenceDiagram
    participant Citizen
    participant SPA as React SPA
    participant API as FastAPI
    participant DB as SQLite / Supabase PostgreSQL
    participant AI as Optional AI providers

    Citizen->>SPA: Register or sign in
    SPA->>API: POST /api/auth/*
    API->>DB: Create or verify account
    API-->>SPA: JWT + user profile
    Citizen->>SPA: Submit grievance
    SPA->>API: Multipart POST /api/problems
    API->>DB: Persist complaint and metadata
    API->>AI: Enrich text, photo, or voice when configured
    API-->>SPA: Display ID and complaint response
    SPA->>API: GET /api/problems/mine
    API-->>SPA: Timeline-ready complaint data
    Citizen->>SPA: Follow up or track status
    SPA->>API: Official status endpoints when authorized
```

## Technology Stack

| Layer | Implementation |
| --- | --- |
| Frontend | React 19, React DOM, Vite 6, Tailwind CSS, Recharts |
| Backend | FastAPI, Uvicorn, Python multipart handling |
| Database access | SQLAlchemy 2 async ORM, `asyncpg`, `aiosqlite` |
| Primary database | Supabase PostgreSQL |
| Local fallback | SQLite database at `backend/kalyan_setu.db` |
| Authentication | JWT (`python-jose`), bcrypt password hashing |
| AI/ML | scikit-learn TF-IDF/KMeans, deterministic budget knapsack, Groq HTTP API, Hugging Face Inference API |
| Media | Pillow dependency, browser `MediaRecorder`, static file serving for uploaded evidence |

## Getting Started

### Prerequisites

- Python 3.10 or newer
- Node.js and npm
- Optional: a Supabase PostgreSQL database
- Optional: Groq and Hugging Face API credentials for external AI enrichment

### 1. Clone and enter the repository

```bash
git clone https://github.com/Kalyan-Setu/Kalyan_Setu.git
cd Kalyan_Setu
```

### 2. Install backend dependencies

```bash
cd backend
python -m venv venv
```

Activate the environment:

```powershell
# Windows PowerShell
.\venv\Scripts\Activate.ps1
```

```bash
# macOS / Linux
source venv/bin/activate
```

Install packages:

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Configure the backend

Create `backend/.env` using the variables in [Configuration](#configuration). Do not commit credentials. Configure the Supabase PostgreSQL connection string in `DATABASE_URL` when database persistence is required. If no usable PostgreSQL URL is configured, the connection layer falls back to `backend/kalyan_setu.db` for local development.

Initialize tables and the development official account:

```bash
python seed_admin.py
```

### 4. Install and run the frontend

```bash
cd ../frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

### 5. Run the backend

In another terminal:

```powershell
cd backend
venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Open `http://127.0.0.1:5173` in a browser. The API root is available at `http://127.0.0.1:8000/`, and FastAPI's interactive documentation is available at `http://127.0.0.1:8000/docs`.

## Configuration

The backend loads environment variables with `python-dotenv`. The frontend currently uses `http://localhost:8000/api` directly in `frontend/src/context/CivicContext.jsx` and `frontend/src/pages/ContactUsPage.jsx`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Recommended | Supabase PostgreSQL connection URL used by SQLAlchemy/asyncpg. If unavailable, local SQLite fallback is used. |
| `JWT_SECRET` | Yes for production | Secret used to sign bearer tokens. The code has a development fallback that must be replaced. |
| `FRONTEND_URL` | No | Additional frontend origin included in CORS configuration. |
| `GROQ_API_KEY` | No | Enables Groq summarization, impact estimation, and chatbot responses. |
| `HUGGINGFACEHUB_API_TOKEN` | No | Enables Hugging Face image captioning and speech-to-text calls. |

Example shape, with secrets omitted:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST:6543/postgres
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:5173
GROQ_API_KEY=
HUGGINGFACEHUB_API_TOKEN=
```

> **Security:** Never copy credentials from a local `.env` file into this README, source control, screenshots, or issue reports. Rotate any credential that has been exposed.

## Using the Platform

### Citizen flow

1. Select **Register** and create an account.
2. Sign in through the Citizen Portal.
3. Choose **Report a Problem** and select text, photo, or voice evidence.
4. Complete the grievance details and review the submission.
5. File the grievance and use the generated `PPxxxxx` display ID to track it.
6. Add a follow-up note from the timeline or edit profile details from **My Profile**.

### Official flow

1. Select **Switch to Government Portal**.
2. Authenticate through the Government Official form.
3. Review the overview and complaint queue.
4. Use filters, CSV export, bulk assignment, or status editing.
5. Open **Take Action** to issue department, officer, budget, SLA, and directive updates.
6. Open **AI Analysis** to run state analysis or query the complaint context through the assistant.

Development-only official account creation is supported by `backend/seed_admin.py` and the auto-seeding logic in the official login route. Replace development credentials and disable automatic account creation before production use.

## API Overview

All application routes are mounted below `/api`. Protected endpoints require `Authorization: Bearer <jwt>`.

### Authentication

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/citizen/register` | Public | Register a citizen and return a JWT. |
| `POST` | `/api/auth/citizen/login` | Public | Authenticate by phone or email. |
| `POST` | `/api/auth/official/login` | Public | Authenticate an official. |
| `GET` | `/api/auth/me` | Bearer | Decode and return the current token claims. |

### Citizen complaints and contact

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/problems` | Bearer | Create a multipart grievance with optional evidence file. |
| `GET` | `/api/problems/mine` | Bearer | List complaints owned by the current citizen. |
| `GET` | `/api/problems/{display_id}` | Bearer | Fetch one complaint with ownership enforcement for citizens. |
| `GET` | `/api/problems/state/{state_name}` | Official | List complaints for a state. |
| `POST` | `/api/contact` | Public | Persist a contact inquiry and return a ticket ID. |

### Government operations

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/govt/problems` | Official | List official complaint records. |
| `GET` | `/api/govt/problems/all` | Official | List all complaints across states. |
| `PATCH` | `/api/govt/problems/{display_id}/status` | Official | Update status, assignment, notes, or budget. |
| `POST` | `/api/govt/problems/bulk-assign` | Official | Assign multiple display IDs to a department and officer. |
| `GET` | `/api/govt/dashboard/stats` | Official | Return status, priority, category, and total counts. |

### AI operations

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/ai/analyse` | Official | Run clustering, scoring, impact, budget, hotspot, and early-warning analysis. |
| `POST` | `/api/ai/chat` | Official | Query the complaint context through the official assistant. |

Interactive OpenAPI documentation is generated by FastAPI at `/docs` when the backend is running.

## Database

Tables are created automatically during FastAPI startup through `create_tables()`.

| Table | Responsibility |
| --- | --- |
| `users` | Citizen identity, contact data, bcrypt password hash, state, and district. |
| `govt_users` | Official identity, department, state, officer name, and password hash. |
| `problems` | Grievance content, evidence metadata, AI fields, status, assignment, budget, and timestamps. |
| `contact_us` | Support/contact submissions and timestamps. |

Supabase PostgreSQL is the intended persistent datastore. SQLAlchemy/asyncpg is the async access layer used to read and write it. The default development fallback is `backend/kalyan_setu.db`, which is ignored by Git. There are no migration files in the repository; schema creation currently relies on SQLAlchemy metadata creation at startup.

> **Persistence note:** Complaint records and contact inquiries are persisted by the backend. Citizen follow-up notes and profile edits are currently managed in frontend state/local storage and are not exposed as dedicated backend update endpoints.

## AI and ML

The official analysis endpoint runs the following pipeline:

1. Build complaint text from titles and descriptions.
2. Group complaints with TF-IDF and KMeans; use hash bucketing if clustering fails.
3. Score themes using complaint count, priority weight, and average severity.
4. Ask Groq for optional plain-language impact and cost estimates.
5. Select a budget-fitting set of themes using a deterministic 0/1 knapsack algorithm.

The pipeline also calculates a sentiment index, district hotspots, and early-warning directives. Image captioning and speech transcription use Hugging Face when configured. Text cleanup, image classification, voice transcription, AI cost estimation, and chatbot responses all have local or deterministic fallback behavior so the core workflow can continue without external providers.

## Project Structure

```text
Kalyan_Setu/
├── backend/
│   ├── main.py                 # FastAPI app, CORS, lifespan, static uploads
│   ├── asgi.py                 # ASGI deployment entrypoint
│   ├── config.py               # Environment-backed configuration
│   ├── auth_utils.py           # bcrypt and JWT helpers
│   ├── seed_admin.py           # Table initialization and dev official seed
│   ├── requirements.txt
│   ├── AI/
│   │   ├── analysis.py         # Clustering, scoring, budget optimization
│   │   ├── chatbot.py          # Official complaint-context assistant
│   │   └── processor.py        # Text, image, voice enrichment
│   ├── database/
│   │   ├── connection.py       # Async engine and SQLite fallback
│   │   ├── models.py           # SQLAlchemy models
│   │   └── schemas.py          # Pydantic request/response contracts
│   └── routers/
│       ├── auth.py
│       ├── problems.py
│       ├── govt.py
│       ├── ai.py
│       └── contact.py
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx             # Role-aware page rendering
│       ├── context/            # Auth, navigation, API and complaint state
│       ├── components/         # Navbar, auth, admin sidebar, shared UI
│       ├── pages/              # Citizen and official screens
│       └── assets/              # Local logo and Parliament artwork
├── .env                        # Local environment file; do not commit secrets
└── README.md
```

## Testing and Quality Checks

The repository does not currently include an automated test suite or CI workflow. The following checks are available:

```bash
# Frontend production build
cd frontend
npm run build

# Backend startup smoke test
cd ../backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

For manual end-to-end verification, exercise registration/login, grievance submission in all three evidence modes, tracking, contact submission, official status updates, CSV export, AI analysis, and protected endpoint access. FastAPI's `/docs` page is useful for focused API checks.

## Deployment

### Backend

The repository includes `backend/asgi.py` for ASGI hosts such as Render or Gunicorn-compatible deployments:

```bash
cd backend
uvicorn asgi:app --host 0.0.0.0 --port ${PORT:-8000}
```

Set a production `DATABASE_URL`, strong `JWT_SECRET`, CORS origin, and AI provider variables. Ensure the deployment has writable or external storage for evidence uploads; the current implementation stores files on the local filesystem and serves them from `/uploads`.

### Frontend

Build the static Vite bundle:

```bash
cd frontend
npm run build
```

Deploy `frontend/dist` to a static host. Before deploying, replace the development API URL in the frontend with the deployed backend URL or place both services behind a reverse proxy that makes `http://localhost:8000/api` available from the browser. The repository does not currently include a frontend environment-variable abstraction, Dockerfile, infrastructure manifest, or CI/CD workflow.

## Screenshots

The repository currently includes local visual assets but no committed product screenshots. The hero artwork used by the application is available here:

![Kalyan Setu civic portal artwork](frontend/src/assets/parliament-bg.jpg)

Recommended screenshots for a future `docs/screenshots/` folder:

| Screenshot | Suggested capture |
| --- | --- |
| Citizen dashboard | Complaint counts, filters, and a submitted grievance card |
| Submit grievance | Evidence mode selection and review step |
| Status timeline | Milestones, citizen notes, and evidence container |
| Official overview | KPI cards, heatmap, and action queue |
| AI analysis | Clusters, hotspots, budget summary, and assistant |

## Contributing

1. Create a focused feature or fix branch.
2. Keep frontend and backend contracts synchronized.
3. Never commit `.env` files, database files, tokens, passwords, or generated uploads.
4. Run `npm run build` and a relevant manual/API smoke test before opening a pull request.
5. Describe database, API, authentication, or deployment changes clearly in the pull request.

## License

No `LICENSE` file is currently included in this repository. Add an explicit license before distributing the project or accepting external contributions under defined terms.

## Contributors

Kalyan Setu project contributors are listed in the repository's GitHub contributors view. Contributions should follow the workflow above and include validation evidence for user-facing or API changes.
