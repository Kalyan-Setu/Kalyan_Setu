# 🇮🇳 Kalyan Setu (कल्याण सेतु)

<p align="center">
  <img src="frontend/src/assets/kalyan-setu-logo.png" alt="Kalyan Setu Logo" width="180" />
</p>

<p align="center">
  <strong>Next-Generation Multilingual Civic Redressal & Autonomous Government Intelligence Platform</strong><br>
  <em>Bridging Citizen Voices with Rapid Administrative Action Powered by LangGraph, Sarvam AI, and Supabase PostgreSQL.</em>
</p>

<p align="center">
  <img alt="React 19" src="https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react&logoColor=black" />
  <img alt="Vite 6" src="https://img.shields.io/badge/Bundler-Vite%206-646CFF?logo=vite&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwindcss&logoColor=white" />
  <img alt="FastAPI" src="https://img.shields.io/badge/Backend-FastAPI%200.115-009688?logo=fastapi&logoColor=white" />
  <img alt="Python 3.10+" src="https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white" />
  <img alt="LangGraph" src="https://img.shields.io/badge/AI-LangGraph%20Agentic-FF6F00?logo=langchain&logoColor=white" />
  <img alt="Sarvam AI" src="https://img.shields.io/badge/STT-Sarvam%20AI%20(Saaras%3Av3)-8A2BE2" />
  <img alt="Groq" src="https://img.shields.io/badge/Inference-Groq%20Llama%203.3-F55036?logo=groq&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?logo=supabase&logoColor=white" />
</p>

<p align="center">
  <a href="https://kalyan-setu-nikjxs3ax-subhampadhi33537-collabs-projects.vercel.app" target="_blank">
    <img alt="Live Web App" src="https://img.shields.io/badge/🚀_Live_Demo-Vercel_Frontend-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  </a>
  &nbsp;
  <a href="https://kalyan-setu.onrender.com/health" target="_blank">
    <img alt="API Backend" src="https://img.shields.io/badge/⚡_Live_API-Render_Backend-46E3B7?style=for-the-badge&logo=render&logoColor=white" />
  </a>
</p>

<p align="center">
  🌐 <strong>Live Frontend (Vercel):</strong> <a href="https://kalyan-setu-nikjxs3ax-subhampadhi33537-collabs-projects.vercel.app" target="_blank">kalyan-setu-nikjxs3ax-subhampadhi33537-collabs-projects.vercel.app</a><br/>
  ⚡ <strong>Live Backend API (Render):</strong> <a href="https://kalyan-setu.onrender.com" target="_blank">https://kalyan-setu.onrender.com</a> (Health: <a href="https://kalyan-setu.onrender.com/health" target="_blank"><code>/health</code></a>)
</p>

---

## 📑 Table of Contents

- [🌟 Platform Overview](#-platform-overview)
- [✨ Core Capabilities](#-core-capabilities)
  - [👥 Citizen Experience](#-citizen-experience)
  - [🏛️ Government Command Center](#️-government-command-center)
  - [🤖 AI & Autonomous Intelligence](#-ai--autonomous-intelligence)
- [🏛️ System Architecture](#️-system-architecture)
  - [High-Level Platform Topology](#high-level-platform-topology)
  - [End-to-End Grievance Lifecycle](#end-to-end-grievance-lifecycle)
  - [8-Node LangGraph Agentic Triage Engine](#8-node-langgraph-agentic-triage-engine)
- [🎙️ Multilingual & Multimodal Ingestion](#️-multilingual--multimodal-ingestion)
- [🗺️ Geographic Intelligence & Spatial Mapping](#️-geographic-intelligence--spatial-mapping)
- [📊 0/1 Knapsack Budget Optimization & Semantic Clustering](#-01-knapsack-budget-optimization--semantic-clustering)
- [💻 Technology Stack](#-technology-stack)
- [🗄️ Database Architecture & Schema](#️-database-architecture--schema)
- [🔌 API Reference](#-api-reference)
- [🚀 Quick Start & Installation](#-quick-start--installation)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [⚙️ Environment Configuration](#️-environment-configuration)
- [📂 Project Structure](#-project-structure)
- [🔒 Security & Production Best Practices](#-security--production-best-practices)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## 🌟 Platform Overview

**Kalyan Setu** (*"Bridge of Welfare"*) is a full-stack, enterprise-grade civic governance solution engineered for modern Indian municipal and state administration. It dismantles traditional bureaucratic friction by allowing citizens to lodge civic grievances through **voice in regional languages (Odia, Hindi, English)**, **photo evidence**, or **structured text**, while simultaneously giving authorities an **autonomous 8-node LangGraph triage agent**, **real-time spatial heatmaps**, and **algorithmic budget optimization**.

### Why Kalyan Setu?
- 🎙️ **Zero Language Barrier:** Integrated with **Sarvam AI `saaras:v3`** to accurately transcribe Indian languages (including Odia and Hindi) and expand raw voice complaints into formal, legal-grade municipal tickets.
- ⚡ **Automated 8-Stage Triage:** Replaces manual sorting with an explainable AI pipeline that classifies issues, scores severity (0–100) using a 5-factor risk model, maps municipal departments, recommends budgets in INR, and self-checks feasibility with a critic node.
- 📍 **Geographic Command:** Live interactive Leaflet map featuring real-time cluster markers, district hazard heatmaps, and pinpoint location detection.
- 💰 **Resource Allocation Intelligence:** Implements a dynamic programming **0/1 Knapsack algorithm** to maximize civic impact under strict municipal budget constraints.
- 🔒 **High-Performance Architecture:** Pure asynchronous Python backend (`FastAPI` + `asyncpg` connection pool directly to Supabase PostgreSQL) ensuring zero ORM overhead and high throughput.

---

## ✨ Core Capabilities

### 👥 Citizen Experience
* **Multimodal Reporting:** Submit complaints via raw voice recording, camera photo uploads, or descriptive text.
* **Regional Voice Processing:** Native support for **Odia (ଓଡ଼ିଆ)**, **Hindi (हिन्दी)**, and Indian English with automatic script preservation.
* **Milestone Status Tracker:** Live 5-stage progress pipeline (`Submitted` ➔ `Under Review` ➔ `Action Assigned` ➔ `In Progress` ➔ `Resolved`).
* **Real-time Map Pinpointing:** Interactive map picker to precisely pinpoint infrastructure damage locations with auto-reverse geocoding.
* **Direct Citizen Follow-ups:** Add timestamped notes, progress queries, and supplemental photos to ongoing grievances.
* **Secure Citizen Profiles:** Mobile-first authentication with 10-digit Indian phone verification and bcrypt encrypted credentials.

### 🏛️ Government Command Center
* **Executive State Dashboard:** High-level metrics for total complaints, critical priority alerts, category distributions, and district breakdown.
* **Interactive GIS Grievance Map:** Comprehensive spatial visualization with color-coded severity markers, radius clustering, and detail drawers.
* **Administrative Action Hub:** One-click assignment of departments (PWD, MCD, Jal Board, DISCOM), executive officers, SLA timeframes, and budget allocations.
* **Bulk Triage & Operations:** Batch status transitions, multi-ticket department assignment, and CSV export for field teams.
* **District Risk Heatmaps:** Live density heatmaps highlighting persistent civic pain points across districts and municipal wards.

### 🤖 AI & Autonomous Intelligence
* **8-Node LangGraph Agent:** Comprehensive deep comprehension, categorization, 5-factor risk scoring, routing, budget recommendation, and critic validation.
* **5-Factor Hazard Scoring:** Computes risk from Location Density, Priority Urgency, Problem Type Safety Impact, and Description Distress Signals.
* **Semantic Clustering (TF-IDF + KMeans):** Groups hundreds of disparate complaints into actionable systemic municipal themes.
* **Municipal RAG Chat Assistant:** Real-time conversational assistant enabling administrators to query complaints, cross-reference hotspots, and draft executive directives.

---

## 🏛️ System Architecture

### High-Level Platform Topology

```mermaid
flowchart TB
    subgraph Citizens["👥 Citizen Layer"]
        C1["📱 Mobile / Web Browser"]
        C2["🎙️ Voice Recorder (Odia / Hindi / English)"]
        C3["📸 Camera / Photo Upload"]
    end

    subgraph Officials["🏛️ Government Administration Layer"]
        O1["💻 Executive Portal"]
        O2["🗺️ Spatial GIS Map & Heatmaps"]
        O3["📈 Analytics & 0/1 Knapsack Budgeting"]
        O4["💬 Official RAG Assistant"]
    end

    subgraph Client["🖥️ Single Page Application (React 19 + Vite)"]
        SPA["React SPA (Context API + Tailwind + Leaflet + Recharts)"]
    end

    subgraph Gateway["⚡ API Gateway (FastAPI)"]
        API["FastAPI 0.115 Async Server (Uvicorn)"]
        ROUTER_AUTH["🔐 Auth Router (/api/auth)"]
        ROUTER_PROB["📝 Problems Router (/api/problems)"]
        ROUTER_GOVT["🏛️ Govt Router (/api/govt)"]
        ROUTER_AI["🤖 AI Router (/api/ai)"]
        ROUTER_CONT["📬 Contact Router (/api/contact)"]
    end

    subgraph AI_Engine["🧠 AI & Multimodal Intelligence Engine"]
        SARVAM["🎙️ Sarvam AI (saaras:v3)\nMultilingual STT (Odia/Hindi)"]
        HF_VISION["👁️ Hugging Face BLIP\nVisual Hazard Analysis"]
        GROQ_LLM["⚡ Groq Llama 3.3 70B / 8B\nStructured Expansion & Triage"]
        LANGGRAPH["🕸️ 8-Node LangGraph\nGrievance Agentic Workflow"]
        ML_CLUST["📊 scikit-learn\nTF-IDF + KMeans + 0/1 Knapsack"]
    end

    subgraph Storage["🗄️ Persistence & Storage"]
        ASYNC_POOL["⚡ asyncpg Connection Pool (Direct SQL)"]
        SUPABASE[("🐘 Supabase PostgreSQL\n(Users, Problems, Govt, Inquiries)")]
        LOCAL_UPLOADS["📁 Local / Cloud File Storage (/uploads)"]
    end

    Citizens --> SPA
    Officials --> SPA

    SPA -->|REST API / JWT / Multipart FormData| API

    API --> ROUTER_AUTH
    API --> ROUTER_PROB
    API --> ROUTER_GOVT
    API --> ROUTER_AI
    API --> ROUTER_CONT

    ROUTER_PROB --> SARVAM
    ROUTER_PROB --> HF_VISION
    ROUTER_PROB --> GROQ_LLM
    ROUTER_PROB --> LOCAL_UPLOADS

    ROUTER_AI --> LANGGRAPH
    ROUTER_AI --> ML_CLUST
    ROUTER_AI --> GROQ_LLM

    ROUTER_AUTH --> ASYNC_POOL
    ROUTER_PROB --> ASYNC_POOL
    ROUTER_GOVT --> ASYNC_POOL
    ROUTER_AI --> ASYNC_POOL
    ROUTER_CONT --> ASYNC_POOL

    ASYNC_POOL --> SUPABASE
```

---

### End-to-End Grievance Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as 👤 Citizen
    participant SPA as 💻 React Frontend
    participant API as ⚡ FastAPI Backend
    participant STT as 🎙️ Sarvam AI / HF
    participant Agent as 🤖 LangGraph Agent
    participant DB as 🐘 Supabase PostgreSQL
    actor Official as 🏛️ Govt Official

    Citizen->>SPA: Record Audio (Odia/Hindi) or Upload Photo
    SPA->>API: POST /api/problems (Multipart Form Data)
    alt Voice Recording Provided
        API->>STT: Send Audio Bytes to Sarvam AI (saaras:v3)
        STT-->>API: Raw Transcript (e.g. ଓଡ଼ିଆ ଭାଷା)
        API->>API: Groq LLM Formal Complaint Generator (Title & Description)
    end
    API->>DB: INSERT INTO problems (status='Submitted', display_id='PPxxxxx')
    API-->>SPA: Return Complaint Confirmation with Display ID
    SPA-->>Citizen: Display Live Tracking Timeline

    Note over Official, Agent: Automated or On-Demand Administrative Triage
    Official->>SPA: View AI Analysis Dashboard
    SPA->>API: POST /api/ai/analyze-complaint/{display_id}
    API->>Agent: Run 8-Node Agentic Workflow
    Agent->>Agent: Understand ➔ Classify ➔ Score (5 Factors) ➔ Route ➔ Budget ➔ Critic Review
    Agent-->>API: Return Structured Recommendation (Department, Officer, Budget, SLA)
    API-->>SPA: Render Explainable Decision Cards
    Official->>SPA: Approve & Apply Recommendation
    SPA->>API: POST /api/ai/apply-recommendation/{display_id}
    API->>DB: UPDATE problems (assigned_department, assigned_officer, budget, status='Action Assigned')
    DB-->>SPA: Real-time Updated Status
    SPA-->>Citizen: Notification: Complaint Action Assigned to Officer
```

---

### 8-Node LangGraph Agentic Triage Engine

Every grievance processed through the automated AI workflow passes through an 8-stage state graph built with **LangGraph**:

```mermaid
flowchart TD
    START([🚀 Start: Raw Complaint Data]) --> N1["1️⃣ Understanding Node\nDeep problem extraction & root cause"]
    N1 --> N2["2️⃣ Classification Node\nStandardised Civic Category Mapping"]
    N2 --> N3["3️⃣ Severity Node\n5-Factor Hazard Scoring (0–100)"]
    N3 --> N4["4️⃣ Routing Node\nDepartment & Executive Officer Assignment"]
    N4 --> N5["5️⃣ Actions Node\nField Directives, Equipment, Budget (INR), SLA"]
    N5 --> N6["6️⃣ Critic Node\nAgentic Self-Review, Feasibility & Sanity Check"]
    N6 --> N7["7️⃣ Structured Result Node\nNormalise to Strict JSON Schema Contract"]
    N7 --> END_NODE([🏁 Ready for Official One-Click Approval & DB Commit])

    classDef stage fill:#1E293B,stroke:#38BDF8,stroke-width:2px,color:#F8FAFC;
    classDef endpoint fill:#047857,stroke:#10B981,stroke-width:2px,color:#FFFFFF;
    class N1,N2,N3,N4,N5,N6,N7 stage;
    class START,END_NODE endpoint;
```

#### 5-Factor Hazard Scoring Model:
$$\text{Hazard Score} = \frac{\text{Location Density} + \text{Urgency} + \text{Problem Type Risk} + \text{Description Distress} + \text{Co-location Factor}}{5}$$
* If **Score > 65**, the platform automatically triggers an **Early Warning Red Alert** for government administrators.

---

## 🎙️ Multilingual & Multimodal Ingestion

Kalyan Setu solves India's civic reporting challenge with dedicated multimodal pipelines:

| Modality | Technology | Details | Fallback Strategy |
| :--- | :--- | :--- | :--- |
| **Odia Voice (ଓଡ଼ିଆ)** | **Sarvam AI `saaras:v3`** | Specialised STT for Indic languages (`od-IN`), preserving authentic Odia script. | OpenAI Whisper Large v3 via Hugging Face Router. |
| **Hindi Voice (हिन्दी)** | **Sarvam AI `saaras:v3`** | Accurate transcription of regional dialects and vocabulary (`hi-IN`). | Whisper Large v3 / Browser Web Speech API. |
| **English Voice** | **Sarvam AI / Whisper** | Fast transcription for urban Indian English (`en-IN`). | Browser SpeechSynthesis / Web Speech API. |
| **Formal Expansion** | **Groq Llama 3.3 70B** | Converts raw vernacular spoken thoughts into formal, legal municipal grievances. | Exact raw transcript preservation without hallucinated cities. |
| **Visual Evidence** | **Hugging Face BLIP** | Image-to-text scene description for potholes, collapsed walls, waterlogging. | Intelligent heuristic metadata parser (file size/hazard classification). |

---

## 🗺️ Geographic Intelligence & Spatial Mapping

The platform features a built-in GIS engine powered by **Leaflet** and **React-Leaflet**:
* 📍 **Draggable Pinpoint Selector:** When filing a complaint, citizens can drop a marker anywhere on the map; the system reverse-geocodes the coordinates into readable streets and landmarks.
* 🔴 **Severity-Based Pin Visualizer:** Official portals color-code pins dynamically:
  - 🔴 **Critical Severity (75–100):** Immediate hazard requiring same-day intervention.
  - 🟠 **High Severity (50–74):** Requires SLA action within 24–48 hours.
  - 🟡 **Medium / Low (< 50):** Routine municipal maintenance.
* 🗺️ **District Heatmap Layer:** Visualizes aggregate complaint density across state zones to pinpoint recurring infrastructure failures.

---

## 📊 0/1 Knapsack Budget Optimization & Semantic Clustering

Government departments operate under strict budgetary boundaries. Kalyan Setu includes an algorithmic decision support system:

1. **Semantic Text Clustering (TF-IDF + KMeans):**
   - Ingests all active grievances across a state or municipality.
   - Computes TF-IDF vector representations and clusters them into distinct systemic themes (e.g., *"Monsoon Drain Choking"*, *"Arterial Road Potholes"*, *"Transformer Failures"*).
2. **Deterministic 0/1 Knapsack Budget Allocator:**
   - Officials input a municipal budget threshold (e.g., ₹25,00,000).
   - Each clustered theme is assigned an **Estimated Repair Cost ($W$)** and an **Aggregate Priority Impact Value ($V$)**.
   - The dynamic programming solver selects the exact combination of infrastructure interventions that maximizes civic welfare without exceeding the budget.

---

## 💻 Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | `React 19`, `Vite 6` | High-speed Single Page Application with optimized bundle rendering |
| **Styling & Icons** | `Tailwind CSS`, `Lucide React` | Clean, responsive civic UI designed for mobile and desktop |
| **Data Visualization & GIS**| `Leaflet`, `React-Leaflet`, `Recharts` | Interactive geographical grievance maps, charts, and district heatmaps |
| **Backend Framework** | `FastAPI 0.115`, `Uvicorn` | Modern asynchronous Python web framework with auto OpenAPI docs |
| **Database & ORM Layer** | `Supabase PostgreSQL`, `asyncpg` | Zero-ORM direct async connection pool with statement cache tuning |
| **Agentic AI & Orchestration** | `LangGraph`, `LangChain Core` | Stateful multi-actor autonomous agent for civic triage |
| **LLM Inference** | `Groq Cloud` (Llama 3.3 70B & 8B) | Ultra-low-latency model execution with multi-model fallback chain |
| **Speech-to-Text (STT)** | `Sarvam AI (saaras:v3)`, `Whisper` | State-of-the-art multilingual Indian voice transcription |
| **Vision & Image Captioning**| `Salesforce BLIP Large` | Visual evidence classification and hazard detection |
| **ML & Clustering** | `scikit-learn`, `NumPy` | TF-IDF vectorization, KMeans clustering, 0/1 Knapsack DP optimizer |
| **Authentication** | `python-jose` (JWT), `passlib` (bcrypt) | Stateless role-based access control (Citizen vs. Official) |

---

## 🗄️ Database Architecture & Schema

Kalyan Setu uses **Supabase PostgreSQL** via direct asynchronous connection pooling (`asyncpg`). Tables are automatically synchronized at startup:

```mermaid
erDiagram
    USERS ||--o{ PROBLEMS : "submits"
    USERS {
        uuid id PK
        varchar full_name
        varchar email UK
        varchar phone UK
        text password_hash
        varchar state
        varchar district
        timestamptz created_at
    }

    GOVT_USERS {
        uuid id PK
        varchar email UK
        varchar department
        varchar state
        varchar officer_name
        text password_hash
        timestamptz created_at
    }

    PROBLEMS {
        uuid id PK
        varchar display_id UK "PPxxxxx format"
        uuid user_id FK
        varchar title
        text description
        text ai_summary
        varchar category
        varchar location
        varchar district
        varchar state
        varchar priority "Critical, High, Medium, Low"
        varchar status "Submitted, Under Review, Action Assigned, In Progress, Resolved"
        varchar evidence_type "text, photo, voice"
        text file_url
        text voice_transcript
        int ai_severity_score "0-100"
        varchar sentiment
        int theme_id
        varchar assigned_department
        varchar assigned_officer
        text action_notes
        varchar budget
        timestamptz created_at
        timestamptz updated_at
    }

    CONTACT_US {
        uuid id PK
        varchar name
        varchar email
        varchar subject
        text message
        timestamptz created_at
    }
```

---

## 🔌 API Reference

All backend routes are mounted under the `/api` prefix. Interactive Swagger/OpenAPI documentation is available at `http://127.0.0.1:8000/docs`.

### 🔐 Authentication (`/api/auth`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/citizen/register` | Public | Register new citizen account with phone & email validation |
| `POST` | `/api/auth/citizen/login` | Public | Login citizen via phone/email and receive JWT bearer token |
| `POST` | `/api/auth/official/login` | Public | Authenticate government administrator with state/department scope |
| `GET` | `/api/auth/me` | Bearer | Retrieve profile and role metadata for authenticated token |

### 📝 Grievance Reporting (`/api/problems`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/problems` | Citizen | Create new grievance with multipart voice/photo/text evidence |
| `GET` | `/api/problems/mine` | Citizen | Fetch list of complaints submitted by the authenticated citizen |
| `GET` | `/api/problems/{display_id}` | Bearer | Get full detail & milestone tracking for a specific complaint |
| `GET` | `/api/problems/state/{state}`| Official | List all grievances reported within a specific state |

### 🏛️ Government Administration (`/api/govt`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/govt/problems` | Official | Query, filter, and paginate through departmental complaints |
| `GET` | `/api/govt/problems/all` | Official | Cross-department overview of all state and national complaints |
| `PATCH`| `/api/govt/problems/{did}/status` | Official | Update milestone status, officer assignment, SLA notes, or budget |
| `POST` | `/api/govt/problems/bulk-assign` | Official | Bulk assign multiple tickets to a specific department and officer |
| `GET` | `/api/govt/dashboard/stats` | Official | Retrieve aggregate counts for statuses, categories, and priorities |

### 🤖 AI Intelligence & Triage (`/api/ai`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/analyse` | Official | Batch clustering (TF-IDF + KMeans), 5-factor severity, and hotspots |
| `POST` | `/api/ai/analyze-complaint/{did}` | Official | Run the autonomous 8-node LangGraph triage on a single complaint |
| `POST` | `/api/ai/apply-recommendation/{did}` | Official | Directly write AI-recommended department, officer, and budget to DB |
| `POST` | `/api/ai/chat` | Official | Ask the municipal RAG assistant questions over current state data |
| `POST` | `/api/ai/chat/stream` | Official | Server-sent event stream for real-time assistant responses |
| `POST` | `/api/ai/estimate-budget` | Official | Calculate AI emergency repair cost estimate for a complaint |

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- Supabase PostgreSQL Database (or local PostgreSQL)
- *(Optional but Recommended)*: Groq Cloud API Key & Sarvam AI Subscription Key

---

### 1. Clone Repository
```bash
git clone https://github.com/Kalyan-Setu/Kalyan_Setu.git
cd Kalyan_Setu
```

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS / Linux:
# source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file from template
copy ..\.env .env

# Initialize database schema and default admin
python seed_admin.py

# Launch FastAPI development server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
* The API will be live at `http://127.0.0.1:8000`
* Swagger API Docs available at `http://127.0.0.1:8000/docs`

---

### 3. Frontend Setup

In a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev -- --host 127.0.0.1 --port 5173
```
* Open your browser and navigate to `http://127.0.0.1:5173`

---

## ⚙️ Environment Configuration

Create a `.env` file in the root and in the `backend/` directory with the following variables:

```dotenv
# ==========================================
# 🐘 Database Configuration (Supabase PostgreSQL)
# ==========================================
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

# ==========================================
# 🔐 Authentication & Security
# ==========================================
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRY_HOURS=72

# ==========================================
# ⚡ Groq Cloud LLM Configuration
# ==========================================
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_PRIMARY_MODEL=openai/gpt-oss-120b
GROQ_FAST_MODEL=openai/gpt-oss-20b

# ==========================================
# 🎙️ Sarvam AI (Multilingual Indic STT - Odia/Hindi)
# ==========================================
SARVAM_API_KEY=your_sarvam_ai_api_key_here
SARVAM_STT_MODEL=saaras:v3

# ==========================================
# 🤗 Hugging Face (Vision & Fallback STT)
# ==========================================
HUGGINGFACEHUB_API_TOKEN=hf_your_huggingface_token_here

# ==========================================
# 🌐 Network & CORS (Render Backend & Vercel Frontend)
# ==========================================
# Backend CORS allowed origin:
FRONTEND_URL=https://kalyan-setu-nikjxs3ax-subhampadhi33537-collabs-projects.vercel.app

# Frontend API base URL (configured on Vercel):
VITE_API_BASE_URL=https://kalyan-setu.onrender.com
```

---

## 📂 Project Structure

```text
Kalyan_Setu/
├── backend/
│   ├── main.py                     # FastAPI application factory, middleware, CORS
│   ├── config.py                   # Environment configuration & model settings
│   ├── auth_utils.py               # Password hashing (bcrypt) & JWT verification
│   ├── seed_admin.py               # Table creation & initial official account seeding
│   ├── requirements.txt            # Python backend dependencies
│   ├── AI/
│   │   ├── workflow.py             # 8-Node LangGraph autonomous triage agent
│   │   ├── severity_agent.py       # 5-factor civic hazard scoring agent
│   │   ├── processor.py            # Multimodal handler (Sarvam AI STT, BLIP, Groq)
│   │   ├── analysis.py             # TF-IDF, KMeans clustering, 0/1 Knapsack DP
│   │   └── chatbot.py              # Context-aware official municipal assistant
│   ├── database/
│   │   ├── connection.py           # Direct asyncpg connection pool & SQL schemas
│   │   └── schemas.py              # Pydantic validation contracts
│   ├── routers/
│   │   ├── auth.py                 # Citizen & official authentication endpoints
│   │   ├── problems.py             # Complaint ingestion & citizen tracking
│   │   ├── govt.py                 # Administrative management & status patching
│   │   ├── ai.py                   # Agentic analysis, workflow, and chat endpoints
│   │   └── contact.py              # Public support & contact form handling
│   ├── scratch/                    # Test & validation scripts for AI / STT pipelines
│   └── uploads/                    # Local storage for grievance photos and audio
├── frontend/
│   ├── index.html                  # HTML entrypoint
│   ├── package.json                # Frontend package scripts & dependencies
│   ├── vite.config.js              # Vite configuration
│   └── src/
│       ├── App.jsx                 # Role-based route controller
│       ├── main.jsx                # React root mount
│       ├── context/
│       │   └── CivicContext.jsx    # Global grievance state, auth, and API requests
│       ├── components/
│       │   ├── Navbar.jsx          # Civic header with language selector & role toggle
│       │   ├── Footer.jsx          # Official footer with emergency contacts
│       │   ├── AdminSidebar.jsx    # Official portal navigation drawer
│       │   ├── AuthModal.jsx       # Unified Citizen / Official authentication modal
│       │   ├── GeographicGrievanceMap.jsx # Interactive Leaflet grievance cluster map
│       │   ├── ProblemLocationMap.jsx     # Draggable pin map for grievance submission
│       │   ├── DistrictHeatmap.jsx        # Ward-level grievance density heatmap
│       │   └── NotificationToast.jsx      # Animated action alert notifications
│       ├── pages/
│       │   ├── HomePage.jsx               # Civic landing page & national stats
│       │   ├── SubmitProblemPage.jsx      # Multimodal grievance submission wizard
│       │   ├── ProblemStatusPage.jsx      # Citizen 5-stage milestone tracking view
│       │   ├── CitizenDashboardPage.jsx   # Citizen grievance portfolio & history
│       │   ├── ProfilePage.jsx            # Citizen account details & district settings
│       │   ├── ContactUsPage.jsx          # Public inquiries & ticket generator
│       │   ├── AdminOverviewPage.jsx      # Official KPI dashboard & urgent alerts
│       │   ├── AdminComplaintsPage.jsx    # Master grievance table with search & filters
│       │   ├── AdminTakeActionPage.jsx    # Department routing, SLA, & budget assignment
│       │   └── AdminAiAnalysisPage.jsx    # AI clustering, 8-node agent review, & assistant
│       └── assets/
│           ├── kalyan-setu-logo.png       # Official emblem
│           └── parliament-bg.jpg          # Portal banner backdrop
├── .gitignore                      # Git ignore rules
└── README.md                       # Comprehensive project documentation
```

---

## 🔒 Security & Production Best Practices

1. **Environment Credentials:** Never commit raw API keys, passwords, or database credentials. Always load credentials through environment variables.
2. **Database Pooling:** The `asyncpg` pool sets `statement_cache_size=0`, which is mandatory when connecting to Supabase PgBouncer in Transaction mode to prevent `InvalidSQLStatementNameError`.
3. **Role-Based Token Isolation:** Citizen tokens and Government Official tokens have distinct role scopes (`role: citizen` vs. `role: official`) validated on all sensitive routes.
4. **File Upload Hardening:** Uploaded files are strictly validated against supported image and audio MIME types before being written to disk.

---

## 🤝 Contributing

Contributions to Kalyan Setu are welcome! To contribute:

1. **Fork the Repository**
2. **Create a Feature Branch:** `git checkout -b feature/NewAwesomeFeature`
3. **Commit Your Changes:** `git commit -m "feat: add regional voice feedback loop"`
4. **Push to the Branch:** `git push origin feature/NewAwesomeFeature`
5. **Open a Pull Request** with a detailed description of changes and test outcomes.

---

## 📜 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute for civic and educational initiatives.

<p align="center">
  Made with ❤️ for citizens and responsive public governance.
</p>
